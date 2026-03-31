# n8n-nodes-strale

Connect n8n workflows to [Strale](https://strale.dev) — 250+ verified data capabilities with quality scores and audit trails.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## What you can do

| Operation | Resource | Description |
|-----------|----------|-------------|
| **Search** | Capabilities | Find capabilities by keyword or category (e.g., "IBAN", "sanctions", "company data") |
| **Execute** | Capabilities | Run any of 250+ capabilities by slug |
| **Trust Profile** | Capabilities | Check a capability's quality score before calling it |
| **Execute Solution** | Solutions | Run multi-step workflows (e.g., KYC, lead enrichment, website audit) |
| **Balance** | Account | Check your wallet balance |

## Free tier

These capabilities work without an API key — just install and use:

- `email-validate` — validate any email address
- `iban-validate` — validate any IBAN
- `dns-lookup` — DNS records for any domain
- `url-to-markdown` — convert any URL to clean Markdown
- `json-repair` — fix malformed JSON

## Quick start

1. Install the node in n8n
2. Add a Strale node to your workflow
3. Use **Search** to find a capability (e.g., query: "email")
4. Use **Execute** with the slug from search results and your input

## Credentials

1. Sign up at [strale.dev](https://strale.dev) — new accounts get €2.00 in trial credits, no card required
2. In n8n, go to **Credentials** > **New Credential** > **Strale API**
3. Paste your API key (starts with `sk_live_`)

Free-tier operations work without credentials.

## Example: validate an email (free, no API key)

- Operation: **Execute**
- Slug: `email-validate`
- Input: `{ "email": "test@example.com" }`

## Example: KYB check on a Swedish company

- Operation: **Execute Solution**
- Slug: `kyb-essentials-se`
- Input: `{ "org_number": "5591674668" }`

## Example: check quality before calling

- Operation: **Trust Profile**
- Slug: `iban-validate`
- Returns: SQS score (0-100), quality grade, reliability grade, trend

## Links

- [Strale API docs](https://strale.dev/docs)
- [Full capability catalog](https://api.strale.io/v1/capabilities)
- [Quality methodology](https://strale.dev/quality)
- [MCP server](https://www.npmjs.com/package/strale-mcp)

## License

[MIT](LICENSE)
