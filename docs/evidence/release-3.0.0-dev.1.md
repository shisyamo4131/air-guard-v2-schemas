# Release Evidence: 3.0.0-dev.1

- Status: Published and content-verified
- Date: 2026-09-01
- Package: `@shisyamo4131/air-guard-v2-schemas@3.0.0-dev.1`
- Commit: `c84bee2f3c934618489b691dadecbd23a534372a`
- Annotated tag: `v3.0.0-dev.1`
- Tag object: `b317eab74d5c635bb0765ba2c2354e93e1529d9e`
- Workflow: [run 33467705041](https://github.com/shisyamo4131/air-guard-v2-schemas/actions/runs/33467705041)

## Workflow Evidence

| Job | Job ID | Conclusion |
| --- | --- | --- |
| Node 22 formal package tests | `99730896341` | success |
| Node 24 formal package tests | `99730896122` | success |
| Node 24 release guard and Trusted Publishing | `99730940695` | success |

The workflow used exact tag `v3.0.0-dev.1` at the recorded commit. The publish job completed `npm run check:release` before `npm publish --tag dev`. Local `main` advanced to the same commit through a six-commit fast-forward, and the annotated tag peeled to that commit. No rerun, tag move, tag deletion, force push, unpublish, or deprecation was used.

## Registry and Content Evidence

- npm `dev` dist-tag: `3.0.0-dev.1`
- registry `gitHead`: `c84bee2f3c934618489b691dadecbd23a534372a`
- published at: `2026-09-01T03:51:41.732Z`
- shasum: `e195a1de3ccafe7b369c79e1c8e327fe571fd666`
- integrity: `sha512-Pg5ZdBI5MDP5Ks2sN/HtzLGDhtOYcGSOczFI+AYvT2hf0b4EqoS6ditTm3ca66mQ0YVNHX7EHchX19lbmv9/CA==`
- package files: 83
- unpacked size: 521,085 bytes

The downloaded registry tarball bytes matched the registry SHA-1 and SHA-512 metadata. All 83 extracted files matched the exact tagged commit after LF normalization. Required public content included `src/Company.js` and the retained role-preset and Company Configuration Boundary modules. Root tests and `src/company-configuration/legacy.js` were absent. `mapLegacyCompanyToConfigurationV1`, `parseCompanyEntitlementV1`, and `parseCompanyPrivateEntitlementV1` were absent from both public source entry points.

## Fresh-install Evidence

A fresh credentials-free registry install under Node 24.19.0 succeeded with `@holiday-jp/holiday_jp@2.5.1` and `@shisyamo4131/air-firebase-v2@2.3.1-dev.6`. Verification confirmed:

- package version `3.0.0-dev.1`;
- successful imports from the package root, `./constants`, `./company-configuration`, `./apis`, and `./utils`;
- the retained three role-preset exports;
- the exact corrected 24-name Company Configuration Boundary surface;
- no removed export in the package root or Company Configuration Boundary subpath;
- installed `src/Company.js` and no installed legacy mapper file;
- legacy-shaped `Company` input does not retain or serialize `stripeCustomerId`, `subscription`, or nested `employeeLimit`.

The workstation required Node's `--use-system-ca` option for the temporary npm client to trust the local TLS chain; no authentication or reauthentication was requested. Temporary tarball, extraction, npm cache, and fresh-install roots were removed and their absence was checked. The source repository remained clean after verification.

## Boundary

Publication does not authorize or imply AirGuardV2 dependency or code changes, Firebase or Stripe operations, deployment, data creation or migration, unpublish, deprecation, tag mutation, force push, or history rewrite. Corrected-version adoption remains a separate consumer-owned checkpoint. AirGuardV2 root and Functions must adopt one exact verified version/content together, and exact 2.4.2-dev.167 plus the previous consumer code remains their rollback baseline.
