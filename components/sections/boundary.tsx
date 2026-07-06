import { Eye, KeyRound, ScanEye } from "lucide-react";

import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/sections/section-heading";

const STEPS = [
  {
    tone: "tone-public",
    icon: Eye,
    tag: "○ Public",
    title: "1 · Encrypted in",
    body: "Your file is encrypted on your device. Only opaque ciphertext reaches storage — visible as a blob, useless without the key. We say so plainly.",
  },
  {
    tone: "tone-shielded",
    icon: KeyRound,
    tag: "⛉ Sealed",
    title: "2 · Sealed through",
    body: "The decryption key and your policy are sealed inside Flare Confidential Compute. No server, and no VaultDrop operator, can read the key or bypass the rules.",
  },
  {
    tone: "tone-disclose",
    icon: ScanEye,
    tag: "◫ Release",
    title: "3 · Released on proof",
    body: "The enclave privately verifies every condition and releases the key only when all pass — with attestation proving the decision happened inside the TEE.",
  },
];

/**
 * The access boundary — mirrors the reference "privacy" section:
 * three colored-tone steps (public → shielded → disclose), middle elevated.
 */
export function Boundary() {
  return (
    <section
      id="privacy"
      className="mx-auto w-[min(1180px,calc(100%-2.5rem))] scroll-mt-24 pt-24"
    >
      <SectionHeading
        eyebrow="Sealed by default"
        title="Encrypted in. Sealed through. Released on proof."
      />
      <a
        href="https://dev.flare.network/"
        target="_blank"
        rel="noreferrer"
        className="section-link"
      >
        Read about Flare Confidential Compute
        <span aria-hidden>→</span>
      </a>

      <Stagger className="mt-9 grid gap-3.5 md:grid-cols-3">
        {STEPS.map((step) => {
          const Icon = step.icon;
          return (
            <StaggerItem key={step.title} className="h-full">
              <article className={`privacy-step h-full ${step.tone}`}>
                <span className="privacy-tag">
                  <Icon className="size-4" />
                  {step.tag}
                </span>
                <h3 className="text-vd-tx mt-4 mb-2 text-[19px] font-extrabold tracking-[-0.015em]">
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
