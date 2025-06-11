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
  Building2,
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
      plan: "Panel de Administración",
    },
  ],
  navGroups: [
    {
      title: "General",
      items: [
        {
          title: "Panel Principal",
          url: "/dashboard",
          icon: LayoutDashboard,
        },
        {
          title: "Campañas",
          url: "/dashboard/campaigns",
          icon: LayoutDashboard,
        },
        {
          title: "Usuarios",
          url: "/dashboard/users",
          icon: Users,
        },
        {
          title: "Personas Jurídicas",
          url: "/dashboard/legal-entities",
          icon: Building2,
        },
        {
          title: "Estadísticas",
          url: "/dashboard/analytics",
          icon: AreaChart,
        },
      ],
    },
  ],
};
