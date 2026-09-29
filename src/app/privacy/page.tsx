import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { REPO_URL } from "@/lib/content";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Atomic Notes handles your data: what the app and server keep, how Google user data is used, the end-to-end vault, retention, and your choices.",
  alternates: { canonical: "/privacy" },
};

const CONTACT = "https://github.com/DevBehindYou";

export default function PrivacyPage() {
  return (
    <LegalPage eyebrow="ATOMIC NOTES" title="Privacy Policy" updated="29 September 2026">
      <p>
        This policy explains how the Atomic Notes Android app, its sync server and this website handle your
        information. Atomic Notes is built and operated by Ashutosh Sharma, who publishes as DevBehindYou (&ldquo;we&rdquo;,
        &ldquo;us&rdquo;).
      </p>

      <h2>The short version</h2>
      <ul>
        <li>Your notes are saved on your phone first. When you sync, they go to a folder in your own Google Drive.</li>
        <li>Our server never stores your note titles, text or checklist items.</li>
        <li>There is no analytics, no crash reporting, no advertising and no AI in the app.</li>
        <li>We never sell your data, and we never use it to train AI models.</li>
      </ul>

      <h2>Information we collect</h2>
      <p>To run your account and sync, our server keeps:</p>
      <ul>
        <li>Your Google account ID, email address and name, from Google sign-in, and the username you choose.</li>
        <li>Your Atomic Energy and Atomic Coin balances, and a record of how they changed.</li>
        <li>
          Metadata for each note: its ID, whether it is a note or a checklist, the pinned and deleted flags, timestamps,
          and the ID of its file in your Google Drive.
        </li>
        <li>Your Google access and refresh tokens, encrypted with AES-256-GCM before they are stored.</li>
        <li>A short log of account and security events, such as sign-ins.</li>
        <li>Which in-app announcements you have read or dismissed.</li>
      </ul>
      <p>
        We do not collect your note content, contacts, location, advertising IDs, analytics or crash reports. Our hosting
        provider processes standard request data, such as IP addresses, to deliver the app&apos;s server and this
        website. This website sets no tracking or advertising cookies.
      </p>

      <h2>How we use Google user data</h2>
      <p>Atomic Notes asks Google for these permissions, and uses each one only as described:</p>
      <ul>
        <li>
          <b>openid, email and profile:</b> to sign you in, create your account, and show your name and email in the app.
        </li>
        <li>
          <b>drive.file:</b> to create a <code>My-Atomic-Notes</code> folder in your Google Drive, and to create, read,
          update and delete the note files Atomic Notes makes there, so your notes sync between your devices. This
          permission only covers files the app created. Atomic Notes cannot see any other file in your Drive.
        </li>
      </ul>
      <p>
        We use Google user data only to provide and improve these features for you. We do not sell it, use it for
        advertising, or use it to train artificial-intelligence or machine-learning models. We do not transfer it to
        anyone except as needed to run the service (see &ldquo;Service providers&rdquo; below), for security, or to comply
        with the law. No person reads your Google data unless you ask for help and give permission, it is needed to
        investigate abuse or a security problem, or the law requires it.
      </p>
      <p>
        Atomic Notes&apos; use and transfer to any other app of information received from Google APIs will adhere to the{" "}
        <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noreferrer">
          Google API Services User Data Policy
        </a>
        , including the Limited Use requirements.
      </p>

      <h2>The end-to-end vault</h2>
      <p>
        If you turn on Encryption, the app derives a key on your phone from a 6-word recovery phrase and encrypts every
        note with AES-256-GCM before it leaves the device. Your Drive and our server then hold only ciphertext. The phrase
        and the key never leave your phone, so we cannot recover vault notes if you lose the phrase. With the vault off,
        note content is stored as plain text in your own Drive and passes through our server on its way there, without
        being stored.
      </p>

      <h2>Where data is stored and how it is protected</h2>
      <ul>
        <li>Note content: on your phone, and in your own Google Drive when you sync.</li>
        <li>Account data: in our database (MongoDB Atlas), used by our server on Vercel (Mumbai, India region).</li>
        <li>All traffic between the app and the server uses HTTPS.</li>
        <li>In the app, the session and vault key are kept in Android&apos;s secure storage.</li>
      </ul>

      <h2>How long we keep it</h2>
      <ul>
        <li>Account and balance data: for as long as your account exists.</li>
        <li>Security event log: 30 days.</li>
        <li>Records of deleted notes and of each sync: 30 days.</li>
      </ul>

      <h2>Your choices</h2>
      <ul>
        <li>Turn cloud sync off in Settings. Your notes then stay on your phone only.</li>
        <li>
          Use Settings &gt; Danger Zone to delete the cloud copies (this deletes the note files from your Drive and their
          metadata from our server) or the notes on your phone.
        </li>
        <li>
          Remove Atomic Notes&apos; access to your Google account at any time at{" "}
          <a href="https://myaccount.google.com/permissions" target="_blank" rel="noreferrer">
            myaccount.google.com/permissions
          </a>
          .
        </li>
        <li>
          To delete your account, or to get a copy of the data we hold about you, contact us (below). We delete account
          data within 30 days of a verified request.
        </li>
      </ul>

      <h2>Service providers</h2>
      <ul>
        <li>Google: sign-in and Google Drive storage.</li>
        <li>Vercel: hosting for the server and this website.</li>
        <li>MongoDB Atlas: the database for account data.</li>
      </ul>
      <p>
        If you choose to support the project, the payment is handled by the platform you use, under its own policies. We
        only use the account email you send us to add your supporter reward.
      </p>

      <h2>Children</h2>
      <p>Atomic Notes is not directed at children under 13, and we do not knowingly collect their information.</p>

      <h2>Changes to this policy</h2>
      <p>
        We will update the date at the top when this policy changes, and announce significant changes in the app&apos;s
        notification center.
      </p>

      <h2>Contact</h2>
      <p>
        Questions or requests: reach the developer through{" "}
        <a href={CONTACT} target="_blank" rel="noreferrer">
          github.com/DevBehindYou
        </a>
        . The app&apos;s source code, including how it handles data, is public to read at{" "}
        <a href={REPO_URL} target="_blank" rel="noreferrer">
          Atomic-Notes-App-V0.2
        </a>
        .
      </p>
    </LegalPage>
  );
}
