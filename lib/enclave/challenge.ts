/**
 * The wallet-ownership challenge. The recipient signs this exact string with
 * their wallet; the enclave recovers the signer address from it. Deterministic
 * per vault so signer and verifier agree without a round-trip. Isomorphic — no
 * deps — so the browser and the enclave import the same source of truth.
 */
export function unlockChallengeMessage(vaultId: string): string {
  return [
    "VaultDrop unlock authorization",
    `Vault: ${vaultId}`,
    "",
    "Signing proves you control this wallet. It is not a transaction and costs no gas.",
  ].join("\n");
}
