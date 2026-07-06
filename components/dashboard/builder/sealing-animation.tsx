"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { KeyRound, Lock } from "lucide-react";

import { LogoMark } from "@/components/brand/logo";

const PHASES = [
  "Encrypting file · AES-256-GCM",
  "Sealing key inside the enclave",
  "Requesting TEE attestation",
  "Sealed & attested",
];

/**
 * The signature "seal into enclave" sequence: a key flies into the vault dial,
 * a scanline sweeps (attestation), and the phases advance. Plays while the real
 * crypto + seal runs underneath.
 */
export function SealingAnimation() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 700),
      setTimeout(() => setPhase(2), 1450),
      setTimeout(() => setPhase(3), 2050),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const sealed = phase >= 3;

  return (
    <div className="flex flex-col items-center gap-7 py-10">
      <div className="relative grid size-[168px] place-items-center">
        {/* pulsing glow */}
        <motion.span
          aria-hidden
          className="absolute size-[150px] rounded-full bg-[radial-gradient(circle,rgba(94,124,250,0.32),transparent_65%)]"
          animate={{ opacity: [0.4, 0.75, 0.4], scale: [0.92, 1.05, 0.92] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* rotating vault dial */}
        <motion.div
          aria-hidden
          className="absolute size-[132px]"
          animate={{ rotate: sealed ? 0 : 360 }}
          transition={
            sealed
              ? { duration: 0.6, ease: [0.2, 0.7, 0.2, 1] }
              : { duration: 8, repeat: Infinity, ease: "linear" }
          }
        >
          <LogoMark className="size-full" />
        </motion.div>

        {/* key flying into the vault */}
        {!sealed && (
          <motion.span
            aria-hidden
            className="border-vd-accent/50 bg-vd-bg/80 text-vd-accent2 absolute grid size-9 place-items-center rounded-full border"
            initial={{ x: -110, opacity: 0, scale: 0.8 }}
            animate={{
              x: [-110, -110, 0],
              opacity: [0, 1, 1, 0],
              scale: [0.8, 1, 0.55, 0.4],
            }}
            transition={{
              duration: 2,
              times: [0, 0.25, 0.85, 1],
              ease: [0.2, 0.7, 0.2, 1],
            }}
          >
            <KeyRound className="size-4" />
          </motion.span>
        )}

        {/* lock snaps shut on seal */}
        {sealed && (
          <motion.span
            className="border-vd-pos/50 bg-vd-pos/12 text-vd-pos absolute grid size-11 place-items-center rounded-full border"
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: [0.4, 1.15, 1], opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.2, 0.7, 0.2, 1] }}
          >
            <Lock className="size-5" />
          </motion.span>
        )}

        {/* attestation scanline */}
        {!sealed && (
          <motion.span
            aria-hidden
            className="absolute h-[2px] w-[130px] bg-[linear-gradient(90deg,transparent,rgba(154,166,255,0.9),transparent)]"
            animate={{ y: [-58, 58, -58], opacity: [0, 1, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
      </div>

      {/* phase readout */}
      <div className="flex flex-col items-center gap-2 text-center">
        <motion.div
          key={phase}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={
            "text-[15px] font-bold " + (sealed ? "text-vd-pos" : "text-vd-tx")
          }
        >
          {PHASES[phase]}
        </motion.div>
        <div className="flex items-center gap-1.5">
          {PHASES.map((_, i) => (
            <span
              key={i}
              className={
                "h-1 rounded-full transition-all duration-300 " +
                (i <= phase ? "bg-vd-accent w-5" : "bg-vd-bd2 w-2")
              }
            />
          ))}
        </div>
        <p className="text-vd-tx3 mt-1 max-w-[320px] font-mono text-[10.5px] leading-relaxed">
          The key never leaves the enclave. No server — including VaultDrop —
          can release it off-policy.
        </p>
      </div>
    </div>
  );
}
