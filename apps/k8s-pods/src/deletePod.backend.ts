import { request } from '@datadog/action-catalog/http/http';

// kubeAPIConnectionId references a Datadog HTTP connection that holds the
// credentials needed to authenticate against the Kubernetes API server.
// Create a connection at /actions/connections (e.g. a generic HTTP connection
// with a service-account bearer token), then paste its ID here. The build
// requires this to be a static string constant.
const kubeAPIConnectionId = '';

// kubeAPIBaseURL is the default Kubernetes API server base URL. It can be
// overridden per-request from the app settings.
const kubeAPIBaseURL = 'https://kubernetes.default.svc';

export type DeletePodInput = {
	namespace: string;
	podName: string;
	// apiBaseURL optionally overrides the Kubernetes API server base URL.
	apiBaseURL?: string;
};

export type DeletePodOutput = {
	status: number;
};

// nameRe is the DNS-1123 subdomain/label shape used by Kubernetes object names.
const nameRe = /^[a-z0-9]([-a-z0-9.]{0,240}[a-z0-9])?$/;

// deletePod issues a DELETE request for a single pod against the Kubernetes
// API server through the generic HTTP action. Authentication is provided by
// the referenced HTTP connection; no credentials are handled by this app.
export async function deletePod(input: DeletePodInput): Promise<DeletePodOutput> {
	if (kubeAPIConnectionId === '') {
		throw new Error(
			'deleting pods is not configured: set kubeAPIConnectionId in deletePod.backend.ts to the ID of an HTTP connection holding Kubernetes API credentials',
		);
	}
	if (!nameRe.test(input.namespace)) {
		throw new Error('invalid namespace name');
	}
	if (!nameRe.test(input.podName)) {
		throw new Error('invalid pod name');
	}
	const base = (input.apiBaseURL || kubeAPIBaseURL).replace(/\/+$/, '');
	if (!base.startsWith('https://')) {
		throw new Error('apiBaseURL must be an https:// URL of the Kubernetes API server');
	}

	const response = await request({
		inputs: {
			verb: 'DELETE',
			url: `${base}/api/v1/namespaces/${input.namespace}/pods/${input.podName}`,
			responseParsing: 'json',
			errorOnStatus: ['400-599'],
		},
		connectionId: kubeAPIConnectionId,
	});

	return { status: response.status };
}
