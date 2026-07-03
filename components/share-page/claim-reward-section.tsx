"use client";

import { useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { saveCustomerSubmission } from "@/lib/customer-submission-storage";

type ClaimRewardSectionProps = {
  businessId: string;
  showCustomerForm: boolean;
  showUploadProof: boolean;
  showLuckyDraw: boolean;
  luckyDrawPrize: string;
  onSubmitted: () => void;
};

export function ClaimRewardSection({
  businessId,
  showCustomerForm,
  showUploadProof,
  showLuckyDraw,
  luckyDrawPrize,
  onSubmitted,
}: ClaimRewardSectionProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [luckyDrawEntry, setLuckyDrawEntry] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!showCustomerForm && !showUploadProof && !showLuckyDraw) {
    return null;
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setProofImage(String(reader.result ?? ""));
    reader.readAsDataURL(file);
    event.target.value = "";
  }

  function handleSubmit() {
    saveCustomerSubmission(businessId, {
      name,
      phone,
      email,
      proofImage,
      luckyDrawEntry: showLuckyDraw && luckyDrawEntry,
    });

    setName("");
    setPhone("");
    setEmail("");
    setProofImage(null);
    setLuckyDrawEntry(false);
    onSubmitted();
  }

  return (
    <div className="space-y-3 rounded-2xl bg-[#0a0a0a] p-4">
      <h2 className="text-base font-bold text-white">Claim Your Reward</h2>

      {showCustomerForm && (
        <div className="space-y-2">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Name"
            className="h-11 w-full rounded-lg border border-[#3f3f46] bg-[#18181b] px-3 text-sm text-white outline-none placeholder:text-[#a1a1aa]"
          />
          <input
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="Phone"
            className="h-11 w-full rounded-lg border border-[#3f3f46] bg-[#18181b] px-3 text-sm text-white outline-none placeholder:text-[#a1a1aa]"
          />
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            placeholder="Email"
            className="h-11 w-full rounded-lg border border-[#3f3f46] bg-[#18181b] px-3 text-sm text-white outline-none placeholder:text-[#a1a1aa]"
          />
        </div>
      )}

      {showUploadProof && (
        <div>
          <p className="mb-1.5 text-xs font-medium text-[#a1a1aa]">Upload Proof</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          {proofImage ? (
            <div className="relative w-fit">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={proofImage}
                alt="Uploaded proof"
                className="size-28 rounded-lg object-cover"
              />
              <button
                type="button"
                aria-label="Remove uploaded proof"
                onClick={() => setProofImage(null)}
                className="absolute top-1 right-1 flex size-6 items-center justify-center rounded-full bg-black/70 text-white"
              >
                <X className="size-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex h-28 w-28 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-[#3f3f46] text-[#a1a1aa]"
            >
              <ImagePlus className="size-6" />
              <span className="text-xs">Upload</span>
            </button>
          )}
        </div>
      )}

      {showLuckyDraw && (
        <label className="flex items-center gap-2 rounded-lg bg-[#18181b] px-3 py-2.5 text-sm font-medium text-white">
          <input
            type="checkbox"
            checked={luckyDrawEntry}
            onChange={(event) => setLuckyDrawEntry(event.target.checked)}
            className="size-4 rounded accent-[#2dd4bf]"
          />
          Enter Lucky Draw — {luckyDrawPrize}
        </label>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        className="w-full rounded-xl bg-[#2dd4bf] py-3 text-sm font-bold text-black"
      >
        Submit
      </button>
    </div>
  );
}
