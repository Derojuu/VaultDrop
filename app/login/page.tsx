import Link from "next/link";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { redirect } from "next/navigation";

import { GoogleSignIn } from "@/components/auth/google-sign-in";
import { Logo } from "@/components/brand/logo";
import { getCurrentUser } from "@/lib/auth";
import { getSupabasePublicConfig } from "@/lib/supabase/config";

export const metadata = { title: "Sign in" };

function safeNextPath(value: string | undefined): string {
  if (!value?.startsWith("/") || value.startsWith("//")) return "/dashboard";
  return value;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;
  const user = await getCurrentUser();
  if (user) redirect(safeNextPath(params.next));

  const configured = Boolean(getSupabasePublicConfig());

  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(94,124,250,0.14),transparent_34%)]" />

      <div className="relative w-full max-w-[420px]">
        <Link
          href="/"
          className="text-vd-tx3 hover:text-vd-tx mb-5 inline-flex items-center gap-2 text-sm transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back to VaultDrop
        </Link>

        <section className="border-vd-bd bg-vd-card/95 rounded-[8px] border p-6 shadow-2xl sm:p-8">
          <Logo markClassName="size-11" wordmarkClassName="text-[18px]" />

          <div className="mt-8">
            <h1 className="text-vd-tx text-[26px] leading-tight font-extrabold">
              Sign in to your vaults
            </h1>
            <p className="text-vd-tx2 mt-2 text-sm leading-relaxed">
              Your dashboard and sender controls are private. Recipients still
              open shared vaults without an account.
            </p>
          </div>

          <div className="mt-7">
            <GoogleSignIn
              nextPath={safeNextPath(params.next)}
              configured={configured}
            />
          </div>

          {!configured && (
            <p className="border-vd-warn/20 bg-vd-warn/8 text-vd-warn mt-4 rounded-[6px] border px-3 py-2.5 text-xs leading-relaxed">
              Google sign-in is not configured yet. Add the Supabase URL and
              publishable key to the environment.
            </p>
          )}

          {params.error && params.error !== "configuration" && (
            <p className="text-vd-dng mt-4 text-center text-xs">
              Sign-in could not be completed. Please try again.
            </p>
          )}

          <div className="border-vd-bd text-vd-tx3 mt-7 flex items-start gap-2.5 border-t pt-5 text-xs leading-relaxed">
            <LockKeyhole className="text-vd-accent2 mt-0.5 size-4 shrink-0" />
            Signing in protects dashboard access. File keys remain sealed to
            the enclave and are never stored in your account.
          </div>
        </section>
      </div>
    </main>
  );
}
