import { Share2, SlidersHorizontal, Upload } from "lucide-react";

import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/sections/section-heading";
import { Badge } from "@/components/ui/badge";

const STEPS = [
  {
    tag: "01",
    icon: Upload,
    title: "Upload & encrypt",
    body: "Drop in any file. It's encrypted on your device before it ever leaves — VaultDrop only ever receives ciphertext.",
  },
  {
    tag: "02",
    icon: SlidersHorizontal,
    title: "Set rules & seal",
    body: "Add the conditions a recipient must satisfy. The key and policy are sealed into Flare Confidential Compute.",
  },
  {
    tag: "03",
    icon: Share2,
    title: "Share & monitor",
    body: "Send a link or QR that enforces your rules, watch every unlock and attempt, and revoke access in one click.",
  },
];

/**
 * The sender's three-step journey. Complements the "boundary" section
 * (which describes the *data* flow) by describing the *user* flow.
 */
export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="mx-auto w-[min(1180px,calc(100%-2.5rem))] scroll-mt-24 pt-24"
    >
      <SectionHeading
        eyebrow="How it works"
        title="From file to sealed vault in three steps."
        description="No key management, no crypto wrangling for your recipients — just rules that travel with the file."
      />

      <Stagger className="mt-9 grid gap-3.5 md:grid-cols-3">
        {STEPS.map((step) => {
          const Icon = step.icon;
          return (
            <StaggerItem key={step.tag}>
              <article className="surface hover:border-vd-accent/40 flex h-full flex-col gap-3 p-6 transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-[0_30px_60px_-34px_rgba(94,124,250,0.35)]">
                <div className="flex items-center justify-between">
                  <span className="border-vd-bd2 bg-vd-card2 text-vd-accent2 grid size-11 place-items-center rounded-[13px] border">
                    <Icon className="size-5" />
                  </span>
                  <Badge variant="outline">Step {step.tag}</Badge>
                </div>
                <h3 className="text-vd-tx mt-1 text-[19px] font-extrabold tracking-[-0.015em]">
                  {step.title}
                </h3>
                <p className="text-vd-tx2 text-sm leading-relaxed">
                  {step.body}
                </p>
              </article>
            </StaggerItem>
          );
        })}
      </Stagger>
    </section>
  );
}
