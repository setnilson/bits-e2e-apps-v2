import { queryInventory, tableQuery } from '@datadog/action-catalog/dd/ddsql';

// Pod describes a single Kubernetes pod as seen by Datadog.
export type Pod = {
	name: string;
	namespace: string;
	status: string;
	restarts: number;
	// startedAt is an RFC3339 timestamp of when the pod started, empty if unknown.
	startedAt: string;
};

export type ListPodsInput = {
	// limit caps the number of rows returned. Defaults to 500, max 500.
	limit?: number;
};

export type ListPodsOutput = {
	pods: Pod[];
};

export type ListPodsResponse = {
	pods?: Pod[];
	error?: string;
};

// maxListPodsLimit is the hard cap on pods returned by a single listing.
const maxListPodsLimit = 500;

// listPodsSQL is a fixed SQL template; frontend input only controls the row
// limit, never the query text itself.
const listPodsSQL = `
SELECT
    kube_pod_name AS pod_name,
    kube_namespace AS namespace,
    kube_pod_status_phase AS status,
    kube_container_status_restarts_total AS restarts,
    started_at
FROM dd.containers
WHERE kube_pod_name IS NOT NULL AND kube_namespace IS NOT NULL
ORDER BY kube_namespace, kube_pod_name
LIMIT %d`;

// listPodsNLQuery is the natural-language fallback used when the fixed SQL
// template does not match the organization's DDSQL containers schema.
const listPodsNLQuery =
	'List Kubernetes pods with pod name, namespace, pod status phase, container restart count and pod start time';

type RowValue = string | number | boolean | string[] | number[] | boolean[] | null;
type Row = Record<string, RowValue>;

function pick(row: Row, keys: string[]): string {
	for (const key of keys) {
		const value = row[key];
		if (value !== null && value !== undefined && value !== '') {
			return String(value);
		}
	}
	return '';
}

function normalizePods(rows: Row[]): Pod[] {
	// Rows are per-container; collapse them into one entry per pod.
	const pods = new Map<string, Pod>();
	for (const row of rows) {
		const name = pick(row, ['pod_name', 'kube_pod_name', 'pod', 'name']);
		const namespace = pick(row, ['namespace', 'kube_namespace', 'ns']);
		if (name === '' || namespace === '') {
			continue;
		}
		const status = pick(row, ['status', 'phase', 'pod_status', 'kube_pod_status_phase']);
		const startedAt = pick(row, ['started_at', 'created_at', 'start_time', 'pod_start_time']);
		const restartsRaw = pick(row, ['restarts', 'restart_count', 'kube_container_status_restarts_total', 'restartCount']);
		const restarts = Number(restartsRaw) || 0;

		const key = `${namespace}/${name}`;
		const existing = pods.get(key);
		if (existing === undefined) {
			pods.set(key, { name, namespace, status, restarts, startedAt });
			continue;
		}
		existing.restarts = Math.max(existing.restarts, restarts);
		if (existing.status === '') {
			existing.status = status;
		}
		if (existing.startedAt === '' || (startedAt !== '' && startedAt < existing.startedAt)) {
			existing.startedAt = startedAt;
		}
	}
	return Array.from(pods.values()).sort((a, b) =>
		a.namespace === b.namespace ? a.name.localeCompare(b.name) : a.namespace.localeCompare(b.namespace),
	);
}

async function queryTable(query: string): Promise<Row[]> {
	const response = await tableQuery({ inputs: { query } });
	return (response.data ?? []) as Row[];
}

async function queryNL(query: string): Promise<Row[]> {
	const response = await queryInventory({ inputs: { query } });
	return (response.rows ?? []) as Row[];
}

export async function listPods(input?: ListPodsInput): Promise<ListPodsOutput> {
	let limit = maxListPodsLimit;
	if (input && input.limit && input.limit > 0) {
		limit = Math.min(input.limit, maxListPodsLimit);
	}

	let rows: Row[];
	try {
		rows = await queryTable(listPodsSQL.replace('%d', String(limit)));
	} catch {
		// Fall back to the natural-language inventory query.
		rows = await queryNL(listPodsNLQuery);
	}

	return { pods: normalizePods(rows) };
}
