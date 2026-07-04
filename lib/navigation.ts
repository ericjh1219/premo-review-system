import {
  LayoutDashboard,
  Users,
  Star,
  QrCode,
  Megaphone,
  MessageCircle,
  Settings,
  Building2,
  UserCog,
  CreditCard,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
};

export const navItems: NavItem[] = [
  { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { title: "Businesses", href: "/admin/businesses", icon: Building2 },
  { title: "Users", href: "/admin/users", icon: UserCog },
  { title: "Customers", href: "/admin/customers", icon: Users },
  { title: "Reviews", href: "/admin/reviews", icon: Star },
  { title: "QR Codes", href: "/admin/qr-codes", icon: QrCode },
  { title: "Campaigns", href: "/admin/campaigns", icon: Megaphone },
  { title: "WhatsApp", href: "/admin/whatsapp", icon: MessageCircle },
  { title: "Settings", href: "/admin/settings", icon: Settings },
  { title: "Subscriptions", href: "/admin/subscriptions", icon: CreditCard },
];
