import { useCallback, useMemo, useState } from 'react';
import { Button } from '@datadog/druids/form/Button';
import { InputSearch } from '@datadog/druids/form/InputSearch';
import { Select } from '@datadog/druids/form/Select';
import { AttentionCircledIcon } from '@datadog/druids/icons/AttentionCircled';
import { CheckCircledIcon } from '@datadog/druids/icons/CheckCircled';
import { PodIcon } from '@datadog/druids/icons/Pod';
import { RefreshIcon } from '@datadog/druids/icons/Refresh';
import { TrashIcon } from '@datadog/druids/icons/Trash';
import { Grid } from '@datadog/druids/layout/Grid';
import { GridItem } from '@datadog/druids/layout/GridItem';
import { Spacing } from '@datadog/druids/layout/Spacing';
import { CalloutValue } from '@datadog/druids/measures/CalloutValue';
import { MessageBox } from '@datadog/druids/misc/MessageBox';
import { StatusPill } from '@datadog/druids/pills/StatusPill';
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

type StatusLevel = 'default' | 'success' | 'warning' | 'danger';

// statusLevels maps a lowercased pod phase to the severity it renders with.
const statusLevels: Record<string, StatusLevel> = {
	running: 'success',
	succeeded: 'success',
	completed: 'success',
	pending: 'warning',
	crashloopbackoff: 'danger',
	error: 'danger',
	failed: 'danger',
};

// healthyStatuses are pod phases that do not require any action.
const healthyStatuses = new Set(['running', 'succeeded', 'completed']);

// unhealthyRestartsThreshold is the number of container restarts after which a
// pod is considered unhealthy even if its phase looks fine.
const unhealthyRestartsThreshold = 5;

function minutesAgo(minutes: number): string {
	return new Date(Date.now() - minutes * 60_000).toISOString();
}

// mockPods is a static fixture; this app is not wired to a live Kubernetes
// integration.
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

// statusLevel is the phase severity, escalated by an excessive restart count.
function statusLevel(pod: Pod): StatusLevel {
	const level = statusLevels[pod.status.toLowerCase()] ?? 'default';
	if (level !== 'danger' && pod.restarts >= unhealthyRestartsThreshold) {
		return 'warning';
	}
	return level;
}

function App() {
	const [pods, setPods] = useState<Pod[]>(mockPods);
	const [selectedNamespace, setSelectedNamespace] = useState('');
	const [search, setSearch] = useState('');
	const [actionMessage, setActionMessage] = useState('');

	const namespaces = useMemo(() => {
		const set = new Set<string>();
		for (const pod of pods) {
			set.add(pod.namespace);
		}
		return Array.from(set).sort();
	}, [pods]);

	// Unhealthy pods sort to the top so the rows that need action are first.
	const visiblePods = useMemo(() => {
		const query = search.trim().toLowerCase();
		return pods
			.filter(
				(pod) =>
					(selectedNamespace === '' || pod.namespace === selectedNamespace) &&
					(query === '' || pod.name.toLowerCase().includes(query)),
			)
			.sort((a, b) => Number(isUnhealthy(b)) - Number(isUnhealthy(a)) || a.name.localeCompare(b.name));
	}, [pods, search, selectedNamespace]);

	const summary = useMemo(
		() => ({
			running: visiblePods.filter((pod) => healthyStatuses.has(pod.status.toLowerCase())).length,
			unhealthy: visiblePods.filter(isUnhealthy).length,
			restarts: visiblePods.reduce((total, pod) => total + pod.restarts, 0),
		}),
		[visiblePods],
	);

	const namespaceOptions = useMemo(
		() => [
			{ label: 'All namespaces', value: '' },
			...namespaces.map((namespace) => ({ label: namespace, value: namespace })),
		],
		[namespaces],
	);

	const deletePod = useCallback((pod: Pod) => {
		setPods((current) =>
			current.filter((candidate) => candidate.name !== pod.name || candidate.namespace !== pod.namespace),
		);
		setActionMessage(`Deleted pod ${pod.namespace}/${pod.name}.`);
	}, []);

	const columns: Array<TableColumn<Pod>> = useMemo(
		() => [
			{
				Header: 'Name',
				accessor: 'name',
				Cell: ({ row }: { row: { original: Pod } }) => (
					<Text size="md" isMonospace hasEllipsis title={row.original.name}>
						{row.original.name}
					</Text>
				),
			},
			{
				Header: 'Namespace',
				accessor: 'namespace',
				shouldShrink: true,
				Cell: ({ row }: { row: { original: Pod } }) => (
					<Text size="md" variant="secondary">
						{row.original.namespace}
					</Text>
				),
			},
			{
				Header: 'Status',
				accessor: 'status',
				Cell: ({ row }: { row: { original: Pod } }) => (
					<StatusPill level={statusLevel(row.original)} isSoft>
						{row.original.status === '' ? 'Unknown' : row.original.status}
					</StatusPill>
				),
			},
			{
				Header: 'Restarts',
				accessor: 'restarts',
				textAlign: 'right',
				shouldShrink: true,
				Cell: ({ row }: { row: { original: Pod } }) => {
					const isExcessive = row.original.restarts >= unhealthyRestartsThreshold;
					return (
						<Text size="md" variant={isExcessive ? 'warning' : 'default'} weight={isExcessive ? 'bold' : 'normal'}>
							{row.original.restarts}
						</Text>
					);
				},
			},
			{
				Header: 'Age',
				accessor: 'startedAt',
				textAlign: 'right',
				shouldShrink: true,
				Cell: ({ row }: { row: { original: Pod } }) => (
					<Text size="md" variant="secondary">
						{formatAge(row.original.startedAt)}
					</Text>
				),
			},
			{
				Header: '',
				accessor: 'name',
				id: 'actions',
				disableSortBy: true,
				textAlign: 'right',
				shouldShrink: true,
				Cell: ({ row }: { row: { original: Pod } }) => {
					const pod = row.original;
					if (!isUnhealthy(pod)) {
						return null;
					}
					return (
						<Button
							icon={TrashIcon}
							ariaLabel={`Delete pod ${pod.namespace}/${pod.name}`}
							title="Delete pod"
							level="danger"
							size="sm"
							isBorderless
							onClick={() => deletePod(pod)}
						/>
					);
				},
			},
		],
		[deletePod],
	);

	return (
		<Spacing as="main" padding="lg">
			<Grid columns={1} gap="lg" isFullWidth>
				<GridItem>
					<Text as="h1" size="xl" weight="bold" marginBottom="xxs">
						Kubernetes Pods
					</Text>
					<Text as="p" size="md" variant="secondary">
						Pod health across namespaces. Unhealthy pods can be deleted from the list.
					</Text>
				</GridItem>
				<GridItem>
					<Grid columns="auto-fit" minWidth={170} gap="md" isFullWidth>
						<CalloutValue label="Pods" value={visiblePods.length} icon={PodIcon} size="lg" />
						<CalloutValue
							label="Running"
							value={summary.running}
							icon={CheckCircledIcon}
							level={summary.running > 0 ? 'success' : 'default'}
							size="lg"
							hasStatusBorder
						/>
						<CalloutValue
							label="Needs attention"
							value={summary.unhealthy}
							icon={AttentionCircledIcon}
							level={summary.unhealthy > 0 ? 'danger' : 'default'}
							size="lg"
							hasStatusBorder
						/>
						<CalloutValue label="Restarts" value={summary.restarts} icon={RefreshIcon} size="lg" />
					</Grid>
				</GridItem>
				<GridItem>
					<Grid columns={2} width={280} gap="sm" justifyContent="start" isFullWidth>
						<InputSearch
							placeholder="Filter by pod name"
							size="lg"
							value={search}
							onChange={(event) => setSearch(event.target.value)}
							isFullWidth
						/>
						<Select
							floatingLabel="Namespace"
							size="lg"
							options={namespaceOptions}
							value={namespaceOptions.find((option) => option.value === selectedNamespace) ?? namespaceOptions[0]}
							onChange={(option) => {
								const value = Array.isArray(option) ? option[0] : option;
								setSelectedNamespace(value?.value ?? '');
							}}
							isFullWidth
						/>
					</Grid>
				</GridItem>
				{actionMessage !== '' && (
					<GridItem>
						<MessageBox level="success" isDismissible onDismiss={() => setActionMessage('')}>
							{actionMessage}
						</MessageBox>
					</GridItem>
				)}
				<GridItem>
					<Table
						data={visiblePods}
						columns={columns}
						getRowId={(row) => `${row.namespace}/${row.name}`}
						emptyState={{
							icon: PodIcon,
							title: 'No matching pods',
							subtitle: 'Clear the search or choose a different namespace.',
						}}
						stickyHeaders
						hasInnerBorders
					/>
				</GridItem>
			</Grid>
		</Spacing>
	);
}

export default App;
