# n8n Creator Portal Pre-flight Audit — 2026-04-05

## Pre-flight audit results

| # | Check | Status | Notes |
|---|-------|--------|-------|
| 1 | Package name | PASS | `n8n-nodes-strale` — follows `n8n-nodes-*` convention |
| 2 | Package version | PASS | Local 0.1.2 matches npm 0.1.2 |
| 3 | Keywords | PASS | `["n8n-community-node-package"]` present |
| 4 | n8n attribute | PASS | `nodes` and `credentials` arrays reference correct dist/ paths, files exist |
| 5 | TypeScript | PASS | 2 .ts source files, 0 .js, strict: true, tsconfig.json valid |
| 6 | License | PASS | MIT LICENSE file present, matches package.json `license: "MIT"` |
| 7 | README quality | PASS | 339 words, installation instructions, usage examples, credentials docs, 271 count |
| 8 | No runtime deps | PASS | `dependencies`: none. `peerDependencies`: `n8n-workflow: "*"` (correct) |
| 9 | English only | PASS | No non-ASCII characters found in nodes/, credentials/, or README |
| 10 | GH Actions provenance | **WARNING** | Workflow exists with `--provenance`, but v0.1.2 was published locally (no OIDC attestation). Must republish via GH Actions for verified status |
| 11 | Security scan | PASS | `@n8n/scan-community-package` — 0 errors, 0 warnings |
| 12 | No env/fs access | PASS | No `process.env` or filesystem access in node/credential code |
| 13 | No competing features | PASS | Data marketplace, not workflow infrastructure |
| 14 | Node structure | PASS | 1 node, 3 resources, 5 operations, `usableAsTool: true`, optional credentials |
| 15 | Example workflows | PASS | 3 workflow JSON files in workflows/ |

## Verdict

**FIXES NEEDED — 1 item**

### Must fix before submission

1. **Provenance attestation missing on v0.1.2** — The current npm release was published locally (`npm publish` from CLI), not via GitHub Actions. n8n requires verified nodes to be published with npm provenance via GitHub Actions (OIDC signing). The workflow at `.github/workflows/publish.yml` is correctly configured with `--provenance --access public` and `id-token: write`, but it was not used for the v0.1.2 release.
   - **Fix:** Create a GitHub Release (tag v0.1.3) to trigger the publish workflow. This will publish with provenance attestation automatically.
   - **Verify:** After publishing, run `npm view n8n-nodes-strale@0.1.3 dist --json` and confirm an `attestations` field is present (not just `signatures`).

### Nice to have (not blocking)

1. **Dynamic category loading** — Categories are hardcoded (17 options). Could be fetched from `/v1/capabilities` at config time via `loadOptions`. Not required for verified status.
2. **Unit tests** — No test files exist. n8n doesn't strictly require tests for verified status, but they improve confidence.
3. **More keywords** — Only `n8n-community-node-package` is present. Adding `validation`, `compliance`, `api`, `data` would improve npm discoverability.

## Detailed check results

### Check 1: Package name
- **Value:** `n8n-nodes-strale`
- **Convention:** Matches `n8n-nodes-*`
- **Status:** PASS

### Check 2: Package version
- **Local:** 0.1.2
- **npm:** 0.1.2
- **Status:** PASS (in sync)

### Check 3: Keywords
- **Value:** `["n8n-community-node-package"]`
- **Required keyword present:** Yes
- **Status:** PASS

### Check 4: n8n attribute
```json
{
  "n8nNodesApiVersion": 1,
  "credentials": ["dist/credentials/StraleApi.credentials.js"],
  "nodes": ["dist/nodes/Strale/Strale.node.js"]
}
```
- Both referenced files exist in dist/
- **Status:** PASS

### Check 5: TypeScript
- Source files: 2 .ts (Strale.node.ts, StraleApi.credentials.ts)
- JavaScript files: 0 (all TypeScript)
- tsconfig.json: present, `strict: true`
- **Status:** PASS

### Check 6: License
- LICENSE file: present, MIT
- package.json license: "MIT"
- Match: Yes
- **Status:** PASS

### Check 7: README
- Word count: 339
- Installation instructions: Yes (links to n8n docs)
- Usage examples: Yes (3 examples: email validate, KYB, trust profile)
- Credentials documentation: Yes (3-step setup)
- Capability count: "271" (current)
- **Status:** PASS

### Check 8: Dependencies
- dependencies: None (empty)
- peerDependencies: `{"n8n-workflow": "*"}` (correct)
- devDependencies: TypeScript, ESLint, copyfiles (build-only, not shipped)
- **Status:** PASS

### Check 9: English only
- Non-ASCII scan: 0 hits across all source files and README
- **Status:** PASS

### Check 10: GitHub Actions provenance
- Workflow: `.github/workflows/publish.yml`
- Trigger: `release: types: [created]`
- Command: `npm publish --provenance --access public`
- Permissions: `id-token: write` (OIDC)
- v0.1.2 provenance: NOT present (published locally)
- npm dist shows `signatures` (registry-level) but no `attestations` (OIDC provenance)
- **Status:** WARNING — workflow is correct but wasn't used for current release

### Check 11: Security scan
```
✅ Package n8n-nodes-strale@0.1.2 has passed all security checks
```
- Exit code: 0
- Errors: 0
- Warnings: 0
- **Status:** PASS

### Check 12: No env/fs access
- `process.env` in node/credential code: 0 occurrences
- `fs` imports in node/credential code: 0 occurrences
- **Status:** PASS

### Check 13: No competing features
- Workflow execution code: None
- SSO/RBAC/monitoring code: None
- Note: Strale is a data capability marketplace, not workflow infrastructure
- **Status:** PASS

### Check 14: Node structure
- File: `nodes/Strale/Strale.node.ts`
- Resources: Capabilities, Solutions, Account
- Operations: Search, Execute, Trust Profile, Execute Solution, Balance
- `usableAsTool: true` (AI agent compatible)
- Credentials: Optional (free tier fallback implemented)
- Dynamic property loading: Not used (static categories)
- **Status:** PASS

### Check 15: Example workflows
- `workflows/validate-iban-free.json` — IBAN validation without API key
- `workflows/kyb-company-check.json` — Swedish company lookup
- `workflows/search-then-execute.json` — Search capabilities then run sanctions check
- **Status:** PASS
