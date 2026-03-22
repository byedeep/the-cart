import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  IconArrowLeft,
  IconBrandTabler,
  IconSettings,
  IconUserBolt,
} from "@tabler/icons-react";

import {
  Sidebar,
  SidebarBody,
  SidebarLink,
} from "@The-Cart/ui/components/ui/sidebar";
import { Input } from "@The-Cart/ui/components/input";

export const Route = createFileRoute("/dashboard")({
  component: RouteComponent,
});

const links = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: (
      <IconBrandTabler className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
    ),
  },
  {
    label: "Profile",
    href: "#",
    icon: (
      <IconUserBolt className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
    ),
  },
  {
    label: "Settings",
    href: "#",
    icon: (
      <IconSettings className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
    ),
  },
  {
    label: "Logout",
    href: "#",
    icon: (
      <IconArrowLeft className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
    ),
  },
];

function RouteComponent() {
  return (
    <div className="flex h-svh">
      <Sidebar>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
            <Logo />
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
          </div>
          <div>
            <SidebarLink
              link={{
                label: "User",
                href: "#",
                icon: (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-sm font-medium dark:bg-neutral-700">
                    U
                  </div>
                ),
              }}
            />
          </div>
        </SidebarBody>
      </Sidebar>
      <div className="flex flex-1 bg-sidebar p-4">
        <div className="flex flex-1 flex-col gap-4 rounded-3xl bg-sidebar p-6 shadow-sm">
          <div className="flex items-center justify-center">
            <Input
              placeholder="Paste something here..."
              className="h-12 w-full max-w-xl rounded-full border-2 px-6 text-base shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-primary/50"
            />
          </div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p>Welcome to The Cart</p>
        </div>
      </div>
    </div>
  );
}

const Logo = () => (
  <a
    href="#"
    className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black dark:text-white"
  >
    <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-black dark:bg-white" />
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="whitespace-pre font-medium text-black dark:text-white"
    >
      The Cart
    </motion.span>
  </a>
);
