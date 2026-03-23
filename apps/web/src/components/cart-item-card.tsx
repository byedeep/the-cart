import { cn } from "@The-Cart/ui/lib/utils";
import { Button } from "@The-Cart/ui/components/button";
import { Input } from "@The-Cart/ui/components/input";
import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { CancelCircleIcon } from "@hugeicons/core-free-icons";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from "@The-Cart/ui/components/dropdown-menu";
import { IconDots, IconExternalLink, IconPencil, IconArchive, IconCheck } from "@tabler/icons-react";

type CartItemStatus = "saved" | "purchased" | "archived";
type CartItemPriority = "low" | "medium" | "high";

export interface CartItem {
    id: string;
    url: string;
    source: string;
    title: string;
    description: string;
    price?: string | null;
    currency?: string | null;
    imageUrl?: string | null;
    brand?: string | null;
    category?: string | null;
    tags: string[];
    priority: CartItemPriority;
    status: CartItemStatus;
    notes?: string | null;
    createdAt: Date | string;
}

interface CartItemCardProps {
    item: CartItem;
    onStatusChange?: (id: string, status: CartItemStatus) => void;
    onDelete?: (id: string) => void;
    onUpdate?: (id: string, data: Partial<CartItem>) => void;
}

export function CartItemCard({ item, onStatusChange, onDelete, onUpdate }: CartItemCardProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        title: item.title,
        price: item.price || "",
        currency: item.currency || "",
        imageUrl: item.imageUrl || "",
    });

    const formattedPrice =
        item.price
            ? (() => {
                const num = parseFloat(item.price.replace(/,/g, ""));
                if (isNaN(num)) return `${item.currency ? item.currency + " " : ""}${item.price}`;
                const formatted = num.toLocaleString("en-US", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2,
                });
                return `${item.currency ? item.currency + " " : ""}${formatted}`;
            })()
            : null;

    const hostname = (() => {
        try {
            return new URL(item.url).hostname.replace(/^www\./, "");
        } catch {
            return item.source;
        }
    })();

    const handleSave = () => {
        onUpdate?.(item.id, {
            title: editData.title,
            price: editData.price || null,
            currency: editData.currency || null,
            imageUrl: editData.imageUrl || null,
        });
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditData({
            title: item.title,
            price: item.price || "",
            currency: item.currency || "",
            imageUrl: item.imageUrl || "",
        });
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div className="group relative flex flex-col overflow-hidden rounded-3xl bg-card shadow-sm ring-1 ring-foreground/6">
                <div className="flex flex-1 flex-col gap-3 p-4">
                    <div>
                        <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                            Title
                        </label>
                        <Input
                            value={editData.title}
                            onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                            className="h-9 rounded-xl text-xs"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                                Price
                            </label>
                            <Input
                                value={editData.price}
                                onChange={(e) => setEditData({ ...editData, price: e.target.value })}
                                className="h-9 rounded-xl text-xs"
                                placeholder="e.g. 29.99"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                                Currency
                            </label>
                            <Input
                                value={editData.currency}
                                onChange={(e) => setEditData({ ...editData, currency: e.target.value })}
                                className="h-9 rounded-xl text-xs"
                                placeholder="e.g. USD"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                            Image URL
                        </label>
                        <Input
                            value={editData.imageUrl}
                            onChange={(e) => setEditData({ ...editData, imageUrl: e.target.value })}
                            className="h-9 rounded-xl text-xs"
                            placeholder="https://..."
                        />
                    </div>
                </div>
                <div className="flex items-center gap-2 border-t border-foreground/6 px-4 py-3">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1 justify-center rounded-xl"
                        onClick={handleCancel}
                    >
                        Cancel
                    </Button>
                    <Button
                        size="sm"
                        className="flex-1 justify-center rounded-xl"
                        onClick={handleSave}
                    >
                        Save
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="group relative flex flex-col overflow-hidden rounded-3xl bg-card shadow-sm ring-1 ring-foreground/6 transition-all duration-300 hover:shadow-lg hover:ring-foreground/12">
            {/* Delete button — appears on hover */}
            {onDelete && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(item.id);
                    }}
                    className="absolute right-5 top-5 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white opacity-0 backdrop-blur-md transition-all duration-200 hover:bg-red-500 group-hover:opacity-100"
                >
                    <HugeiconsIcon icon={CancelCircleIcon} size={14} />
                </button>
            )}

            {/* Image */}
            {item.imageUrl && (
                <div className="relative m-3 mb-0 overflow-hidden rounded-2xl bg-muted">
                    <div className="aspect-[5/4] w-full overflow-hidden">
                        <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = "none";
                            }}
                        />
                    </div>

                    {/* Brand badge */}
                    {item.brand && (
                        <div className="absolute left-2.5 top-2.5 rounded-full bg-white/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-800 shadow-sm backdrop-blur-md dark:bg-black/50 dark:text-neutral-200">
                            {item.brand}
                        </div>
                    )}

                    {/* Status indicator */}
                    {item.status !== "saved" && (
                        <div
                            className={cn(
                                "absolute right-2.5 top-2.5 rounded-full px-2.5 py-1 text-[10px] font-medium capitalize backdrop-blur-md shadow-sm",
                                item.status === "purchased"
                                    ? "bg-green-500/20 text-green-700 dark:text-green-300"
                                    : "bg-neutral-500/20 text-neutral-600 dark:text-neutral-300",
                            )}
                        >
                            {item.status}
                        </div>
                    )}
                </div>
            )}

            {/* Body */}
            <div className="flex flex-1 flex-col gap-1.5 px-4 pt-4 pb-3">
                {/* Title */}
                <h3 className="line-clamp-1 text-[15px] font-semibold leading-snug tracking-tight text-card-foreground">
                    {item.title}
                </h3>

                {/* Subtitle — source hostname */}
                <p className="text-[11px] text-muted-foreground">
                    {hostname}
                </p>

                {/* Description */}
                {item.description && (
                    <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground/80">
                        {item.description}
                    </p>
                )}
            </div>

            {/* Bottom action bar */}
            <div className="flex items-center justify-between px-4 pb-4 pt-1">
                {/* Price pill */}
                {formattedPrice ? (
                    <span className="rounded-full bg-muted px-3.5 py-1.5 text-[13px] font-semibold text-foreground">
                        {formattedPrice}
                    </span>
                ) : (
                    <span />
                )}

                <div className="flex items-center gap-1.5">
                    {/* More options menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger
                            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground opacity-0 transition-all duration-200 hover:bg-muted hover:text-foreground group-hover:opacity-100"
                        >
                            <IconDots className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side="top" align="end" sideOffset={4}>
                            <DropdownMenuItem onClick={() => setIsEditing(true)}>
                                <IconPencil className="mr-2 h-3.5 w-3.5" />
                                Edit
                            </DropdownMenuItem>
                            {item.status !== "purchased" && (
                                <DropdownMenuItem onClick={() => onStatusChange?.(item.id, "purchased")}>
                                    <IconCheck className="mr-2 h-3.5 w-3.5" />
                                    Mark as Bought
                                </DropdownMenuItem>
                            )}
                            {item.status !== "archived" && (
                                <DropdownMenuItem onClick={() => onStatusChange?.(item.id, "archived")}>
                                    <IconArchive className="mr-2 h-3.5 w-3.5" />
                                    Archive
                                </DropdownMenuItem>
                            )}
                            {onDelete && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        variant="destructive"
                                        onClick={() => onDelete(item.id)}
                                    >
                                        <HugeiconsIcon icon={CancelCircleIcon} size={14} className="mr-2" />
                                        Delete
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* View CTA button */}
                    <button
                        onClick={() => window.open(item.url, "_blank")}
                        className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background transition-all duration-200 hover:opacity-85 active:scale-95"
                    >
                        View
                        <IconExternalLink className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
