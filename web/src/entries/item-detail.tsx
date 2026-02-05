import { useEffect, useState } from "react";
import type { Item } from "../lib/types";
import { useOpenAiGlobal } from "../lib/hooks";
import { Badge } from "flowbite-react";

export default function ItemDetail() {
  const [item, setItem] = useState<Item>();
  const toolOutput = useOpenAiGlobal("toolOutput");

  useEffect(() => {
    try {
      const item = toolOutput?.item;
      if (item) {
        setItem(item);
      }
    } catch (error) {
      console.error("Error fetching item data:", error);
    }
  }, [toolOutput]);

  if (!item) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="mt-8 text-center">
          <h1 className="text-2xl font-bold text-foreground">Item not found</h1>
        </div>
      </div>
    );
  }

  const imageUrl = item.media_gallery_entries
    .find((entry) => !entry.disabled && entry.media_type === "image")
    ?.file;

  const statusLabel =
    item.status === 1
      ? "Active"
      : item.status === 2
        ? "Inactive"
        : "Draft";

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="grid gap-8 md:grid-cols-2">
          {/* Image Section */}
          <div>
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={item.name}
                className="w-full rounded-lg border border-border bg-secondary/30"
              />
            ) : (
              <div className="flex h-80 w-full items-center justify-center rounded-lg border border-border bg-secondary/30">
                <svg
                  className="h-12 w-12 text-muted-foreground/40"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            {/* Status Badge */}
            <div>
              <Badge>{statusLabel}</Badge>
            </div>

            {/* SKU */}
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                SKU
              </p>
              <p className="mt-1 text-foreground">{item.sku}</p>
            </div>

            {/* Item Name */}
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {item.name}
              </h1>
            </div>

            {/* Price */}
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Price
              </p>
              <p className="mt-1 text-3xl font-bold text-primary">
                ${item.price.toFixed(2)}
              </p>
            </div>

            {/* Description */}
            {item.description && <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Description
              </p>
              <p className="mt-1 text-foreground">{item.description}</p>
            </div>}
          </div>
        </div>
      </main>
    </div>
  );
}
