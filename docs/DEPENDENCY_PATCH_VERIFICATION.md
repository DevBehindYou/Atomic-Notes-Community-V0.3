# Community dependency security patch

The existing dependency audit stopped verification before browser checks. The locked graph contains sharp 0.35.4 and source-map-js 1.2.1, affected by two newly published high-severity advisories:

- [GHSA-wq5f-xc86-pv6w](https://github.com/advisories/GHSA-wq5f-xc86-pv6w): sharp's bundled librsvg; patched sharp is 0.35.5. The advisory describes runtime-specific conditions; no exploitation or deployed reachability is established here.
- [GHSA-68fv-2mgg-jv7q](https://github.com/advisories/GHSA-68fv-2mgg-jv7q): source-map-js indexed source-map offset denial of service; patched version is 1.2.2.

## Exact scope

Only the lockfile graph changes. Existing package.json ranges already permit both patches: Next accepts sharp `^0.34.3 || ^0.35.3`; current source-map-js callers accept `^1.2.1`. No new override, dependency, framework upgrade, application behavior, database or deployment change is needed.

The graph moves sharp and its 16 platform/wrapper packages from 0.35.4 to 0.35.5, matching ten libvips packages from 1.3.3 to 1.3.4, and source-map-js from 1.2.1 to 1.2.2. All 28 changed entries use exact public npm version metadata and SHA-512 integrities. Optional OS/CPU/libc classifications and wrapper dependency edges are preserved. The other 82 lock nodes, root dependencies and package.json remain unchanged.

## Verification boundaries

Local checks compare the patch with accepted Community main `872016ca3838b32b5ef943395b16730012fcba30`, public registry version/name/integrity fields and every changed native dependency edge. No packages, binaries or tarballs were installed locally; no package cache was refreshed. Metadata agreement does not prove the installed graph or application compatibility.

Required acceptance remains exact-head CI: `npm ci` must validate the complete locked graph and artifact integrity, followed by the unchanged high-severity dependency audit, TypeScript, production build and existing runtime/admin-session checks. The audit must not be weakened or bypassed. The separate Controller browser proof must then be rerun on this accepted dependency graph. Only a passing, conflict-free head may be merged, followed by exact-main verification. This source patch does not deploy anything or certify all platforms' native sharp binaries.
