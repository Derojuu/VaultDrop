import type { Metadata } from "next";

import { LegalPage, type LegalSection } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description:
    "The terms governing access to and use of the VaultDrop application.",
};

const sections: LegalSection[] = [
  {
    id: "acceptance",
    title: "Acceptance",
    content: (
      <p>
        By accessing or using VaultDrop, you agree to these Terms and
        Conditions and the Privacy Policy. If you do not agree, do not use the
        service.
      </p>
    ),
  },
  {
    id: "service",
    title: "The Service",
    content: (
      <>
        <p>
          VaultDrop provides tools for encrypting files, attaching access
          conditions, sharing vault links, evaluating recipient proofs, and
          revoking access.
        </p>
        <p>
          VaultDrop is currently an early, experimental application using
          testnet and simulated or evolving confidential-compute
          infrastructure. It is not intended for production secrets, regulated
          records, emergency access, or information whose loss would cause
          material harm.
        </p>
      </>
    ),
  },
  {
    id: "accounts",
    title: "Accounts",
    content: (
      <>
        <p>
          Sender dashboard access requires authentication through Google and
          Supabase. You are responsible for maintaining control of your Google
          account, browser session, connected wallets, and devices.
        </p>
        <p>
          You must provide accurate account information and promptly report
          suspected unauthorized access. You may not impersonate another person
          or use an account you are not authorized to control.
        </p>
      </>
    ),
  },
  {
    id: "content",
    title: "Your Content",
    content: (
      <>
        <p>
          You retain your rights in files and information you submit. You grant
          VaultDrop and its infrastructure providers the limited permission
          necessary to host, transmit, process, and make encrypted content
          available according to your instructions.
        </p>
        <p>
          You are responsible for ensuring that you have the rights and lawful
          authority to upload, encrypt, share, and apply access conditions to
          your content.
        </p>
      </>
    ),
  },
  {
    id: "acceptable-use",
    title: "Acceptable Use",
    content: (
      <>
        <p>You may not use VaultDrop to:</p>
        <ul>
          <li>Break applicable laws or violate another person&apos;s rights.</li>
          <li>
            Store or distribute malware, stolen data, exploitative material, or
            content used to facilitate fraud, harassment, or abuse.
          </li>
          <li>
            Probe, disrupt, overload, bypass, or interfere with the service or
            its security controls.
          </li>
          <li>
            Misrepresent access conditions, wallet ownership, or attestation
            results.
          </li>
          <li>
            Use automated systems in a way that degrades the service for other
            users.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "access-conditions",
    title: "Access Conditions and Recovery",
    content: (
      <>
        <p>
          You are responsible for selecting and reviewing vault conditions,
          recipient addresses, passphrases, expiry dates, limits, and share
          links before sealing a vault.
        </p>
        <p>
          VaultDrop may be unable to recover content when conditions cannot be
          satisfied, a passphrase is lost, a wallet becomes unavailable, a
          vault expires, a one-time release is consumed, or a vault is revoked.
          Revocation is designed to destroy stored ciphertext and may be
          irreversible.
        </p>
      </>
    ),
  },
  {
    id: "third-parties",
    title: "Third-Party Services",
    content: (
      <p>
        VaultDrop depends on third-party services and networks, including
        Google, Supabase, Vercel, wallet software, RPC providers, and Flare
        infrastructure. Their availability, security, pricing, and terms are
        outside VaultDrop&apos;s control. Your use of those services may also be
        governed by separate agreements.
      </p>
    ),
  },
  {
    id: "availability",
    title: "Availability and Changes",
    content: (
      <p>
        We may modify, limit, suspend, or discontinue any part of VaultDrop at
        any time. We do not guarantee continuous availability, permanent
        storage, successful delivery, compatibility with every wallet, or that
        testnet and confidential-compute services will remain unchanged.
      </p>
    ),
  },
  {
    id: "suspension",
    title: "Suspension and Termination",
    content: (
      <p>
        Access may be restricted or terminated when reasonably necessary to
        protect VaultDrop, its users, service providers, or the public; respond
        to unlawful use; enforce these terms; or comply with legal obligations.
      </p>
    ),
  },
  {
    id: "disclaimers",
    title: "Disclaimers",
    content: (
      <p>
        VaultDrop is provided on an &quot;as is&quot; and &quot;as
        available&quot; basis to the maximum extent permitted by law. We
        disclaim warranties of merchantability, fitness for a particular
        purpose, non-infringement, uninterrupted operation, and error-free or
        loss-free storage. Cryptographic design does not eliminate all software,
        infrastructure, account, device, or user-error risks.
      </p>
    ),
  },
  {
    id: "liability",
    title: "Limitation of Liability",
    content: (
      <p>
        To the maximum extent permitted by law, the VaultDrop operator will not
        be liable for indirect, incidental, special, consequential, exemplary,
        or punitive damages, or for lost files, keys, access, profits, revenue,
        goodwill, or data arising from use of or inability to use the service.
        Some jurisdictions do not permit certain limitations, so portions of
        this section may not apply to you.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to These Terms",
    content: (
      <p>
        We may update these terms as VaultDrop evolves. Continued use after an
        updated version is published means you accept the revised terms. The
        date at the top identifies the latest version.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Contact",
    content: (
      <p>
        Questions about these terms may be submitted through the{" "}
        <a
          href="https://github.com/Derojuu/VaultDrop"
          target="_blank"
          rel="noreferrer"
        >
          VaultDrop project repository
        </a>
        . Do not publish passwords, private keys, passphrases, or confidential
        information in an issue.
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Terms and Conditions"
      summary="These terms govern access to VaultDrop, including account use, encrypted-file handling, vault conditions, acceptable use, availability, and responsibility for shared content."
      sections={sections}
    />
  );
}
