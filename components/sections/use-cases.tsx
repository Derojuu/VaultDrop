import {
  Briefcase,
  Coins,
  FileSignature,
  Landmark,
  Palette,
  Users,
} from "lucide-react";

import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/sections/section-heading";

const CASES = [
  {
    icon: Briefcase,
    tag: "Freelancers",
    title: "Payment-gated delivery",
    body: "Final files unlock only after the client proves payment or holds the access token.",
  },
  {
    icon: FileSignature,
    tag: "Legal",
    title: "NDA-gated documents",
    body: "The key releases only after the recipient accepts the NDA condition — recorded, private.",
  },
  {
    icon: Landmark,
    tag: "Dealmakers",
    title: "Selective data rooms",
    body: "Share a pitch deck with a private allowlist of investor wallets, evaluated in the enclave.",
  },
  {
    icon: Palette,
    tag: "Creators",
    title: "Token-gated content",
    body: "Unlock exclusive media only for holders of a specific token or NFT.",
  },
  {
    icon: Users,
    tag: "HR & Ops",
    title: "Time-boxed contracts",
    body: "Employment docs that expire after 48 hours and revoke with a single click.",
  },
  {
    icon: Coins,
    tag: "DAOs",
    title: "Member-only files",
    body: "Governance materials that open only for verified members, no central gatekeeper.",
  },
];

/** Target-user grid — who VaultDrop is for and the concrete job it does. */
export function UseCases() {
  return (
    <section
      id="use-cases"
      className="mx-auto w-[min(1180px,calc(100%-2.5rem))] scroll-mt-24 pt-24"
    >
      <SectionHeading
        eyebrow="Use cases"
        title="For anyone who shares files they can't afford to lose control of."
      />

      <Stagger className="mt-9 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        {CASES.map((c) => {
          const Icon = c.icon;
          return (
            <StaggerItem key={c.tag} className="h-full">
              <article className="surface-card group hover:border-vd-accent/40 flex h-full flex-col gap-3 p-5 transition-[transform,border-color] duration-200 hover:-translate-y-1">
                <div className="flex items-center gap-3">
                  <span className="border-vd-bd text-vd-accent2 grid size-9 place-items-center rounded-[10px] border bg-white/[0.03]">
                    <Icon className="size-4.5" />
                  </span>
                  <span className="mono-label text-vd-tx3">{c.tag}</span>
                </div>
                <h3 className="text-vd-tx text-[17px] font-extrabold tracking-[-0.015em]">
                  {c.title}
                </h3>
                <p className="text-vd-tx2 text-[13.5px] leading-relaxed">
                  {c.body}
                </p>
              </article>
            </StaggerItem>
          );
        })}
      </Stagger>
    </section>
  );
}
