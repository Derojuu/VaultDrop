import { Reveal } from "@/components/motion/reveal";
import { MonoLabel } from "@/components/ui/mono-label";
import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  className,
}: {
  eyebrow: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
}) {
  return (
    <Reveal className={cn("max-w-[700px]", className)}>
      <MonoLabel tone="accent" className="mb-3.5 block">
        {eyebrow}
      </MonoLabel>
      <h2 className="text-vd-tx text-[clamp(30px,4.4vw,48px)] leading-[1.04] font-extrabold tracking-[-0.028em]">
        {title}
      </h2>
      {description && (
        <p className="text-vd-tx2 mt-4.5 max-w-[560px] text-base leading-relaxed">
          {description}
        </p>
      )}
    </Reveal>
  );
}
