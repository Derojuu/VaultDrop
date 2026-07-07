/**
 * RemoteEnclave — the Coston2 adapter. Talks to a real Flare Confidential
 * Compute extension (the `extension-tee` + `ext-proxy` stack) over HTTP, routing
 * by the FCE op pairs. Selected when ENCLAVE_MODE=coston2.
 *
 * This is written to the fce-sign contract now so the switch from simulated to
 * real hardware is a config change, not a rewrite. It stays inert until
 * FCE_PROXY_URL is set and the extension is reachable (Phase 7 — needs a funded
 * Coston2 wallet + the indexer credential from Flare support). Because a
 * deployed app is already public, no ngrok is required: the proxy endpoint is
 * called directly.
 */
import {
  OP_COMMAND_SEAL,
  OP_COMMAND_UNLOCK,
  OP_TYPE_VAULTDROP,
  type EnclaveEngine,
  type EnclaveInfo,
  type SealRequest,
  type SealResult,
  type UnlockRequest,
  type UnlockResult,
} from "@/lib/enclave/types";

function proxyUrl(): string {
  const url = process.env.FCE_PROXY_URL;
  if (!url) {
    throw new Error(
      "ENCLAVE_MODE=coston2 requires FCE_PROXY_URL (the ext-proxy endpoint).",
    );
  }
  return url.replace(/\/$/, "");
}

async function action<T>(opCommand: string, payload: unknown): Promise<T> {
  const res = await fetch(`${proxyUrl()}/action`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      opType: OP_TYPE_VAULTDROP,
      opCommand,
      payload,
    }),
  });
  if (!res.ok) {
    throw new Error(`Enclave action ${opCommand} failed: ${res.status}`);
  }
  const body = (await res.json()) as { status: number; data: T; error?: string };
  // FCE convention: status 1 = success, 0 = error, >=2 = pending.
  if (body.status !== 1) {
    throw new Error(body.error ?? `Enclave returned status ${body.status}`);
  }
  return body.data;
}

export const remoteEnclave: EnclaveEngine = {
  async info(): Promise<EnclaveInfo> {
    const res = await fetch(`${proxyUrl()}/info`);
    if (!res.ok) throw new Error(`Enclave /info failed: ${res.status}`);
    return (await res.json()) as EnclaveInfo;
  },

  seal(req: SealRequest): Promise<SealResult> {
    return action<SealResult>(OP_COMMAND_SEAL, req);
  },

  unlock(req: UnlockRequest): Promise<UnlockResult> {
    return action<UnlockResult>(OP_COMMAND_UNLOCK, req);
  },
};
