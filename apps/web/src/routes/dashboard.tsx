import { createFileRoute, useLocation } from "@tanstack/react-router";
import { HugeiconsIcon } from "@hugeicons/react";
import { FilePasteIcon } from "@hugeicons/core-free-icons";
import { motion } from "motion/react";
import {
  IconBrandTabler,
  IconSettings,
  IconUserBolt,
  IconLogout,
} from "@tabler/icons-react";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";

import {
  Sidebar,
  SidebarBody,
  SidebarLink,
} from "@The-Cart/ui/components/ui/sidebar";
import { Input } from "@The-Cart/ui/components/input";
import { useGlobalPaste } from "../hooks/useGlobalPaste";
import { useTRPCClient } from "../utils/trpc";
import { authClient } from "../lib/auth-client";

export const Route = createFileRoute("/dashboard")({
  component: RouteComponent,
  beforeLoad: async () => {
    const session = await authClient.getSession({
      fetchOptions: {
        credentials: "include",
      },
    });
    if (!session.data) {
      throw new Error("UNAUTHORIZED");
    }
    return { session: session.data };
  },
  errorComponent: ({ error }) => {
    if (error.message === "UNAUTHORIZED") {
      window.location.replace("/login");
      return null;
    }
    return <div>Error: {error.message}</div>;
  },
});

function RouteComponent() {
  const location = useLocation();
  const { session } = Route.useRouteContext();
  const [inputValue, setInputValue] = useState("");

  const handleLogout = async () => {
    await authClient.signOut();
    window.location.replace("/login");
  };

  const navLinks = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: <IconBrandTabler className="h-5 w-5 shrink-0" />,
    },
    {
      label: "Profile",
      href: "#",
      icon: <IconUserBolt className="h-5 w-5 shrink-0" />,
    },
    {
      label: "Settings",
      href: "#",
      icon: <IconSettings className="h-5 w-5 shrink-0" />,
    },
  ];
  const inputRef = useRef<HTMLInputElement>(null);
  const trpcClient = useTRPCClient();
  
  const createMutation = useMutation({
    mutationFn: (input: { url: string }) => trpcClient.cart.create.mutate(input),
    onSuccess: () => {
      toast.success("Item added to cart!");
      setInputValue("");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add item");
    },
  });

  const handlePaste = (text: string) => {
    setInputValue(text);
    inputRef.current?.focus();
    
    if (isValidUrl(text)) {
      createMutation.mutate({ url: text });
    } else {
      toast.error("Invalid URL. Please paste a valid URL.");
    }
  };

  useGlobalPaste({ onPaste: handlePaste });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue && isValidUrl(inputValue)) {
      createMutation.mutate({ url: inputValue });
    }
  };

  const handlePasteButtonClick = async () => {
    try {
      const text = await navigator.clipboard.readText();
      handlePaste(text);
    } catch (err) {
      toast.error("Failed to read clipboard");
    }
  };

  return (
    <div className="flex h-svh">
      <Sidebar>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
            <Logo />
            <div className="mt-8 flex flex-col gap-2">
              {navLinks.map((link, idx) => (
                <SidebarLink
                  key={idx}
                  link={link}
                  isActive={location.pathname === link.href}
                />
              ))}
              <button
                onClick={handleLogout}
                className="flex items-center justify-start gap-2 group/sidebar py-2 rounded-md px-2 transition-colors duration-200 hover:bg-sidebar-accent/50 text-neutral-700 dark:text-neutral-200 text-left w-full"
              >
                <IconLogout className="h-5 w-5 shrink-0 transition-transform duration-200 ease-in-out group-hover/sidebar:scale-110" />
                <span className="text-sm group-hover/sidebar:translate-x-1 transition-all duration-200 ease-in-out whitespace-pre inline-block !p-0 !m-0 text-neutral-700 dark:text-neutral-200">
                  Logout
                </span>
              </button>
            </div>
          </div>
          <div>
            <SidebarLink
              link={{
                label: session.user.name || session.user.email,
                href: "#",
                icon: (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-sm font-medium dark:bg-neutral-700">
                    {(session.user.name || session.user.email).charAt(0).toUpperCase()}
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
            <form 
              onSubmit={handleSubmit}
              className="flex w-full max-w-xs items-center overflow-hidden rounded-full border-2 bg-card shadow-sm transition-all focus-within:ring-2 focus-within:ring-primary/50"
            >
              <Input
                ref={inputRef}
                placeholder="Paste something here..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="h-12 flex-1 border-0 bg-transparent px-6 text-base shadow-none focus-visible:ring-0"
              />
              <button
                type="button"
                onClick={handlePasteButtonClick}
                className="flex h-12 w-14 items-center justify-center bg-transparent border-0 shadow-none appearance-none"
              >
                <HugeiconsIcon
                  icon={FilePasteIcon}
                  size={24}
                  className="text-primary"
                />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
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
