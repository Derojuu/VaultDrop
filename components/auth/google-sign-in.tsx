"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";

import { GoogleMark } from "@/components/auth/google-mark";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function GoogleSignIn({
  nextPath,
  configured,
}: {
  nextPath: string;
  configured: boolean;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signIn() {
    setPending(true);
    setError(null);

    try {
      const supabase = createClient();
      const callback = new URL("/auth/callback", window.location.origin);
      callback.searchParams.set("next", nextPath);

      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: callback.toString() },
      });

      if (signInError) throw signInError;
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Google sign-in failed.",
      );
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <Button
        type="button"
        size="lg"
        variant="secondary"
        onClick={signIn}
        disabled={!configured || pending}
        className="w-full bg-white text-[#202124] hover:border-white hover:bg-white/95"
      >
        {pending ? (
          <Loader2 className="animate-spin" />
        ) : (
          <GoogleMark className="size-[18px]" />
        )}
        {pending ? "Opening Google..." : "Continue with Google"}
      </Button>
      {error && (
        <p role="alert" className="text-vd-dng text-center text-xs">
          {error}
        </p>
      )}
    </div>
  );
}
