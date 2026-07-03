import { Wifi } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { SiFacebook, SiInstagram } from "react-icons/si";
import { cn } from "@/lib/utils";

type PlatformIconProps = {
  platform: string;
  size?: "lg" | "sm";
  className?: string;
};

const IG_GRADIENT = "bg-gradient-to-br from-[#833ab4] via-[#e1306c] to-[#fcaf45]";

export function PlatformIcon({ platform, size = "lg", className }: PlatformIconProps) {
  const box = size === "lg" ? "size-12 rounded-xl" : "size-9 rounded-full";
  const iconSize = size === "lg" ? "size-6" : "size-4";

  switch (platform) {
    case "Rednote":
    case "XHS Follow":
      return (
        <div
          className={cn(
            box,
            "flex shrink-0 items-center justify-center bg-[#e0303d]",
            className
          )}
        >
          <span
            className={cn(
              "font-bold text-white",
              size === "lg" ? "text-[10px] leading-tight" : "text-[8px] leading-tight"
            )}
          >
            小红书
          </span>
        </div>
      );
    case "Instagram Story":
    case "Instagram Follow":
      return (
        <div className={cn(box, "flex shrink-0 items-center justify-center", IG_GRADIENT, className)}>
          <SiInstagram className={cn(iconSize, "text-white")} />
        </div>
      );
    case "Facebook":
    case "Facebook Follow":
      return (
        <div
          className={cn(
            box,
            "flex shrink-0 items-center justify-center bg-[#1877F2]",
            className
          )}
        >
          <SiFacebook className={cn(iconSize, "text-white")} />
        </div>
      );
    case "Google Review":
      return (
        <div
          className={cn(box, "flex shrink-0 items-center justify-center bg-white", className)}
        >
          <FcGoogle className={iconSize} />
        </div>
      );
    case "WiFi Connect":
      return (
        <div className={cn(box, "flex shrink-0 items-center justify-center", className)}>
          <Wifi className={cn(iconSize, "text-white")} />
        </div>
      );
    default:
      return (
        <div
          className={cn(
            box,
            "flex shrink-0 items-center justify-center bg-[#3f3f46]",
            className
          )}
        >
          <Wifi className={cn(iconSize, "text-white")} />
        </div>
      );
  }
}
