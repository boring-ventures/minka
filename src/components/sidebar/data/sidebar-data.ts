import {
  AlertCircle,
  AppWindow,
  AudioWaveform,
  Ban,
  BellRing,
  Monitor,
  Bug,
  CheckSquare,
  Command,
  GalleryVerticalEnd,
  HelpCircle,
  LayoutDashboard,
  Lock,
  LockKeyhole,
  MessageSquare,
  Palette,
  Settings,
  ServerCrash,
  Wrench,
  UserCog,
  UserX,
  Users,
  AreaChart,
  HeartHandshake,
} from "lucide-react";
import type { SidebarData } from "../types";

export const sidebarData: SidebarData = {
  user: {
    name: "satnaing",
    email: "satnaingdev@gmail.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "MINKA",
      logo: HeartHandshake,
      plan: "Admin Dashboard",
    },
  ],
  navGroups: [
    {
      title: "General",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: LayoutDashboard,
        },
        {
          title: "Campaigns",
          url: "/dashboard/campaigns",
          icon: LayoutDashboard,
        },
        {
          title: "Users",
          url: "/dashboard/users",
          icon: Users,
        },
        {
          title: "Analytics",
          url: "/dashboard/analytics",
          icon: AreaChart,
        },
      ],
    },
  ],
};
