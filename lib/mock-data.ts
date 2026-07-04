export const dashboardStats = [
  {
    title: "Total Reviews",
    value: "12,847",
    change: "+18.2%",
    trend: "up" as const,
    description: "vs last month",
  },
  {
    title: "Avg. Rating",
    value: "4.8",
    change: "+0.3",
    trend: "up" as const,
    description: "across all locations",
  },
  {
    title: "Active Customers",
    value: "2,341",
    change: "+124",
    trend: "up" as const,
    description: "this month",
  },
  {
    title: "QR Scans",
    value: "8,492",
    change: "+32.1%",
    trend: "up" as const,
    description: "last 30 days",
  },
];

export const reviewTrendData = [
  { month: "Jan", reviews: 420, rating: 4.5 },
  { month: "Feb", reviews: 580, rating: 4.6 },
  { month: "Mar", reviews: 720, rating: 4.7 },
  { month: "Apr", reviews: 890, rating: 4.6 },
  { month: "May", reviews: 1050, rating: 4.8 },
  { month: "Jun", reviews: 1240, rating: 4.8 },
  { month: "Jul", reviews: 1380, rating: 4.9 },
];

export const ratingDistribution = [
  { rating: "5★", count: 8420 },
  { rating: "4★", count: 2890 },
  { rating: "3★", count: 980 },
  { rating: "2★", count: 340 },
  { rating: "1★", count: 217 },
];

export const campaignStatusData = [
  { name: "Active", value: 12, fill: "var(--chart-1)" },
  { name: "Scheduled", value: 5, fill: "var(--chart-2)" },
  { name: "Completed", value: 28, fill: "var(--chart-3)" },
  { name: "Paused", value: 3, fill: "var(--chart-4)" },
];

export const customers = [
  {
    id: "CUS-001",
    name: "Bella Vista Restaurant",
    email: "contact@bellavista.com",
    plan: "Enterprise",
    reviews: 342,
    rating: 4.9,
    status: "active",
    joined: "Jan 12, 2025",
  },
  {
    id: "CUS-002",
    name: "Urban Dental Clinic",
    email: "info@urbandental.com",
    plan: "Pro",
    reviews: 189,
    rating: 4.7,
    status: "active",
    joined: "Feb 3, 2025",
  },
  {
    id: "CUS-003",
    name: "FitLife Gym",
    email: "hello@fitlife.com",
    plan: "Pro",
    reviews: 256,
    rating: 4.6,
    status: "active",
    joined: "Mar 18, 2025",
  },
  {
    id: "CUS-004",
    name: "Serenity Spa",
    email: "book@serenityspa.com",
    plan: "Starter",
    reviews: 98,
    rating: 4.8,
    status: "trial",
    joined: "Apr 22, 2025",
  },
  {
    id: "CUS-005",
    name: "TechHub Coworking",
    email: "team@techhub.io",
    plan: "Enterprise",
    reviews: 412,
    rating: 4.5,
    status: "active",
    joined: "May 8, 2025",
  },
  {
    id: "CUS-006",
    name: "Green Leaf Café",
    email: "orders@greenleaf.com",
    plan: "Starter",
    reviews: 67,
    rating: 4.4,
    status: "inactive",
    joined: "Jun 1, 2025",
  },
];

export const reviews = [
  {
    id: "REV-4821",
    customer: "Bella Vista Restaurant",
    author: "Sarah M.",
    rating: 5,
    comment: "Absolutely incredible dining experience. The service was impeccable!",
    platform: "Google",
    date: "Jul 1, 2026",
    status: "published",
  },
  {
    id: "REV-4820",
    customer: "Urban Dental Clinic",
    author: "James K.",
    rating: 4,
    comment: "Professional staff and clean facility. Wait time was a bit long.",
    platform: "Google",
    date: "Jun 30, 2026",
    status: "published",
  },
  {
    id: "REV-4819",
    customer: "FitLife Gym",
    author: "Maria L.",
    rating: 5,
    comment: "Best gym in the area. Equipment is always well maintained.",
    platform: "Facebook",
    date: "Jun 29, 2026",
    status: "published",
  },
  {
    id: "REV-4818",
    customer: "Serenity Spa",
    author: "David R.",
    rating: 3,
    comment: "Massage was good but the room was too cold.",
    platform: "Google",
    date: "Jun 28, 2026",
    status: "flagged",
  },
  {
    id: "REV-4817",
    customer: "TechHub Coworking",
    author: "Emily T.",
    rating: 5,
    comment: "Great workspace with fast internet and friendly community.",
    platform: "Trustpilot",
    date: "Jun 27, 2026",
    status: "published",
  },
  {
    id: "REV-4816",
    customer: "Green Leaf Café",
    author: "Alex P.",
    rating: 4,
    comment: "Love the organic menu. Coffee could be stronger though.",
    platform: "Google",
    date: "Jun 26, 2026",
    status: "pending",
  },
];

export const qrCodes = [
  {
    id: "QR-001",
    name: "Main Entrance",
    customer: "Bella Vista Restaurant",
    scans: 1240,
    conversions: 892,
    status: "active",
    created: "Mar 15, 2025",
  },
  {
    id: "QR-002",
    name: "Receipt Footer",
    customer: "Bella Vista Restaurant",
    scans: 890,
    conversions: 654,
    status: "active",
    created: "Mar 15, 2025",
  },
  {
    id: "QR-003",
    name: "Reception Desk",
    customer: "Urban Dental Clinic",
    scans: 567,
    conversions: 423,
    status: "active",
    created: "Apr 2, 2025",
  },
  {
    id: "QR-004",
    name: "Front Desk",
    customer: "FitLife Gym",
    scans: 1102,
    conversions: 789,
    status: "active",
    created: "May 10, 2025",
  },
  {
    id: "QR-005",
    name: "Treatment Room",
    customer: "Serenity Spa",
    scans: 234,
    conversions: 198,
    status: "paused",
    created: "Jun 1, 2025",
  },
];

export const campaigns = [
  {
    id: "CAM-001",
    name: "Summer Review Drive",
    customer: "Bella Vista Restaurant",
    type: "SMS",
    sent: 2400,
    responses: 892,
    rate: "37.2%",
    status: "active",
    startDate: "Jun 1, 2026",
  },
  {
    id: "CAM-002",
    name: "Post-Visit Follow-up",
    customer: "Urban Dental Clinic",
    type: "Email",
    sent: 1200,
    responses: 456,
    rate: "38.0%",
    status: "active",
    startDate: "May 15, 2026",
  },
  {
    id: "CAM-003",
    name: "Member Appreciation",
    customer: "FitLife Gym",
    type: "WhatsApp",
    sent: 890,
    responses: 312,
    rate: "35.1%",
    status: "scheduled",
    startDate: "Jul 10, 2026",
  },
  {
    id: "CAM-004",
    name: "Holiday Special",
    customer: "Serenity Spa",
    type: "SMS",
    sent: 560,
    responses: 189,
    rate: "33.8%",
    status: "completed",
    startDate: "Dec 1, 2025",
  },
  {
    id: "CAM-005",
    name: "New Member Welcome",
    customer: "TechHub Coworking",
    type: "Email",
    sent: 340,
    responses: 128,
    rate: "37.6%",
    status: "paused",
    startDate: "Apr 20, 2026",
  },
];

export const whatsappMessages = [
  {
    id: "WA-001",
    contact: "Sarah M.",
    phone: "+1 (555) 123-4567",
    customer: "Bella Vista Restaurant",
    message: "Thank you for dining with us! We'd love your feedback.",
    status: "delivered",
    time: "2 min ago",
  },
  {
    id: "WA-002",
    contact: "James K.",
    phone: "+1 (555) 234-5678",
    customer: "Urban Dental Clinic",
    message: "How was your visit today? Rate us 1-5 stars.",
    status: "read",
    time: "15 min ago",
  },
  {
    id: "WA-003",
    contact: "Maria L.",
    phone: "+1 (555) 345-6789",
    customer: "FitLife Gym",
    message: "Thanks for working out with us! Share your experience.",
    status: "sent",
    time: "1 hr ago",
  },
  {
    id: "WA-004",
    contact: "David R.",
    phone: "+1 (555) 456-7890",
    customer: "Serenity Spa",
    message: "We hope you enjoyed your spa session!",
    status: "failed",
    time: "2 hr ago",
  },
  {
    id: "WA-005",
    contact: "Emily T.",
    phone: "+1 (555) 567-8901",
    customer: "TechHub Coworking",
    message: "Welcome to TechHub! Tell us about your first day.",
    status: "delivered",
    time: "3 hr ago",
  },
];

export type PostStatus = "active" | "inactive";

export type Post = {
  id: string;
  title: string;
  description: string;
  hasVideo: boolean;
  imageCount: number;
  imageLinks: string;
  videoLink: string;
  batch: string;
  socialPlatform: string;
  isUsed: boolean;
  status: PostStatus;
  createdAt: string;
};

export type NewPostInput = {
  title: string;
  description: string;
  batch: string;
  socialPlatform: string;
  hasVideo: boolean;
  imageCount: number;
  imageLinks?: string;
  videoLink?: string;
  status?: PostStatus;
};

export const postBatches = ["Batch #1", "Batch #2", "Batch #3"];

export const postSocialPlatforms = [
  "Facebook",
  "Instagram Story",
  "TikTok",
  "Google Review",
  "Rednote",
  "Weixin",
  "Lemon8",
];

export const recentActivity = [
  {
    id: 1,
    action: "New 5-star review",
    detail: "Bella Vista Restaurant — Sarah M.",
    time: "5 min ago",
  },
  {
    id: 2,
    action: "QR code scanned",
    detail: "FitLife Gym — Front Desk",
    time: "12 min ago",
  },
  {
    id: 3,
    action: "Campaign completed",
    detail: "Serenity Spa — Holiday Special",
    time: "1 hr ago",
  },
  {
    id: 4,
    action: "New customer onboarded",
    detail: "Green Leaf Café",
    time: "2 hr ago",
  },
  {
    id: 5,
    action: "WhatsApp message sent",
    detail: "Urban Dental Clinic — 24 recipients",
    time: "3 hr ago",
  },
];
