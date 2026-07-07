/**
 * Coston2 (Flare testnet) read client. Used *inside the enclave* to evaluate
 * on-chain access conditions — token balances and NFT ownership — as part of a
 * policy check. Read-only: no keys, no funds, no transactions. This is what
 * makes token/nft conditions load-bearing rather than declarative.
 */
import {
  createPublicClient,
  defineChain,
  erc20Abi,
  erc721Abi,
  getAddress,
  http,
  isAddress,
  recoverMessageAddress,
  type Address,
} from "viem";

import { FLARE_NETWORKS } from "@/lib/constants";

function rpcUrl(): string {
  return process.env.FLARE_RPC_URL || FLARE_NETWORKS.coston2.rpc;
}

export const coston2 = defineChain({
  id: FLARE_NETWORKS.coston2.id,
  name: "Flare Testnet Coston2",
  nativeCurrency: { name: "Coston2 Flare", symbol: "C2FLR", decimals: 18 },
  rpcUrls: { default: { http: [rpcUrl()] } },
  blockExplorers: {
    default: { name: "Coston2 Explorer", url: FLARE_NETWORKS.coston2.explorer },
  },
  testnet: true,
});

let client: ReturnType<typeof createPublicClient> | null = null;

function publicClient() {
  client ??= createPublicClient({ chain: coston2, transport: http(rpcUrl()) });
  return client;
}

export { getAddress, isAddress, recoverMessageAddress };
export type { Address };

/** ERC-20 balance of `owner` at `token` (raw base units). */
export async function erc20BalanceOf(
  token: Address,
  owner: Address,
): Promise<bigint> {
  return publicClient().readContract({
    address: token,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [owner],
  });
}

/** Number of NFTs from `collection` held by `owner`. */
export async function erc721BalanceOf(
  collection: Address,
  owner: Address,
): Promise<bigint> {
  return publicClient().readContract({
    address: collection,
    abi: erc721Abi,
    functionName: "balanceOf",
    args: [owner],
  });
}

/** Current owner of a specific NFT (throws if the token doesn't exist). */
export async function erc721OwnerOf(
  collection: Address,
  tokenId: bigint,
): Promise<Address> {
  return publicClient().readContract({
    address: collection,
    abi: erc721Abi,
    functionName: "ownerOf",
    args: [tokenId],
  });
}
