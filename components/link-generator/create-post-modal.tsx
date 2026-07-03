"use client";

import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { NewPostInput, Post } from "@/lib/mock-data";
import { PostPreviewModal } from "@/components/link-generator/post-preview-modal";
import { BatchCreatePanel } from "@/components/link-generator/batch-create-panel";
import { SheetsImportPanel } from "@/components/link-generator/sheets-import-panel";
import { getPlatformFields } from "@/components/link-generator/platform-fields";

type CreatePostModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  socialPlatformOptions: string[];
  onCreate: (post: NewPostInput) => void;
  onImportPosts: (posts: NewPostInput[]) => void;
  editingPost?: Post | null;
  onUpdate: (id: string, post: NewPostInput) => void;
};

const fieldClassName = "h-12 rounded-lg border-[#d1d5db] text-base";

function defaultPlatform(options: string[]) {
  return options.includes("Rednote") ? "Rednote" : (options[0] ?? "Rednote");
}

export function CreatePostModal({
  open,
  onOpenChange,
  socialPlatformOptions,
  onCreate,
  onImportPosts,
  editingPost,
  onUpdate,
}: CreatePostModalProps) {
  const isEditing = Boolean(editingPost);
  const [activeTab, setActiveTab] = useState<"single" | "batch" | "sheets">("single");
  const [socialPlatform, setSocialPlatform] = useState(defaultPlatform(socialPlatformOptions));
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [batch, setBatch] = useState("");
  const [mediaTab, setMediaTab] = useState<"images" | "video">("images");
  const [imageLinks, setImageLinks] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [videoLink, setVideoLink] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const imageLinkCount = imageLinks
    .split(",")
    .map((link) => link.trim())
    .filter(Boolean).length;
  const imageCount = imageFiles.length + imageLinkCount;
  const hasVideo = Boolean(videoFile) || videoLink.trim().length > 0;

  const platformFields = getPlatformFields(socialPlatform);
  const showTitle = platformFields.includes("title");
  const showDescription = platformFields.includes("description");
  const showImages = platformFields.includes("images");
  const showVideo = platformFields.includes("video");
  const showMediaTabs = showImages && showVideo;
  const activeMedia = showMediaTabs ? mediaTab : showImages ? "images" : "video";

  function resetForm() {
    setActiveTab("single");
    setSocialPlatform(defaultPlatform(socialPlatformOptions));
    setTitle("");
    setDescription("");
    setBatch("");
    setMediaTab("images");
    setImageLinks("");
    setImageFiles([]);
    setVideoLink("");
    setVideoFile(null);
  }

  useEffect(() => {
    if (!open || !editingPost) return;

    setActiveTab("single");
    setSocialPlatform(editingPost.socialPlatform);
    setTitle(editingPost.title);
    setDescription(editingPost.description);
    setBatch(editingPost.batch);
    setImageLinks(editingPost.imageLinks);
    setImageFiles([]);
    setVideoLink(editingPost.videoLink);
    setVideoFile(null);
    setMediaTab("images");
  }, [open, editingPost]);

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      resetForm();
    }
    onOpenChange(nextOpen);
  }

  function handleSubmit() {
    const input: NewPostInput = {
      title: title.trim() || "Untitled post",
      description: description.trim(),
      batch: batch.trim() || "Unassigned",
      socialPlatform,
      hasVideo,
      imageCount,
      imageLinks: imageLinks.trim(),
      videoLink: videoLink.trim(),
    };

    if (editingPost) {
      onUpdate(editingPost.id, input);
    } else {
      onCreate(input);
    }
    setPreviewOpen(false);
    handleOpenChange(false);
  }

  function handleImportPosts(posts: NewPostInput[]) {
    onImportPosts(posts);
    handleOpenChange(false);
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-xl p-6">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit" : "Create"}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update this post's content."
                : "Create a new post content that will be shared by your users."}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 inline-flex w-fit items-center gap-1 rounded-full bg-[#f1f5f4] p-1">
            <button
              type="button"
              onClick={() => setActiveTab("single")}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium",
                activeTab === "single"
                  ? "bg-[#5eead4] font-semibold text-white"
                  : "text-[#1a1a1a]"
              )}
            >
              Single post
            </button>
            {!isEditing && (
              <>
                <button
                  type="button"
                  onClick={() => setActiveTab("batch")}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-sm font-medium",
                    activeTab === "batch"
                      ? "bg-[#5eead4] font-semibold text-white"
                      : "text-[#1a1a1a]"
                  )}
                >
                  Batch Create
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("sheets")}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-sm font-medium",
                    activeTab === "sheets"
                      ? "bg-[#5eead4] font-semibold text-white"
                      : "text-[#1a1a1a]"
                  )}
                >
                  Upload by Sheets
                </button>
              </>
            )}
          </div>

          {activeTab === "batch" ? (
            <BatchCreatePanel
              socialPlatformOptions={socialPlatformOptions}
              onImport={handleImportPosts}
            />
          ) : activeTab === "sheets" ? (
            <SheetsImportPanel onImport={handleImportPosts} />
          ) : (
          <div className="mt-5 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-[#1a1a1a]">Social Platform</Label>
              <Select value={socialPlatform} onValueChange={(value) => value && setSocialPlatform(value)}>
                <SelectTrigger className={cn(fieldClassName, "w-full")}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {socialPlatformOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {showTitle && (
              <div className="space-y-1.5">
                <Label htmlFor="post-title" className="text-sm font-semibold text-[#1a1a1a]">
                  Title
                </Label>
                <Input
                  id="post-title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className={fieldClassName}
                />
              </div>
            )}

            {showDescription && (
              <div className="space-y-1.5">
                <Label htmlFor="post-description" className="text-sm font-semibold text-[#1a1a1a]">
                  Description
                </Label>
                <Textarea
                  id="post-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  className="min-h-[140px] rounded-lg border-[#d1d5db] text-base"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="post-batch" className="text-sm font-semibold text-[#1a1a1a]">
                Batch
              </Label>
              <Input
                id="post-batch"
                value={batch}
                onChange={(event) => setBatch(event.target.value)}
                className={fieldClassName}
              />
            </div>

            {(showImages || showVideo) && (
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-[#1a1a1a]">Media</Label>

                {showMediaTabs && (
                  <div className="flex gap-5 border-b border-[#e5e7eb]">
                    <button
                      type="button"
                      onClick={() => setMediaTab("images")}
                      className={cn(
                        "-mb-px border-b-2 pb-2 text-sm font-medium",
                        mediaTab === "images"
                          ? "border-[#2dd4bf] text-[#0f766e]"
                          : "border-transparent text-[#6b7280]"
                      )}
                    >
                      Images
                    </button>
                    <button
                      type="button"
                      onClick={() => setMediaTab("video")}
                      className={cn(
                        "-mb-px border-b-2 pb-2 text-sm font-medium",
                        mediaTab === "video"
                          ? "border-[#2dd4bf] text-[#0f766e]"
                          : "border-transparent text-[#6b7280]"
                      )}
                    >
                      Video
                    </button>
                  </div>
                )}

                {activeMedia === "images" ? (
                  <div className="space-y-3">
                    <Input
                      value={imageLinks}
                      onChange={(event) => setImageLinks(event.target.value)}
                      placeholder="eg. link1,link2,link3"
                      className={fieldClassName}
                    />
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(event) =>
                        setImageFiles(Array.from(event.target.files ?? []))
                      }
                    />
                    <button
                      type="button"
                      onClick={() => imageInputRef.current?.click()}
                      className="w-full rounded-lg bg-[#5eead4] py-3 text-sm font-semibold text-white"
                    >
                      Choose Files
                    </button>
                    <p className="text-sm text-[#6b7280]">
                      {imageFiles.length > 0
                        ? imageFiles.map((file) => file.name).join(", ")
                        : "No files chosen"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Input
                      value={videoLink}
                      onChange={(event) => setVideoLink(event.target.value)}
                      placeholder="eg. link1"
                      className={fieldClassName}
                    />
                    <input
                      ref={videoInputRef}
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={(event) => setVideoFile(event.target.files?.[0] ?? null)}
                    />
                    <button
                      type="button"
                      onClick={() => videoInputRef.current?.click()}
                      className="w-full rounded-lg bg-[#5eead4] py-3 text-sm font-semibold text-white"
                    >
                      Choose File
                    </button>
                    <p className="text-sm text-[#6b7280]">
                      {videoFile ? videoFile.name : "No file chosen"}
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setPreviewOpen(true)}
                className="rounded-lg border border-[#2dd4bf] px-5 py-2 text-sm font-semibold text-[#0f766e] hover:bg-[#2dd4bf]/10"
              >
                Preview
              </button>
            </div>
          </div>
          )}
        </DialogContent>
      </Dialog>

      <PostPreviewModal
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        socialPlatform={socialPlatform}
        title={title}
        description={description}
        batch={batch}
        mediaTab={mediaTab}
        imageFiles={imageFiles}
        imageLinks={imageLinks}
        videoFile={videoFile}
        videoLink={videoLink}
        onConfirm={handleSubmit}
        confirmLabel={isEditing ? "Save Changes" : "Create Post"}
      />
    </>
  );
}
