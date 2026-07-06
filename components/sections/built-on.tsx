import { CountUp } from "@/components/motion/count-up";
import { Reveal } from "@/components/motion/reveal";
import { MonoLabel } from "@/components/ui/mono-label";

const NAMES = ["Flare", "Confidential Compute", "TEE Attestation", "AES-256"];

const STATS: { to: number; suffix?: string; label: string }[] = [
  { to: 100, suffix: "%", label: "operator-blind" },
  { to: 1, label: "sealed key per vault" },
  { to: 8, label: "condition types" },
];

/**
 * "Built on" credibility strip — technology names on the left, accent-colored
 * stat numbers (which count up on scroll) on the right.
 */
export function BuiltOn() {
  return (
    <Reveal className="border-vd-bd mx-auto mt-[74px] flex w-[min(1180px,calc(100%-2.5rem))] flex-wrap items-center gap-x-6 gap-y-4 border-y px-1 py-[22px]">
      <MonoLabel>Built on</MonoLabel>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        {NAMES.map((name) => (
          <span
            key={name}
            className="text-vd-tx2 text-[15px] font-extrabold tracking-[-0.01em]"
          >
            {name}
          </span>
        ))}
      </div>

      <div className="text-vd-tx3 ml-auto flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[12px]">
        {STATS.map((stat) => (
          <span key={stat.label}>
            <CountUp
              to={stat.to}
              suffix={stat.suffix}
              className="text-vd-accent2 font-extrabold"
            />{" "}
            {stat.label}
          </span>
        ))}
      </div>
    </Reveal>
  );
}
