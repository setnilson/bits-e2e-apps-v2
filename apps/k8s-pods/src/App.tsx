import { useMemo, useState } from 'react';
import { Button } from '@datadog/druids/form/Button';
import { Select } from '@datadog/druids/form/Select';
import { Grid } from '@datadog/druids/layout/Grid';
import { GridItem } from '@datadog/druids/layout/GridItem';
import { Spacing } from '@datadog/druids/layout/Spacing';
import { Badge } from '@datadog/druids/pills/Badge';
import { Table } from '@datadog/druids/table/Table';
import type { TableColumn } from '@datadog/druids/table/Table';
import { Text } from '@datadog/druids/typography/Text';

// Pod describes a single Kubernetes pod shown in the table.
type Pod = {
	name: string;
	namespace: string;
	status: string;
	restarts: number;
	// startedAt is an RFC3339 timestamp of when the pod started.
	startedAt: string;
};

// healthyStatuses are pod phases that do not require any action.
const healthyStatuses = new Set(['running', 'succeeded', 'completed']);

// unhealthyRestartsThreshold is the number of container restarts after which a
// pod is considered unhealthy even if its phase looks fine.
const unhealthyRestartsThreshold = 5;

function minutesAgo(minutes: number): string {
	return new Date(Date.now() - minutes * 60_000).toISOString();
}

// mockPods is demo data standing in for a live Kubernetes integration listing.
const mockPods: Pod[] = [
	{ name: 'api-gateway-7d9f4c6b5-k2l8p', namespace: 'default', status: 'Running', restarts: 0, startedAt: minutesAgo(60 * 92) },
	{ name: 'checkout-service-5c8d7f9a1-m4n7q', namespace: 'commerce', status: 'Running', restarts: 1, startedAt: minutesAgo(60 * 41) },
	{ name: 'checkout-service-5c8d7f9a1-x9r2t', namespace: 'commerce', status: 'CrashLoopBackOff', restarts: 14, startedAt: minutesAgo(23) },
	{ name: 'payments-worker-6b4c2e1d8-p3v5s', namespace: 'commerce', status: 'Pending', restarts: 0, startedAt: minutesAgo(4) },
	{ name: 'cart-api-8f2a9d3c7-h6j8k', namespace: 'commerce', status: 'Running', restarts: 2, startedAt: minutesAgo(60 * 168) },
	{ name: 'postgres-primary-0', namespace: 'database', status: 'Running', restarts: 0, startedAt: minutesAgo(60 * 24 * 12) },
	{ name: 'redis-cache-7a1b4e9f2-t5y7u', namespace: 'database', status: 'Running', restarts: 3, startedAt: minutesAgo(60 * 55) },
	{ name: 'log-collector-ds-2f9k8', namespace: 'observability', status: 'Running', restarts: 0, startedAt: minutesAgo(60 * 24 * 6) },
	{ name: 'metrics-agent-ds-9d3x1', namespace: 'observability', status: 'Error', restarts: 9, startedAt: minutesAgo(48) },
	{ name: 'grafana-4e7b1c6a2-w2z4n', namespace: 'observability', status: 'Running', restarts: 0, startedAt: minutesAgo(60 * 30) },
	{ name: 'batch-reports-job-22841', namespace: 'batch', status: 'Succeeded', restarts: 0, startedAt: minutesAgo(35) },
	{ name: 'batch-etl-worker-22842', namespace: 'batch', status: 'Failed', restarts: 6, startedAt: minutesAgo(12) },
];

function isUnhealthy(pod: Pod): boolean {
	return !healthyStatuses.has(pod.status.toLowerCase()) || pod.restarts >= unhealthyRestartsThreshold;
}

function formatAge(startedAt: string): string {
	const started = Date.parse(startedAt);
	if (Number.isNaN(started)) {
		return '-';
	}
	const seconds = Math.max(0, Math.floor((Date.now() - started) / 1000));
	if (seconds < 60) {
		return `${seconds}s`;
	}
	const minutes = Math.floor(seconds / 60);
	if (minutes < 60) {
		return `${minutes}m`;
	}
	const hours = Math.floor(minutes / 60);
	if (hours < 24) {
		return `${hours}h`;
	}
	return `${Math.floor(hours / 24)}d`;
}

function statusBadgeLevel(pod: Pod): 'default' | 'warning' | 'danger' {
	if (!healthyStatuses.has(pod.status.toLowerCase())) {
		return 'danger';
	}
	if (pod.restarts >= unhealthyRestartsThreshold) {
		return 'warning';
	}
	return 'default';
}

function App() {
	const [pods, setPods] = useState<Pod[]>(mockPods);
	const [selectedNamespace, setSelectedNamespace] = useState('');
	const [actionMessage, setActionMessage] = useState('');

	const namespaces = useMemo(() => {
		const set = new Set<string>();
		for (const pod of pods) {
			set.add(pod.namespace);
		}
		return Array.from(set).sort();
	}, [pods]);

	const visiblePods = useMemo(
		() => (selectedNamespace === '' ? pods : pods.filter((pod) => pod.namespace === selectedNamespace)),
		[pods, selectedNamespace],
	);

	const namespaceOptions = useMemo(
		() => [
			{ label: 'All namespaces', value: '' },
			...namespaces.map((namespace) => ({ label: namespace, value: namespace })),
		],
		[namespaces],
	);

	const deletePod = (pod: Pod) => {
		setPods((current) => current.filter((candidate) => candidate.name !== pod.name || candidate.namespace !== pod.namespace));
		setActionMessage(`Deleted pod ${pod.namespace}/${pod.name}.`);
	};

	const columns: Array<TableColumn<Pod>> = useMemo(
		() => [
			{ Header: 'Name', accessor: 'name' },
			{ Header: 'Namespace', accessor: 'namespace' },
			{
				Header: 'Status',
				accessor: 'status',
				Cell: ({ row }: { row: { original: Pod } }) => (
					<Badge label={row.original.status === '' ? 'unknown' : row.original.status} level={statusBadgeLevel(row.original)} />
				),
			},
			{ Header: 'Restarts', accessor: 'restarts' },
			{
				Header: 'Age',
				accessor: 'startedAt',
				Cell: ({ row }: { row: { original: Pod } }) => <span>{formatAge(row.original.startedAt)}</span>,
			},
			{
				Header: 'Actions',
				accessor: 'name',
				id: 'actions',
				disableSortBy: true,
				Cell: ({ row }: { row: { original: Pod } }) => {
					const pod = row.original;
					if (!isUnhealthy(pod)) {
						return null;
					}
					return <Button label="Delete" isPrimary onClick={() => deletePod(pod)} />;
				},
			},
		],
		[],
	);

	return (
		<Spacing as="main" padding="lg">
			<Grid columns={1} gap="lg" isFullWidth>
				<GridItem>
					<Spacing as="section" padding="lg">
						<Text as="h1" size="xl" weight="bold" marginBottom="sm">
							Kubernetes Pods
						</Text>
						<Text as="p" size="md" variant="secondary" marginBottom="md">
							Demo view using mock data. Unhealthy pods can be deleted from the list.
						</Text>
					</Spacing>
				</GridItem>
				<GridItem>
					<Spacing as="section" padding="md">
						<Select
							options={namespaceOptions}
							value={namespaceOptions.find((option) => option.value === selectedNamespace) ?? namespaceOptions[0]}
							onChange={(option) => {
								const value = Array.isArray(option) ? option[0] : option;
								setSelectedNamespace(value?.value ?? '');
							}}
						/>
					</Spacing>
				</GridItem>
				{actionMessage !== '' && (
					<GridItem>
						<Text as="p" size="md">
							{actionMessage}
						</Text>
					</GridItem>
				)}
				<GridItem>
					{visiblePods.length === 0 ? (
						<Text as="p" size="md">
							No pods in this namespace.
						</Text>
					) : (
						<Table data={visiblePods} columns={columns} getRowId={(row) => `${row.namespace}/${row.name}`} />
					)}
				</GridItem>
			</Grid>
		</Spacing>
	);
}

export default App;
