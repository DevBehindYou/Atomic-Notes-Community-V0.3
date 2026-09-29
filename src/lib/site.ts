// Public, non-secret site settings. Only NEXT_PUBLIC_* variables belong here:
// this module is also bundled into client components.
const DEFAULT_SITE_URL = "https://atomic-notes-community.vercel.app";
// The App is built from Atomic-Notes-App-V0.2 (the older Atomic-Notes-App repository has no releases).
const DEFAULT_APK_URL = "https://github.com/DevBehindYou/Atomic-Notes-App-V0.2/releases/latest";

function originOf(value: string | undefined, fallback: string): string {
  try {
    return new URL(value || fallback).origin;
  } catch {
    return fallback;
  }
}

/** Canonical origin for metadata, sitemap and feed links. No trailing slash. */
export const SITE_URL = originOf(process.env.NEXT_PUBLIC_SITE_URL, DEFAULT_SITE_URL);

/** Where the download buttons point. */
export const APK_URL = process.env.NEXT_PUBLIC_APK_URL || DEFAULT_APK_URL;
