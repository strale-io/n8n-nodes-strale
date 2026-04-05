import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class StraleApi implements ICredentialType {
	name = 'straleApi';
	displayName = 'Strale API';
	documentationUrl = 'https://strale.dev/docs';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			description:
				'Your Strale API key (starts with sk_live_). Some operations like IBAN and email validation work without a key.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials?.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.strale.io',
			url: '/v1/wallet/balance',
			method: 'GET',
		},
	};
}
