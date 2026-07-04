"use client";

import { useEffect, useMemo, useState } from "react";
import { BatchActionPanel } from "@/components/link-generator/batch-action-panel";
import { BottomNav } from "@/components/link-generator/bottom-nav";
import { CreatePostModal } from "@/components/link-generator/create-post-modal";
import { PostsPagination } from "@/components/link-generator/posts-pagination";
import { PostsTable } from "@/components/link-generator/posts-table";
import { PostsToolbar } from "@/components/link-generator/posts-toolbar";
import { Toast } from "@/components/link-generator/toast";
import { resolveBusinessId } from "@/lib/auth";
import { getBusinessById } from "@/lib/business";
import { postBatches, postSocialPlatforms, type NewPostInput, type Post } from "@/lib/mock-data";
import { loadPosts, savePosts } from "@/lib/post-storage";
import { canPerformCreateAction } from "@/lib/subscription";

const PAGE_SIZE = 6;

function nextPostId(posts: Post[]) {
  const maxId = posts.reduce((max, post) => {
    const match = /POST-(\d+)/.exec(post.id);
    const value = match ? Number(match[1]) : 0;
    return Math.max(max, value);
  }, 100);

  return `POST-${maxId + 1}`;
}

function toPost(input: NewPostInput, existingPosts: Post[]): Post {
  return {
    id: nextPostId(existingPosts),
    title: input.title,
    description: input.description,
    hasVideo: input.hasVideo,
    imageCount: input.imageCount,
    imageLinks: input.imageLinks ?? "",
    videoLink: input.videoLink ?? "",
    batch: input.batch,
    socialPlatform: input.socialPlatform,
    categoryId: input.categoryId ?? null,
    isUsed: false,
    status: input.status ?? "active",
    createdAt: new Date().toISOString(),
  };
}

export default function PostsPage() {
  const [businessId] = useState(resolveBusinessId);
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoaded, setPostsLoaded] = useState(false);
  const [search, setSearch] = useState("");
  const [batch, setBatch] = useState("all");
  const [socialPlatform, setSocialPlatform] = useState("all");
  const [usedFilter, setUsedFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setPosts(loadPosts(businessId));
    setPostsLoaded(true);
  }, [businessId]);

  useEffect(() => {
    if (!postsLoaded) return;
    savePosts(businessId, posts);
  }, [businessId, postsLoaded, posts]);

  const filteredPosts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return posts.filter((post) => {
      const matchesSearch = query.length === 0 || post.title.toLowerCase().includes(query);
      const matchesBatch = batch === "all" || post.batch === batch;
      const matchesPlatform = socialPlatform === "all" || post.socialPlatform === socialPlatform;
      const matchesUsed =
        usedFilter === "all" ||
        (usedFilter === "used" && post.isUsed) ||
        (usedFilter === "unused" && !post.isUsed);
      const matchesStatus = statusFilter === "all" || post.status === statusFilter;

      return matchesSearch && matchesBatch && matchesPlatform && matchesUsed && matchesStatus;
    });
  }, [posts, search, batch, socialPlatform, usedFilter, statusFilter]);

  const totalPages = Math.ceil(filteredPosts.length / PAGE_SIZE);
  const currentPage = Math.min(page, Math.max(totalPages, 1));

  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const visibleIds = paginatedPosts.map((post) => post.id);
  const allSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedIds.has(id));
  const someSelected = visibleIds.some((id) => selectedIds.has(id));

  function updateFilter(setter: (value: string) => void) {
    return (value: string) => {
      setter(value);
      setPage(1);
    };
  }

  function resetFilters() {
    setSearch("");
    setBatch("all");
    setSocialPlatform("all");
    setUsedFilter("all");
    setStatusFilter("all");
    setPage(1);
  }

  function handleCreatePost(input: NewPostInput) {
    setPosts((current) => [toPost(input, current), ...current]);
    resetFilters();
  }

  function handleImportPosts(inputs: NewPostInput[]) {
    setPosts((current) => {
      const newPosts = inputs.reduce<Post[]>((acc, input) => {
        acc.push(toPost(input, [...current, ...acc]));
        return acc;
      }, []);
      return [...newPosts, ...current];
    });
    resetFilters();
    setToastMessage(`${inputs.length} posts imported successfully.`);
  }

  function handleEditPost(post: Post) {
    setEditingPost(post);
    setCreateOpen(true);
  }

  function handleOpenCreate() {
    const business = getBusinessById(businessId);
    const gate = business ? canPerformCreateAction(business) : { allowed: true as const };
    if (!gate.allowed) {
      setToastMessage(gate.message);
      return;
    }
    setCreateOpen(true);
  }

  function handleUpdatePost(id: string, input: NewPostInput) {
    setPosts((current) =>
      current.map((post) =>
        post.id === id
          ? {
              ...post,
              title: input.title,
              description: input.description,
              hasVideo: input.hasVideo,
              imageCount: input.imageCount,
              imageLinks: input.imageLinks ?? "",
              videoLink: input.videoLink ?? "",
              batch: input.batch,
              socialPlatform: input.socialPlatform,
              categoryId: input.categoryId ?? null,
              status: input.status ?? post.status,
            }
          : post
      )
    );
    resetFilters();
  }

  function handleDeletePost(post: Post) {
    setPosts((current) => current.filter((existing) => existing.id !== post.id));
    setSelectedIds((current) => {
      const next = new Set(current);
      next.delete(post.id);
      return next;
    });
  }

  function handleCreateOpenChange(nextOpen: boolean) {
    setCreateOpen(nextOpen);
    if (!nextOpen) {
      setEditingPost(null);
    }
  }

  function handleToggleRow(id: string) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function handleToggleAll() {
    setSelectedIds((current) => {
      if (allSelected) {
        const next = new Set(current);
        visibleIds.forEach((id) => next.delete(id));
        return next;
      }
      return new Set([...current, ...visibleIds]);
    });
  }

  function handleUnselect() {
    setSelectedIds(new Set());
  }

  function handleBatchDelete() {
    setPosts((current) => current.filter((post) => !selectedIds.has(post.id)));
    setSelectedIds(new Set());
  }

  function handleEditBatch() {
    const newBatch = window.prompt("Enter the new batch name for the selected posts:");
    if (!newBatch || !newBatch.trim()) return;

    setPosts((current) =>
      current.map((post) =>
        selectedIds.has(post.id) ? { ...post, batch: newBatch.trim() } : post
      )
    );
    setSelectedIds(new Set());
  }

  function handleRestoreUsedState() {
    setPosts((current) =>
      current.map((post) => (selectedIds.has(post.id) ? { ...post, isUsed: false } : post))
    );
    setSelectedIds(new Set());
  }

  return (
    <div className="min-h-screen bg-[#fefce8] pb-28">
      <div className="mx-auto w-full max-w-6xl space-y-4 px-5 pt-6 sm:px-8 sm:pt-8">
        <PostsToolbar
          search={search}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          batch={batch}
          onBatchChange={updateFilter(setBatch)}
          batchOptions={postBatches}
          socialPlatform={socialPlatform}
          onSocialPlatformChange={updateFilter(setSocialPlatform)}
          socialPlatformOptions={postSocialPlatforms}
          usedFilter={usedFilter}
          onUsedFilterChange={updateFilter(setUsedFilter)}
          statusFilter={statusFilter}
          onStatusFilterChange={updateFilter(setStatusFilter)}
          onCreatePost={handleOpenCreate}
        />

        <div className="relative">
          <PostsTable
            posts={paginatedPosts}
            onEdit={handleEditPost}
            onDelete={handleDeletePost}
            selectedIds={selectedIds}
            onToggleRow={handleToggleRow}
            allSelected={allSelected}
            someSelected={someSelected}
            onToggleAll={handleToggleAll}
          />

          <BatchActionPanel
            selectedCount={selectedIds.size}
            onUnselect={handleUnselect}
            onDelete={handleBatchDelete}
            onEditBatch={handleEditBatch}
            onRestoreUsedState={handleRestoreUsedState}
          />
        </div>

        <PostsPagination page={currentPage} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <CreatePostModal
        open={createOpen}
        onOpenChange={handleCreateOpenChange}
        socialPlatformOptions={postSocialPlatforms}
        businessId={businessId}
        onCreate={handleCreatePost}
        onImportPosts={handleImportPosts}
        editingPost={editingPost}
        onUpdate={handleUpdatePost}
      />

      <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />

      <BottomNav />
    </div>
  );
}
