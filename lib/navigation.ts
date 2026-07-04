import {
  LayoutDashboard,
  Users,
  Star,
  QrCode,
  Megaphone,
  MessageCircle,
  Settings,
  Building2,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
};

export const navItems: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Businesses", href: "/businesses", icon: Building2 },
  { title: "Customers", href: "/customers", icon: Users },
  { title: "Reviews", href: "/reviews", icon: Star },
  { title: "QR Codes", href: "/qr-codes", icon: QrCode },
  { title: "Campaigns", href: "/campaigns", icon: Megaphone },
  { title: "WhatsApp", href: "/whatsapp", icon: MessageCircle },
  { title: "Settings", href: "/settings", icon: Settings },
];
