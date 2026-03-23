import { cn } from "@The-Cart/ui/lib/utils";
import { Button } from "@The-Cart/ui/components/button";

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

const STATUS_STYLES: Record<CartItemStatus, string> = {
    saved: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    purchased: "bg-green-500/10 text-green-600 dark:text-green-400",
    archived: "bg-neutral-500/10 text-neutral-500 dark:text-neutral-400",
};

const PRIORITY_DOT: Record<CartItemPriority, string> = {
    low: "bg-neutral-400",
    medium: "bg-amber-400",
    high: "bg-red-500",
};

interface CartItemCardProps {
    item: CartItem;
    onStatusChange?: (id: string, status: CartItemStatus) => void;
    onDelete?: (id: string) => void;
}

export function CartItemCard({ item, onStatusChange, onDelete }: CartItemCardProps) {
    const formattedPrice =
        item.price
            ? `${item.currency ? item.currency + " " : ""}${item.price}`
            : null;

    const hostname = (() => {
        try {
            return new URL(item.url).hostname.replace(/^www\./, "");
        } catch {
            return item.source;
        }
    })();

    return (
        <div className="group relative flex flex-col overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/8 transition-all duration-200 hover:ring-foreground/20 hover:shadow-md">
            {/* Image */}
            {item.imageUrl && (
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                    <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {/* Price badge over image */}
                    {formattedPrice && (
                        <div className="absolute bottom-2 left-2 rounded-full bg-black/60 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
                            {formattedPrice}
                        </div>
                    )}
                </div>
            )}

            {/* Body */}
            <div className="flex flex-1 flex-col gap-2 p-3.5">
                {/* Status + Priority row */}
                <div className="flex items-center gap-2">
                    <span
                        className={cn(
                            "rounded-full px-2 py-0.5 text-[10px] font-medium capitalize",
                            STATUS_STYLES[item.status],
                        )}
                    >
                        {item.status}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground capitalize">
                        <span className={cn("inline-block h-1.5 w-1.5 rounded-full", PRIORITY_DOT[item.priority])} />
                        {item.priority}
                    </span>
                    <span className="ml-auto text-[10px] text-muted-foreground">{hostname}</span>
                </div>

                {/* Brand + Title */}
                <div>
                    {item.brand && (
                        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                            {item.brand}
                        </p>
                    )}
                    <h3 className="line-clamp-2 text-sm font-medium leading-snug text-card-foreground">
                        {item.title}
                    </h3>
                </div>

                {/* Description */}
                {item.description && (
                    <p className="line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
                        {item.description}
                    </p>
                )}

                {/* Price (when no image) */}
                {!item.imageUrl && formattedPrice && (
                    <p className="text-base font-semibold text-foreground">{formattedPrice}</p>
                )}

                {/* Tags */}
                {item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {item.tags.slice(0, 4).map((tag) => (
                            <span
                                key={tag}
                                className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground"
                            >
                                {tag}
                            </span>
                        ))}
                        {item.tags.length > 4 && (
                            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                                +{item.tags.length - 4}
                            </span>
                        )}
                    </div>
                )}

                {/* Notes */}
                {item.notes && (
                    <p className="line-clamp-1 rounded-lg bg-muted/60 px-2.5 py-1.5 text-[11px] italic text-muted-foreground">
                        {item.notes}
                    </p>
                )}
            </div>

            {/* Footer actions */}
            <div className="flex items-center gap-1.5 border-t border-foreground/8 px-3.5 py-2.5">
                <Button
                    variant="ghost"
                    size="xs"
                    className="flex-1 justify-center"
                    onClick={() => window.open(item.url, "_blank")}
                >
                    View
                </Button>
                {item.status !== "purchased" && (
                    <Button
                        variant="ghost"
                        size="xs"
                        className="flex-1 justify-center text-green-600 hover:bg-green-500/10 hover:text-green-600 dark:text-green-400"
                        onClick={() => onStatusChange?.(item.id, "purchased")}
                    >
                        Bought
                    </Button>
                )}
                {item.status !== "archived" && (
                    <Button
                        variant="ghost"
                        size="xs"
                        className="flex-1 justify-center"
                        onClick={() => onStatusChange?.(item.id, "archived")}
                    >
                        Archive
                    </Button>
                )}
                {onDelete && (
                    <Button
                        variant="ghost"
                        size="icon-xs"
                        className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => onDelete(item.id)}
                    >
                        ×
                    </Button>
                )}
            </div>
        </div>
    );
}
