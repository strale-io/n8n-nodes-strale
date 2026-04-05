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

export class Strale implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Strale',
		name: 'strale',
		icon: 'file:strale.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description:
			'Trust layer for AI agents — 271 verified data capabilities with quality scores and audit trails. Free email & IBAN validation, company data across 27 countries, sanctions screening, web scraping, lead enrichment, and more.',
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
		requestDefaults: {
			baseURL: BASE_URL,
			headers: {
				'Content-Type': 'application/json',
			},
		},
		properties: [
			// ── Resource ──────────────────────────────────────────────────
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Capabilities', value: 'capabilities' },
					{ name: 'Solutions', value: 'solutions' },
					{ name: 'Account', value: 'account' },
				],
				default: 'capabilities',
			},

			// ── Capabilities operations ───────────────────────────────────
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['capabilities'] } },
				options: [
					{
						name: 'Search',
						value: 'search',
						description: 'Find capabilities by keyword or category',
						action: 'Search capabilities',
					},
					{
						name: 'Execute',
						value: 'execute',
						description: 'Run any capability by slug',
						action: 'Execute a capability',
					},
					{
						name: 'Trust Profile',
						value: 'trustProfile',
						description: 'Check quality score before calling a capability',
						action: 'Get trust profile',
					},
				],
				default: 'search',
			},

			// ── Solutions operations ──────────────────────────────────────
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['solutions'] } },
				options: [
					{
						name: 'Execute Solution',
						value: 'executeSolution',
						description: 'Run a multi-step solution (e.g., KYC, lead enrichment, website audit)',
						action: 'Execute a solution',
					},
				],
				default: 'executeSolution',
			},

			// ── Account operations ────────────────────────────────────────
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['account'] } },
				options: [
					{
						name: 'Balance',
						value: 'balance',
						description: 'Check wallet balance',
						action: 'Check wallet balance',
					},
				],
				default: 'balance',
			},

			// ── Search fields ─────────────────────────────────────────────
			{
				displayName: 'Query',
				name: 'query',
				type: 'string',
				default: '',
				required: true,
				placeholder: 'e.g., sanctions, IBAN, company data, web scraping',
				description: 'Search keyword to find matching capabilities',
				displayOptions: { show: { operation: ['search'] } },
			},
			{
				displayName: 'Category',
				name: 'category',
				type: 'options',
				default: '',
				description: 'Filter results by category',
				displayOptions: { show: { operation: ['search'] } },
				options: [
					{ name: 'All Categories', value: '' },
					{ name: 'Compliance', value: 'compliance' },
					{ name: 'Competitive Intelligence', value: 'competitive-intelligence' },
					{ name: 'Data Extraction', value: 'data-extraction' },
					{ name: 'Data Processing', value: 'data-processing' },
					{ name: 'Developer Tools', value: 'developer-tools' },
					{ name: 'Document Extraction', value: 'document-extraction' },
					{ name: 'File Conversion', value: 'file-conversion' },
					{ name: 'Financial', value: 'financial' },
					{ name: 'Monitoring', value: 'monitoring' },
					{ name: 'Sales', value: 'sales' },
					{ name: 'Security', value: 'security' },
					{ name: 'Text Processing', value: 'text-processing' },
					{ name: 'Utility', value: 'utility' },
					{ name: 'Validation', value: 'validation' },
					{ name: 'Web Intelligence', value: 'web-intelligence' },
					{ name: 'Web Scraping', value: 'web-scraping' },
					{ name: 'Web3', value: 'web3' },
				],
			},

			// ── Execute fields ────────────────────────────────────────────
			{
				displayName: 'Slug',
				name: 'slug',
				type: 'string',
				default: '',
				required: true,
				placeholder: 'e.g., email-validate, swedish-company-data, pep-check',
				description: 'Capability slug from search results. Use Search to discover available slugs.',
				displayOptions: { show: { operation: ['execute'] } },
			},
			{
				displayName: 'Input',
				name: 'input',
				type: 'json',
				default: '{}',
				required: true,
				description: 'Input parameters as a JSON object. Fields depend on the capability.',
				displayOptions: { show: { operation: ['execute'] } },
			},
			{
				displayName: 'Max Price (EUR Cents)',
				name: 'maxPriceCents',
				type: 'number',
				default: 200,
				description: 'Maximum price in EUR cents. Execution fails if the capability costs more. Default: 200 (€2.00).',
				displayOptions: { show: { operation: ['execute'] } },
			},

			// ── Trust Profile fields ──────────────────────────────────────
			{
				displayName: 'Slug',
				name: 'trustSlug',
				type: 'string',
				default: '',
				required: true,
				placeholder: 'e.g., iban-validate, kyb-essentials-se',
				description: 'Capability or solution slug to check',
				displayOptions: { show: { operation: ['trustProfile'] } },
			},

			// ── Execute Solution fields ───────────────────────────────────
			{
				displayName: 'Slug',
				name: 'solutionSlug',
				type: 'string',
				default: '',
				required: true,
				placeholder: 'e.g., kyb-essentials-se, lead-enrich, invoice-verify-uk',
				description: 'Solution slug. Use Search to discover available solutions.',
				displayOptions: { show: { operation: ['executeSolution'] } },
			},
			{
				displayName: 'Input',
				name: 'solutionInput',
				type: 'json',
				default: '{}',
				required: true,
				description: 'Input parameters as a JSON object. Fields depend on the solution.',
				displayOptions: { show: { operation: ['executeSolution'] } },
			},
			{
				displayName: 'Max Price (EUR Cents)',
				name: 'solutionMaxPriceCents',
				type: 'number',
				default: 500,
				description: 'Maximum price in EUR cents. Solutions are multi-step and cost more. Default: 500 (€5.00).',
				displayOptions: { show: { operation: ['executeSolution'] } },
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const operation = this.getNodeParameter('operation', i) as string;
				let result: INodeExecutionData['json'];

				switch (operation) {
					case 'search':
						result = await executeSearch.call(this, i);
						break;
					case 'execute':
						result = await executeCapability.call(this, i);
						break;
					case 'trustProfile':
						result = await executeTrustProfile.call(this, i);
						break;
					case 'executeSolution':
						result = await executeSolution.call(this, i);
						break;
					case 'balance':
						result = await executeBalance.call(this);
						break;
					default:
						throw new Error(`Unknown operation: ${operation}`);
				}

				returnData.push({ json: result });
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

// ── Operation handlers ────────────────────────────────────────────────────────

async function executeSearch(
	this: IExecuteFunctions,
	i: number,
): Promise<INodeExecutionData['json']> {
	const query = this.getNodeParameter('query', i) as string;
	const category = this.getNodeParameter('category', i) as string;

	let url = `${BASE_URL}/v1/capabilities`;
	const params: string[] = [];
	if (query) params.push(`search=${encodeURIComponent(query)}`);
	if (category) params.push(`category=${encodeURIComponent(category)}`);
	if (params.length) url += `?${params.join('&')}`;

	// Search works without auth
	const result = await this.helpers.httpRequest({
		method: 'GET',
		url,
		headers: { Accept: 'application/json' },
	});
	return result as INodeExecutionData['json'];
}

async function executeCapability(
	this: IExecuteFunctions,
	i: number,
): Promise<INodeExecutionData['json']> {
	const slug = this.getNodeParameter('slug', i) as string;
	const input = this.getNodeParameter('input', i);
	const maxPriceCents = this.getNodeParameter('maxPriceCents', i) as number;

	const parsedInput = typeof input === 'string' ? JSON.parse(input || '{}') : input;

	const body = {
		capability_slug: slug,
		inputs: parsedInput,
		max_price_cents: maxPriceCents,
	};

	return await stralePost.call(this, '/v1/do', body);
}

async function executeSolution(
	this: IExecuteFunctions,
	i: number,
): Promise<INodeExecutionData['json']> {
	const slug = this.getNodeParameter('solutionSlug', i) as string;
	const input = this.getNodeParameter('solutionInput', i);
	const maxPriceCents = this.getNodeParameter('solutionMaxPriceCents', i) as number;

	const parsedInput = typeof input === 'string' ? JSON.parse(input || '{}') : input;

	const body = {
		capability_slug: slug,
		inputs: parsedInput,
		max_price_cents: maxPriceCents,
	};

	return await stralePost.call(this, '/v1/do', body);
}

async function executeTrustProfile(
	this: IExecuteFunctions,
	i: number,
): Promise<INodeExecutionData['json']> {
	const slug = this.getNodeParameter('trustSlug', i) as string;
	const url = `${BASE_URL}/v1/quality/${encodeURIComponent(slug)}`;

	// Quality endpoint is public, no auth needed
	const result = await this.helpers.httpRequest({
		method: 'GET',
		url,
		headers: { Accept: 'application/json' },
	});
	return result as INodeExecutionData['json'];
}

async function executeBalance(
	this: IExecuteFunctions,
): Promise<INodeExecutionData['json']> {
	const options: IHttpRequestOptions = {
		method: 'GET',
		url: `${BASE_URL}/v1/wallet/balance`,
		json: true,
	};
	const result = await this.helpers.httpRequestWithAuthentication.call(
		this,
		'straleApi',
		options,
	);
	return result as INodeExecutionData['json'];
}

// ── HTTP helpers ──────────────────────────────────────────────────────────────

async function stralePost(
	this: IExecuteFunctions,
	path: string,
	body: Record<string, unknown>,
): Promise<INodeExecutionData['json']> {
	const options: IHttpRequestOptions = {
		method: 'POST',
		url: `${BASE_URL}${path}`,
		body,
		json: true,
	};

	// Try authenticated request first; fall back to unauthenticated for free-tier
	try {
		const result = await this.helpers.httpRequestWithAuthentication.call(
			this,
			'straleApi',
			options,
		);
		return result as INodeExecutionData['json'];
	} catch (error) {
		// If credentials aren't configured, fall back to unauthenticated (free-tier)
		const msg = (error as Error).message || '';
		if (msg.includes('No credentials') || msg.includes('credentials')) {
			const result = await this.helpers.httpRequest({
				...options,
				headers: { 'Content-Type': 'application/json' },
			});
			return result as INodeExecutionData['json'];
		}
		throw error;
	}
}
