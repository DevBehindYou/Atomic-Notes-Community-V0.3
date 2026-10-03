# CSS compiler security upgrade

The October 2 expansion of GHSA-vfj7-8cjw-p6xm covers braces through 3.0.3,
with no patched release listed. Tailwind 3's chokidar and fast-glob/micromatch
paths pull in that package. The baseline audit reports five high-severity
dependency entries rooted in this single advisory, and blocks Community CI.
This is a dependency finding, not evidence of a production exploit.

Pin Tailwind and its official PostCSS plugin to 4.3.3, retain the existing
TypeScript theme config through @config, and remove the obsolete Autoprefixer
plugin. Utilities remain unlayered with existing custom CSS so class rules
continue to override element defaults. The default v4 import initially caused
Updates to lose its 20px side padding and 8px heading margin; browser inspection
caught it, and the final import order restores both.

## Verification and boundaries

- Fresh local audit: zero vulnerabilities at all severities; braces is absent
  from the installed compiler dependency graph.
- TypeScript, production build and all 26 runtime entries pass.
- Home, support, blog, Updates and unauthenticated Controller checked at exact
  1280px and 375px widths; ten screenshots visually inspected against the prior
  v3 build. No horizontal overflow or broken visible images in those samples.
- Local energy demo changes 20 to 15 and resets to 20. Empty Controller Continue
  validates without any credentials. Captured warning/error log is empty.
- Updates failure state is intentional: the local preview has backend access
  disabled. Authenticated admin visuals, live feeds and older browsers were not
  tested. No production access, deployment or data write.

Tailwind v4 targets Safari 16.4+, Chrome 111+ and Firefox 128+. Compatibility with
older browsers is a remaining limitation. Existing Next and React versions and
the independent content-policy PR are unchanged. CI must pass independently;
zero audit findings is a snapshot, not a promise against future advisories.

Rollback requires reverting package.json, its lockfile, postcss.config.mjs and
the stylesheet import changes together. Reverting restores the advisory chain
unless a separately patched compiler is selected.

Sources: [reviewed advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm),
[official upgrade guide](https://tailwindcss.com/docs/upgrade-guide),
[constituent CSS imports](https://tailwindcss.com/docs/preflight).
