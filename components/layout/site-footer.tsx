import Link from "next/link";
import { GitBranch } from "lucide-react";

import { LogoMark } from "@/components/brand/logo";

export function SiteFooter() {
  return (
    <footer className="border-vd-bd mx-auto flex w-[min(1180px,calc(100%-2.5rem))] flex-wrap items-center gap-5 border-t px-1 pt-[26px] pb-[34px]">
      <div className="flex items-center gap-3">
        <LogoMark className="size-11" />
        <div className="leading-tight">
          <strong className="text-vd-tx block text-[16px] tracking-[-0.01em]">
            VaultDrop
          </strong>
          <span className="text-vd-tx3 block text-[11.5px]">
            Sealed sharing on Flare Confidential Compute
          </span>
        </div>
      </div>

      <nav
        aria-label="Footer"
        className="text-vd-tx2 ml-auto flex flex-wrap items-center justify-end gap-x-5 gap-y-2 text-[13px] font-medium"
      >
        <Link href="/privacy" className="hover:text-vd-tx transition-colors">
          Privacy
        </Link>
        <Link href="/terms" className="hover:text-vd-tx transition-colors">
          Terms
        </Link>
        <a
          href="https://dev.flare.network/"
          target="_blank"
          rel="noreferrer"
          className="hover:text-vd-tx transition-colors"
        >
          Flare Docs
        </a>
        <a
          href="https://github.com/Derojuu/VaultDrop"
          target="_blank"
          rel="noreferrer"
          className="hover:text-vd-tx inline-flex items-center gap-1.5 transition-colors"
        >
          <GitBranch className="size-3.5" />
          GitHub
        </a>
        <Link href="/#privacy" className="hover:text-vd-tx transition-colors">
          Trust model
        </Link>
      </nav>
    </footer>
  );
}
