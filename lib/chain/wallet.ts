/**
 * Browser wallet handshake for on-chain access conditions. Connects an injected
 * EIP-1193 wallet (MetaMask etc.) and signs the vault-bound challenge so the
 * enclave can prove which address the recipient controls. Signing is a plain
 * message signature — no transaction, no gas.
 */
"use client";

import { createWalletClient, custom, type EIP1193Provider } from "viem";

import { unlockChallengeMessage } from "@/lib/enclave/challenge";

function provider(): EIP1193Provider {
  const eth = (window as unknown as { ethereum?: EIP1193Provider }).ethereum;
  if (!eth) {
    throw new Error(
      "No wallet detected. Install MetaMask (or a compatible wallet) to continue.",
    );
  }
  return eth;
}

/** Prompt the wallet to connect; returns the selected address. */
export async function connectWallet(): Promise<string> {
  const client = createWalletClient({ transport: custom(provider()) });
  const [address] = await client.requestAddresses();
  if (!address) throw new Error("No account was authorized.");
  return address;
}

/** Sign this vault's challenge with the connected address. */
export async function signUnlockChallenge(
  vaultId: string,
  address: string,
): Promise<string> {
  const client = createWalletClient({ transport: custom(provider()) });
  return client.signMessage({
    account: address as `0x${string}`,
    message: unlockChallengeMessage(vaultId),
  });
}
