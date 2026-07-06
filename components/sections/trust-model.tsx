import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/sections/section-heading";
import { Badge } from "@/components/ui/badge";

const COLUMNS = [
  {
    tone: "warning" as const,
    tag: "Centralized",
    title: "Dropbox, DocSend, WeTransfer",
    body: "A server holds the key and enforces rules in code you must trust. One breach, insider, or subpoena exposes everything.",
  },
  {
    tone: "warning" as const,
    tag: "Transparent chain",
    title: "Smart contract only",
    body: "Conditions and keys would be public on-chain. You can't evaluate a secret passphrase or a private allowlist on a transparent ledger.",
  },
  {
    tone: "accent" as const,
    tag: "VaultDrop",
    title: "Sealed in confidential compute",
    body: "The key and the decision live inside a Flare TEE. The operator is cryptographically incapable of releasing a key off-policy — and it's attestable.",
    featured: true,
  },
];

/**
 * Comparison of trust models — VaultDrop's load-bearing differentiator vs.
 * centralized services and transparent-chain approaches.
 */
export function TrustModel() {
  return (
    <section
      id="trust"
      className="mx-auto w-[min(1180px,calc(100%-2.5rem))] scroll-mt-24 pt-24"
    >
      <SectionHeading
        eyebrow="Trust model"
        title="Why a server-held key isn't good enough."
        description="Move key custody and the access decision into trusted, attestable code that even we can't bypass."
      />

      <Stagger className="mt-9 grid gap-3.5 md:grid-cols-3">
        {COLUMNS.map((col) => (
          <StaggerItem key={col.tag} className="h-full">
            <article
              className={
                col.featured
                  ? "surface border-vd-accent/45 relative h-full overflow-hidden rounded-[18px] bg-[radial-gradient(320px_200px_at_50%_0%,rgba(94,124,250,0.13),transparent_70%),var(--vd-panel)] p-6"
                  : "surface h-full rounded-[18px] p-6"
              }
            >
              <Badge variant={col.tone}>{col.tag}</Badge>
              <h3 className="text-vd-tx mt-4 text-[19px] font-extrabold tracking-[-0.015em]">
                {col.title}
              </h3>
              <p className="text-vd-tx2 mt-2.5 text-sm leading-relaxed">
                {col.body}
              </p>
            </article>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
