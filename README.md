# n8n-nodes-strale

n8n community node for [Strale](https://strale.dev) — 250+ verified data capabilities with quality scores and audit trails.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Credentials

1. Sign up at [strale.dev](https://strale.dev) to get an API key (starts with `sk_live_`)
2. In n8n, go to **Credentials** > **New Credential** > **Strale API**
3. Paste your API key

**Free-tier operations** (email validation, IBAN validation, DNS lookup, JSON repair, URL to Markdown) work without an API key.

## Operations

### Validation
| Operation | Slug | Free | Description |
|-----------|------|------|-------------|
| Validate Email | `email-validate` | Yes | Check email deliverability and format |
| Validate IBAN | `iban-validate` | Yes | Validate international bank account numbers |
| Validate VAT | `vat-validate` | No | Validate European VAT numbers via VIES |

### Domain Intelligence
| Operation | Slug | Description |
|-----------|------|-------------|
| DNS Lookup | `dns-lookup` | Look up DNS records (free) |
| WHOIS Lookup | `whois-lookup` | Get domain registration data |
| SSL Check | `ssl-check` | Check SSL certificate validity |
| Domain Reputation | `domain-reputation` | Assess domain trust signals |

### Web Extraction
| Operation | Slug | Description |
|-----------|------|-------------|
| URL to Markdown | `url-to-markdown` | Convert web page to Markdown (free) |
| Screenshot URL | `screenshot-url` | Take a page screenshot |
| Extract Metadata | `meta-extract` | Extract Open Graph, title, structured data |

### Data Utilities
| Operation | Slug | Description |
|-----------|------|-------------|
| JSON Repair | `json-repair` | Fix malformed JSON (free) |
| Currency Convert | `exchange-rate` | Convert currencies at live rates |
| Summarize Text | `text-summarize` | AI-powered text summarization |

### Lead Enrichment
| Operation | Slug | Description |
|-----------|------|-------------|
| Enrich Company | `company-enrich` | Enrich company data from URL |
| Detect Tech Stack | `tech-stack-detect` | Detect website technologies |

### Custom
| Operation | Description |
|-----------|-------------|
| Execute Capability | Run any of 250+ capabilities by slug or natural language |
| Search Capabilities | Search the capability catalog |
| Check Balance | Check wallet balance |

## Output

Every operation returns the capability output plus Strale metadata:

```json
{
  "valid": true,
  "country": "DE",
  "bank_name": "Commerzbank",
  "_strale": {
    "transaction_id": "txn_abc123",
    "sqs": 98,
    "execution_time_ms": 12,
    "capability_slug": "iban-validate",
    "provenance": {
      "source": "algorithmic",
      "fetched_at": "2026-03-31T10:00:00Z"
    }
  }
}
```

The `_strale.sqs` field is the Strale Quality Score (0-100) indicating the capability's current reliability.

## Resources

- [Strale Documentation](https://strale.dev/docs)
- [Capability Catalog](https://strale.dev/capabilities)
- [Quality Methodology](https://strale.dev/quality)
- [n8n Community Nodes Docs](https://docs.n8n.io/integrations/community-nodes/)

## License

[MIT](LICENSE)
