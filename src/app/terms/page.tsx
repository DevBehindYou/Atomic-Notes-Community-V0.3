import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";
import { REPO_URL } from "@/lib/content";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms for using the Atomic Notes app, its sync service, Atomic Energy and Atomic Coins.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalPage eyebrow="ATOMIC NOTES" title="Terms of Service" updated="29 September 2026">
      <p>
        These terms apply to the Atomic Notes Android app, its sync service and this website (together, &ldquo;the
        service&rdquo;), operated by Ashutosh Sharma, who publishes as DevBehindYou (&ldquo;we&rdquo;). By using the
        service, you agree to them. How we handle your data is described in the{" "}
        <Link href="/privacy">Privacy Policy</Link>.
      </p>

      <h2>1. The service</h2>
      <p>
        Atomic Notes is a free notes app. Notes are stored on your phone, and cloud sync stores them in your own Google
        Drive. Sync needs a Google account and depends on Google&apos;s services being available. The service is under
        active development, and features may change.
      </p>

      <h2>2. Your account and your notes</h2>
      <ul>
        <li>You own your notes. We claim no rights over their content.</li>
        <li>You are responsible for keeping your Google account and your phone secure.</li>
        <li>
          If you use the end-to-end vault, keep your 6-word recovery phrase safe. We cannot recover vault notes without
          it.
        </li>
        <li>Keep your own backups of anything important.</li>
      </ul>

      <h2>3. Atomic Energy and Atomic Coins</h2>
      <ul>
        <li>
          Atomic Energy and Atomic Coins are virtual items used only inside Atomic Notes, for cloud sync and note
          capacity.
        </li>
        <li>They have no cash value, cannot be exchanged for money, and cannot be transferred to another account.</li>
        <li>
          We may change how much energy or how many coins features cost, and how they are granted. We will announce
          significant changes in the app.
        </li>
        <li>
          Coins sent as a thank-you for supporting the project are a gift from the developer. Payments you make to
          support the project are handled by the payment platform under its own terms.
        </li>
      </ul>

      <h2>4. Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>attack, overload or try to get unauthorized access to the service or other people&apos;s accounts;</li>
        <li>use automated means to create accounts, earn energy or coins, or send excessive requests;</li>
        <li>use the service to break the law.</li>
      </ul>

      <h2>5. The software</h2>
      <p>
        The app&apos;s source code is public to read under the{" "}
        <a href={`${REPO_URL}/blob/main/LICENSE`} target="_blank" rel="noreferrer">
          Atomic Notes Source-Available License
        </a>
        . Install only official releases from the Atomic Notes GitHub Releases page.
      </p>

      <h2>6. Availability and changes</h2>
      <p>
        We try to keep the service running, but we do not guarantee it will always be available or error-free. We may
        change, suspend or end any part of it. If we end cloud sync, the notes on your phone and the files in your Drive
        stay yours.
      </p>

      <h2>7. No warranty</h2>
      <p>
        The service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo;, without warranties of any kind, to
        the fullest extent the law allows.
      </p>

      <h2>8. Limitation of liability</h2>
      <p>
        To the fullest extent the law allows, we are not liable for any indirect or consequential loss, or for any loss
        of data, profits or goodwill, arising from your use of the service.
      </p>

      <h2>9. Ending your use</h2>
      <p>
        You can stop using the service at any time and ask us to delete your account. We may suspend or close accounts
        that break these terms.
      </p>

      <h2>10. Changes to these terms</h2>
      <p>
        We will update the date at the top when these terms change, and announce significant changes in the app.
        Continuing to use the service after a change means you accept the new terms.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these terms: reach the developer through{" "}
        <a href="https://github.com/DevBehindYou" target="_blank" rel="noreferrer">
          github.com/DevBehindYou
        </a>
        .
      </p>
    </LegalPage>
  );
}
