import { Organization } from "../types/sidebar.type";

export const mockOrganizations: Organization[] = [
  {
    id: "org-1",
    name: "Acme Corporation",
    avatar: "https://img.heroui.chat/image/avatar?w=200&h=200&u=1",
    folders: [
      {
        id: "folder-1",
        name: "Product Development",
        boards: [
          {
            id: "board-1",
            name: "Roadmap",
            color: "#3b82f6",
            taskCount: 24,
          },
          {
            id: "board-2",
            name: "Sprint Planning",
            color: "#10b981",
            taskCount: 18,
          },
        ],
      },
      {
        id: "folder-2",
        name: "Marketing",
        boards: [
          {
            id: "board-3",
            name: "Content Calendar",
            color: "#f59e0b",
            taskCount: 12,
          },
          {
            id: "board-4",
            name: "Campaign Tracker",
            color: "#8b5cf6",
            taskCount: 8,
          },
        ],
      },
      {
        id: "folder-3",
        name: "HR & Operations",
        boards: [
          {
            id: "board-5",
            name: "Recruitment",
            color: "#ec4899",
            taskCount: 5,
          },
          {
            id: "board-6",
            name: "Onboarding",
            color: "#14b8a6",
            taskCount: 3,
          },
        ],
      },
    ],
  },
  {
    id: "org-2",
    name: "Personal Projects",
    folders: [
      {
        id: "folder-4",
        name: "Side Hustles",
        boards: [
          {
            id: "board-7",
            name: "App Ideas",
            color: "#6366f1",
            taskCount: 7,
          },
          {
            id: "board-8",
            name: "Blog Posts",
            color: "#f43f5e",
            taskCount: 4,
          },
        ],
      },
      {
        id: "folder-5",
        name: "Learning",
        boards: [
          {
            id: "board-9",
            name: "Courses",
            color: "#0ea5e9",
            taskCount: 9,
          },
        ],
      },
    ],
  },
  {
    id: "org-3",
    name: "Startup Incubator",
    avatar: "https://img.heroui.chat/image/avatar?w=200&h=200&u=3",
    folders: [
      {
        id: "folder-6",
        name: "Investments",
        boards: [
          {
            id: "board-10",
            name: "Due Diligence",
            color: "#8b5cf6",
            taskCount: 15,
          },
          {
            id: "board-11",
            name: "Portfolio Review",
            color: "#06b6d4",
            taskCount: 11,
          },
        ],
      },
    ],
  },
];
