import { FcGoogle } from "react-icons/fc";
import { SiFacebook, SiInstagram, SiTiktok, SiWechat, SiXiaohongshu } from "react-icons/si";
import { Citrus, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

const platformIcons: Record<
  string,
  { Icon: React.ComponentType<{ className?: string; color?: string }>; color?: string }
> = {
  Facebook: { Icon: SiFacebook, color: "#1877F2" },
  Instagram: { Icon: SiInstagram, color: "#E4405F" },
  TikTok: { Icon: SiTiktok, color: "#1a1a1a" },
  "Google Review": { Icon: FcGoogle },
  Rednote: { Icon: SiXiaohongshu, color: "#f97316" },
  WeChat: { Icon: SiWechat, color: "#07C160" },
  Lemon8: { Icon: Citrus, color: "#eab308" },
};

export function PlatformIcon({ platform, className }: { platform: string; className?: string }) {
  const entry = platformIcons[platform];
  const Icon = entry?.Icon ?? Globe;

  return <Icon className={cn("size-4", className)} color={entry?.color} />;
}
