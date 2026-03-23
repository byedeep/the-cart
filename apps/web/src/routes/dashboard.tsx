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
import { useState, useRef, useEffect } from "react";
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
import { CartItemCard } from "../components/cart-item-card";

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

type CartItemRow = Awaited<
  ReturnType<ReturnType<typeof useTRPCClient>["cart"]["getAll"]["query"]>
>[number];

function RouteComponent() {
  const location = useLocation();
  const { session } = Route.useRouteContext();
  const [inputValue, setInputValue] = useState("");
  const [cartItems, setCartItems] = useState<CartItemRow[]>([]);
  const [cartLoading, setCartLoading] = useState(true);

  const inputRef = useRef<HTMLInputElement>(null);
  const trpcClient = useTRPCClient();

  const fetchCartItems = async () => {
    setCartLoading(true);
    try {
      const items = await trpcClient.cart.getAll.query();
      setCartItems(items);
    } catch {
      toast.error("Failed to load cart items");
    } finally {
      setCartLoading(false);
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, []);

  const createMutation = useMutation({
    mutationFn: (input: { url: string }) => trpcClient.cart.create.mutate(input),
    onSuccess: () => {
      toast.success("Item added to cart!");
      setInputValue("");
      fetchCartItems();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add item");
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: (input: { id: string; status: "saved" | "purchased" | "archived" }) =>
      trpcClient.cart.updateStatus.mutate(input),
    onSuccess: () => fetchCartItems(),
    onError: () => toast.error("Failed to update status"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => trpcClient.cart.delete.mutate({ id }),
    onSuccess: () => {
      toast.success("Item removed");
      fetchCartItems();
    },
    onError: () => toast.error("Failed to delete item"),
  });

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
    } catch {
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

      <div className="flex flex-1 overflow-hidden bg-sidebar p-4">
        <div className="flex flex-1 flex-col gap-6 overflow-hidden rounded-3xl bg-sidebar p-6 shadow-sm">
          {/* URL input */}
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
                disabled={createMutation.isPending}
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

          {/* Cart items grid */}
          <div className="flex-1 overflow-y-auto">
            {cartLoading ? (
              <CartSkeleton />
            ) : cartItems.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4 pb-4">
                {cartItems.map((item) => (
                  <CartItemCard
                    key={item.id}
                    item={{
                      ...item,
                      tags: item.tags ?? [],
                      priority: item.priority as "low" | "medium" | "high",
                      status: item.status as "saved" | "purchased" | "archived",
                    }}
                    onStatusChange={(id, status) =>
                      updateStatusMutation.mutate({ id, status })
                    }
                    onDelete={(id) => deleteMutation.mutate(id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CartSkeleton() {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/8 animate-pulse"
        >
          <div className="aspect-[4/3] w-full bg-muted" />
          <div className="flex flex-col gap-2 p-3.5">
            <div className="h-3 w-16 rounded-full bg-muted" />
            <div className="h-4 w-3/4 rounded bg-muted" />
            <div className="h-3 w-full rounded bg-muted" />
            <div className="h-3 w-2/3 rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
      <div className="text-4xl">🛒</div>
      <p className="text-sm font-medium text-foreground">Your cart is empty</p>
      <p className="text-xs text-muted-foreground">
        Paste a product URL above to save your first item
      </p>
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
