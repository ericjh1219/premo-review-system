import {
  LayoutDashboard,
  Users,
  Star,
  QrCode,
  Megaphone,
  MessageCircle,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
};

export const navItems: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Customers", href: "/customers", icon: Users },
  { title: "Reviews", href: "/reviews", icon: Star },
  { title: "QR Codes", href: "/qr-codes", icon: QrCode },
  { title: "Campaigns", href: "/campaigns", icon: Megaphone },
  { title: "WhatsApp", href: "/whatsapp", icon: MessageCircle },
  { title: "Settings", href: "/settings", icon: Settings },
];
