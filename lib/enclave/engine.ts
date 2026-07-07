/**
 * EnclaveEngine — the seam between VaultDrop and the confidential enclave.
 *
 * The API routes under /api/enclave/* call this interface and never care which
 * implementation is behind it. `getEnclaveEngine()` picks one from ENCLAVE_MODE:
 *   - "simulated" (default): in-process software enclave — runs everywhere,
 *     including the hosted Vercel demo.
 *   - "coston2": the real Flare Confidential Compute extension over HTTP.
 *
 * This is the one place that changes when moving to real TEE hardware.
 */
import { serverEnv } from "@/lib/env";
import { remoteEnclave } from "@/lib/enclave/remote";
import { simulatedEnclave } from "@/lib/enclave/simulated";
import type { EnclaveEngine } from "@/lib/enclave/types";

export function getEnclaveEngine(): EnclaveEngine {
  return serverEnv().ENCLAVE_MODE === "coston2"
    ? remoteEnclave
    : simulatedEnclave;
}
