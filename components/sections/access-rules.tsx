import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/sections/section-heading";

const RULES = [
  {
    meta: "identity gates",
    title: "Who can open it",
    body: "Require a wallet signature, ERC-20 balance, or NFT ownership. The check runs inside the enclave — the allowlist never goes public.",
    spec: "WALLET · TOKEN · NFT",
  },
  {
    meta: "secret & consent",
    title: "What they must know or accept",
    body: "A passphrase the server never sees, or a required NDA acceptance recorded before the key is ever released.",
    spec: "PASSPHRASE · NDA",
  },
  {
    meta: "time & limits",
    title: "When and how often",
    body: "Auto-expiry, one-time access, and download limits — enforced at the key, not by a link anyone can forward.",
    spec: "EXPIRY · ONE-TIME · CAP",
  },
];

/**
 * Programmable-rules grid — mirrors the reference "platforms" section:
 * mono meta-label, title, body, and a spec chip per card.
 */
export function AccessRules() {
  return (
    <section
      id="how"
      className="mx-auto w-[min(1180px,calc(100%-2.5rem))] scroll-mt-24 pt-24"
    >
      <SectionHeading
        eyebrow="Programmable access"
        title="One vault. Many conditions."
        description="Combine rules into a policy the enclave enforces every time the file is opened — not just once when the link is made."
      />

      <Stagger className="mt-9 grid gap-3.5 md:grid-cols-3">
        {RULES.map((rule) => (
          <StaggerItem key={rule.meta}>
            <article className="platform-card h-full">
              <span className="text-vd-tx3 font-mono text-[10.5px] font-bold tracking-[0.1em] uppercase">
                {rule.meta}
              </span>
              <h3 className="text-vd-tx mt-3 mb-2 text-[21px] font-extrabold tracking-[-0.02em]">
                {rule.title}
              </h3>
              <p className="text-vd-tx2 text-sm leading-relaxed">{rule.body}</p>
              <span className="platform-spec">{rule.spec}</span>
            </article>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
