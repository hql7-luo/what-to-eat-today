import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function FlowHeading({
  eyebrow,
  title,
  description,
  backHref,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  backHref?: string;
}) {
  return (
    <div className="mb-7 sm:mb-9">
      {backHref ? (
        <Link href={backHref} className="quiet-button -ml-3 mb-3 w-fit px-3 text-sm">
          <ArrowLeft size={17} aria-hidden="true" />
          返回
        </Link>
      ) : null}
      <p className="numeric-type mb-2 text-xs font-black uppercase tracking-[0.18em] text-tomato-600">{eyebrow}</p>
      <h1 className="display-type max-w-3xl text-4xl font-black leading-[1.04] sm:text-5xl">{title}</h1>
      {description ? <p className="mt-3 max-w-2xl text-base leading-7 text-ink-500 sm:text-lg">{description}</p> : null}
    </div>
  );
}
