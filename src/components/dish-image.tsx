"use client";

import Image from "next/image";
import { useState } from "react";

import { FOOD_IMAGE_ASSETS, FOOD_IMAGE_FALLBACK, resolveFoodImage, type FoodVisual } from "@/lib/food-image";

type DishImageVariant = "compact" | "hero" | "thumbnail";

const BLUR_DATA_URL = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSIzMCI+PHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjMwIiBmaWxsPSIjZWRlM2Q0Ii8+PC9zdmc+";

const variantClasses: Record<DishImageVariant, string> = {
  compact: "h-32",
  hero: "h-56 sm:h-72",
  thumbnail: "size-12 shrink-0 rounded-2xl",
};

const imageSizes: Record<DishImageVariant, string> = {
  compact: "(max-width: 640px) 52vw, 208px",
  hero: "(max-width: 640px) 100vw, 640px",
  thumbnail: "48px",
};

export function DishImage({
  dish,
  variant = "hero",
  priority = false,
  className = "",
}: {
  dish: FoodVisual;
  variant?: DishImageVariant;
  priority?: boolean;
  className?: string;
}) {
  const resolved = resolveFoodImage(dish);
  const [failedSrc, setFailedSrc] = useState<string>();
  const fallback = FOOD_IMAGE_ASSETS[FOOD_IMAGE_FALLBACK];
  const asset = failedSrc === resolved.src ? fallback : resolved;
  const showLabel = variant !== "thumbnail";

  return (
    <div className={`relative isolate overflow-hidden bg-[#ede3d4] ${variantClasses[variant]} ${className}`}>
      <Image
        fill
        src={asset.src}
        alt={`${dish.name}美食展示图`}
        sizes={imageSizes[variant]}
        quality={84}
        priority={priority}
        placeholder="blur"
        blurDataURL={BLUR_DATA_URL}
        className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.025]"
        style={{ objectPosition: asset.objectPosition }}
        onError={() => setFailedSrc(resolved.src)}
      />
      {showLabel ? (
        <>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/55 via-black/12 to-transparent" />
          <span className="pointer-events-none absolute bottom-3 left-3 rounded-full border border-white/25 bg-black/28 px-2.5 py-1 text-[10px] font-black tracking-[0.08em] text-white shadow-sm backdrop-blur-sm">
            {dish.category}
          </span>
        </>
      ) : null}
    </div>
  );
}
