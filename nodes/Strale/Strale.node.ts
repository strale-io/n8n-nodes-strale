import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IHttpRequestOptions,
	NodeConnectionType,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

const BASE_URL = 'https://api.strale.io';

// Operations that work without an API key
const FREE_TIER_SLUGS = new Set([
	'email-validate',
	'dns-lookup',
	'json-repair',
	'url-to-markdown',
	'iban-validate',
]);

export class Strale implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Strale',
		name: 'strale',
		icon: 'file:strale.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + " (" + $parameter["resource"] + ")"}}',
		description:
			'Trust layer for AI agents — 250+ verified data capabilities with quality scores and audit trails. Free email and IBAN validation.',
		defaults: {
			name: 'Strale',
		},
		inputs: ['main'] as NodeConnectionType[],
		outputs: ['main'] as NodeConnectionType[],
		usableAsTool: true,
		credentials: [
			{
				name: 'straleApi',
				required: false,
			},
		],
		properties: [
			// ── Resource selector ─────────────────────────────────────────
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Validation', value: 'validation' },
					{ name: 'Domain Intelligence', value: 'domainIntelligence' },
					{ name: 'Web Extraction', value: 'webExtraction' },
					{ name: 'Data Utilities', value: 'dataUtilities' },
					{ name: 'Lead Enrichment', value: 'leadEnrichment' },
					{ name: 'Custom', value: 'custom' },
				],
				default: 'validation',
			},

			// ── Validation operations ─────────────────────────────────────
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['validation'] } },
				options: [
					{
						name: 'Validate Email',
						value: 'emailValidate',
						description: 'Validate an email address (free, no API key needed)',
						action: 'Validate an email address',
					},
					{
						name: 'Validate IBAN',
						value: 'ibanValidate',
						description: 'Validate an international bank account number (free, no API key needed)',
						action: 'Validate an IBAN',
					},
					{
						name: 'Validate VAT',
						value: 'vatValidate',
						description: 'Validate a European VAT number via VIES',
						action: 'Validate a VAT number',
					},
				],
				default: 'emailValidate',
			},

			// ── Domain Intelligence operations ────────────────────────────
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['domainIntelligence'] } },
				options: [
					{
						name: 'DNS Lookup',
						value: 'dnsLookup',
						description: 'Look up DNS records for a domain (free, no API key needed)',
						action: 'Look up DNS records',
					},
					{
						name: 'WHOIS Lookup',
						value: 'whoisLookup',
						description: 'Get WHOIS registration data for a domain',
						action: 'Look up WHOIS data',
					},
					{
						name: 'SSL Check',
						value: 'sslCheck',
						description: 'Check SSL certificate validity and details',
						action: 'Check SSL certificate',
					},
					{
						name: 'Domain Reputation',
						value: 'domainReputation',
						description: 'Assess domain reputation and trust signals',
						action: 'Check domain reputation',
					},
				],
				default: 'dnsLookup',
			},

			// ── Web Extraction operations ─────────────────────────────────
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['webExtraction'] } },
				options: [
					{
						name: 'URL to Markdown',
						value: 'urlToMarkdown',
						description: 'Convert a web page to clean Markdown (free, no API key needed)',
						action: 'Convert URL to Markdown',
					},
					{
						name: 'Screenshot URL',
						value: 'screenshotUrl',
						description: 'Take a screenshot of a web page',
						action: 'Screenshot a URL',
					},
					{
						name: 'Extract Metadata',
						value: 'metaExtract',
						description: 'Extract title, description, Open Graph, and structured data from a URL',
						action: 'Extract metadata from URL',
					},
				],
				default: 'urlToMarkdown',
			},

			// ── Data Utilities operations ─────────────────────────────────
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['dataUtilities'] } },
				options: [
					{
						name: 'JSON Repair',
						value: 'jsonRepair',
						description: 'Fix malformed JSON (free, no API key needed)',
						action: 'Repair malformed JSON',
					},
					{
						name: 'Currency Convert',
						value: 'currencyConvert',
						description: 'Convert between currencies at live rates',
						action: 'Convert currency',
					},
					{
						name: 'Summarize Text',
						value: 'summarize',
						description: 'Summarize text using AI',
						action: 'Summarize text',
					},
				],
				default: 'jsonRepair',
			},

			// ── Lead Enrichment operations ────────────────────────────────
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['leadEnrichment'] } },
				options: [
					{
						name: 'Enrich Company',
						value: 'companyEnrich',
						description: 'Enrich company data from a domain or URL',
						action: 'Enrich company data',
					},
					{
						name: 'Detect Tech Stack',
						value: 'techStackDetect',
						description: 'Detect technologies used by a website',
						action: 'Detect tech stack',
					},
				],
				default: 'companyEnrich',
			},

			// ── Custom operations ─────────────────────────────────────────
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['custom'] } },
				options: [
					{
						name: 'Execute Capability',
						value: 'executeCapability',
						description: 'Execute any of 250+ Strale capabilities by slug or natural language',
						action: 'Execute a capability',
					},
					{
						name: 'Search Capabilities',
						value: 'searchCapabilities',
						description: 'Search the capability catalog',
						action: 'Search capabilities',
					},
					{
						name: 'Check Balance',
						value: 'checkBalance',
						description: 'Check wallet balance',
						action: 'Check wallet balance',
					},
				],
				default: 'executeCapability',
			},

			// ── Input fields ──────────────────────────────────────────────

			// Email
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				default: '',
				required: true,
				placeholder: 'hello@example.com',
				displayOptions: {
					show: { operation: ['emailValidate'] },
				},
			},

			// IBAN
			{
				displayName: 'IBAN',
				name: 'iban',
				type: 'string',
				default: '',
				required: true,
				placeholder: 'DE89370400440532013000',
				displayOptions: {
					show: { operation: ['ibanValidate'] },
				},
			},

			// VAT number
			{
				displayName: 'VAT Number',
				name: 'vatNumber',
				type: 'string',
				default: '',
				required: true,
				placeholder: 'SE556703748501',
				displayOptions: {
					show: { operation: ['vatValidate'] },
				},
			},

			// Domain (shared across multiple operations)
			{
				displayName: 'Domain',
				name: 'domain',
				type: 'string',
				default: '',
				required: true,
				placeholder: 'example.com',
				displayOptions: {
					show: { operation: ['dnsLookup', 'whoisLookup', 'sslCheck', 'domainReputation'] },
				},
			},

			// URL (shared across web extraction + enrichment)
			{
				displayName: 'URL',
				name: 'url',
				type: 'string',
				default: '',
				required: true,
				placeholder: 'https://example.com',
				displayOptions: {
					show: {
						operation: [
							'urlToMarkdown',
							'screenshotUrl',
							'metaExtract',
							'companyEnrich',
							'techStackDetect',
						],
					},
				},
			},

			// JSON string
			{
				displayName: 'JSON String',
				name: 'jsonString',
				type: 'string',
				typeOptions: { rows: 5 },
				default: '',
				required: true,
				placeholder: '{"name": "test", missing_quote: true}',
				displayOptions: {
					show: { operation: ['jsonRepair'] },
				},
			},

			// Currency convert fields
			{
				displayName: 'Amount',
				name: 'amount',
				type: 'number',
				default: 100,
				required: true,
				displayOptions: { show: { operation: ['currencyConvert'] } },
			},
			{
				displayName: 'From Currency',
				name: 'fromCurrency',
				type: 'string',
				default: 'EUR',
				required: true,
				placeholder: 'EUR',
				displayOptions: { show: { operation: ['currencyConvert'] } },
			},
			{
				displayName: 'To Currency',
				name: 'toCurrency',
				type: 'string',
				default: 'USD',
				required: true,
				placeholder: 'USD',
				displayOptions: { show: { operation: ['currencyConvert'] } },
			},

			// Summarize text
			{
				displayName: 'Text',
				name: 'text',
				type: 'string',
				typeOptions: { rows: 5 },
				default: '',
				required: true,
				displayOptions: { show: { operation: ['summarize'] } },
			},

			// Custom: execute capability
			{
				displayName: 'Capability Slug',
				name: 'capabilitySlug',
				type: 'string',
				default: '',
				placeholder: 'iban-validate',
				description: 'The slug of the capability to execute. Leave empty to use natural language task.',
				displayOptions: { show: { operation: ['executeCapability'] } },
			},
			{
				displayName: 'Task',
				name: 'task',
				type: 'string',
				default: '',
				placeholder: 'Validate IBAN DE89370400440532013000',
				description:
					'Natural language description of what you want to do. Used when Capability Slug is empty.',
				displayOptions: { show: { operation: ['executeCapability'] } },
			},
			{
				displayName: 'Input (JSON)',
				name: 'inputJson',
				type: 'json',
				default: '{}',
				description: 'JSON object with input parameters for the capability',
				displayOptions: { show: { operation: ['executeCapability'] } },
			},

			// Custom: search
			{
				displayName: 'Query',
				name: 'query',
				type: 'string',
				default: '',
				required: true,
				placeholder: 'validate bank account numbers',
				displayOptions: { show: { operation: ['searchCapabilities'] } },
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;

				let result: Record<string, unknown> | Record<string, unknown>[];

				if (operation === 'checkBalance') {
					result = await straleGet.call(this, '/v1/balance');
				} else if (operation === 'searchCapabilities') {
					const query = this.getNodeParameter('query', i) as string;
					const capabilities = await straleGet.call(this, '/v1/capabilities');
					const caps = (capabilities as Record<string, unknown>).capabilities as Array<Record<string, unknown>> ?? capabilities;
					const q = query.toLowerCase();
					const filtered = (Array.isArray(caps) ? caps : []).filter(
						(c: Record<string, unknown>) =>
							String(c.name ?? '').toLowerCase().includes(q) ||
							String(c.slug ?? '').toLowerCase().includes(q) ||
							String(c.description ?? '').toLowerCase().includes(q) ||
							String(c.category ?? '').toLowerCase().includes(q),
					);
					result = { query, count: filtered.length, capabilities: filtered.slice(0, 20) };
				} else {
					const { slug, inputs } = buildRequest.call(this, i, resource, operation);
					const isFree = FREE_TIER_SLUGS.has(slug);
					result = await straleDo.call(this, slug, inputs, isFree);
				}

				returnData.push({ json: result as INodeExecutionData['json'] });
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: (error as Error).message } as INodeExecutionData['json'],
						pairedItem: { item: i },
					});
					continue;
				}
				throw new NodeOperationError(this.getNode(), error as Error, { itemIndex: i });
			}
		}

		return [returnData];
	}
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildRequest(
	this: IExecuteFunctions,
	i: number,
	_resource: string,
	operation: string,
): { slug: string; inputs: Record<string, unknown> } {
	switch (operation) {
		case 'emailValidate':
			return { slug: 'email-validate', inputs: { email: this.getNodeParameter('email', i) } };
		case 'ibanValidate':
			return { slug: 'iban-validate', inputs: { iban: this.getNodeParameter('iban', i) } };
		case 'vatValidate':
			return {
				slug: 'vat-validate',
				inputs: { vat_number: this.getNodeParameter('vatNumber', i) },
			};
		case 'dnsLookup':
			return { slug: 'dns-lookup', inputs: { domain: this.getNodeParameter('domain', i) } };
		case 'whoisLookup':
			return { slug: 'whois-lookup', inputs: { domain: this.getNodeParameter('domain', i) } };
		case 'sslCheck':
			return { slug: 'ssl-check', inputs: { domain: this.getNodeParameter('domain', i) } };
		case 'domainReputation':
			return {
				slug: 'domain-reputation',
				inputs: { domain: this.getNodeParameter('domain', i) },
			};
		case 'urlToMarkdown':
			return { slug: 'url-to-markdown', inputs: { url: this.getNodeParameter('url', i) } };
		case 'screenshotUrl':
			return { slug: 'screenshot-url', inputs: { url: this.getNodeParameter('url', i) } };
		case 'metaExtract':
			return { slug: 'meta-extract', inputs: { url: this.getNodeParameter('url', i) } };
		case 'jsonRepair':
			return {
				slug: 'json-repair',
				inputs: { json_string: this.getNodeParameter('jsonString', i) },
			};
		case 'currencyConvert':
			return {
				slug: 'exchange-rate',
				inputs: {
					amount: this.getNodeParameter('amount', i),
					from: this.getNodeParameter('fromCurrency', i),
					to: this.getNodeParameter('toCurrency', i),
				},
			};
		case 'summarize':
			return { slug: 'text-summarize', inputs: { text: this.getNodeParameter('text', i) } };
		case 'companyEnrich':
			return { slug: 'company-enrich', inputs: { url: this.getNodeParameter('url', i) } };
		case 'techStackDetect':
			return {
				slug: 'tech-stack-detect',
				inputs: { url: this.getNodeParameter('url', i) },
			};
		case 'executeCapability': {
			const slug = this.getNodeParameter('capabilitySlug', i) as string;
			const task = this.getNodeParameter('task', i) as string;
			const inputJson = this.getNodeParameter('inputJson', i) as string | Record<string, unknown>;
			const inputs =
				typeof inputJson === 'string' ? JSON.parse(inputJson || '{}') : inputJson;
			if (slug) {
				return { slug, inputs: inputs as Record<string, unknown> };
			}
			// Natural language — pass as task, let Strale route it
			return { slug: '', inputs: { _task: task, ...(inputs as Record<string, unknown>) } };
		}
		default:
			throw new Error(`Unknown operation: ${operation}`);
	}
}

async function straleDo(
	this: IExecuteFunctions,
	slug: string,
	inputs: Record<string, unknown>,
	isFree: boolean,
): Promise<Record<string, unknown>> {
	const body: Record<string, unknown> = {};
	if (slug) {
		body.capability_slug = slug;
		body.inputs = inputs;
	} else {
		// Natural language mode
		body.task = inputs._task;
		const rest = { ...inputs };
		delete rest._task;
		if (Object.keys(rest).length > 0) {
			body.inputs = rest;
		}
	}

	const options: IHttpRequestOptions = {
		method: 'POST',
		url: `${BASE_URL}/v1/do`,
		body,
		json: true,
	};

	let result: Record<string, unknown>;
	if (isFree) {
		// Free-tier: call without auth
		result = (await this.helpers.httpRequest({
			method: 'POST',
			url: `${BASE_URL}/v1/do`,
			body,
			headers: { 'Content-Type': 'application/json' },
		})) as Record<string, unknown>;
	} else {
		result = (await this.helpers.httpRequestWithAuthentication.call(
			this,
			'straleApi',
			options,
		)) as Record<string, unknown>;
	}

	// Flatten: return output directly if present, otherwise full response
	if (result.output && typeof result.output === 'object') {
		return {
			...(result.output as Record<string, unknown>),
			_strale: {
				transaction_id: result.transaction_id,
				sqs: result.sqs,
				execution_time_ms: result.execution_time_ms,
				capability_slug: result.capability_slug,
				provenance: result.provenance,
			},
		};
	}
	return result;
}

async function straleGet(
	this: IExecuteFunctions,
	path: string,
): Promise<Record<string, unknown>> {
	const options: IHttpRequestOptions = {
		method: 'GET',
		url: `${BASE_URL}${path}`,
		json: true,
	};
	return (await this.helpers.httpRequestWithAuthentication.call(
		this,
		'straleApi',
		options,
	)) as Record<string, unknown>;
}
