import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@datadog/druids/form/Button';
import { InputText } from '@datadog/druids/form/InputText';
import { Select } from '@datadog/druids/form/Select';
import { Grid } from '@datadog/druids/layout/Grid';
import { GridItem } from '@datadog/druids/layout/GridItem';
import { Spacing } from '@datadog/druids/layout/Spacing';
import { Badge } from '@datadog/druids/pills/Badge';
import { Table } from '@datadog/druids/table/Table';
import type { TableColumn } from '@datadog/druids/table/Table';
import { Text } from '@datadog/druids/typography/Text';

import { deletePod } from './deletePod.backend';
import { listPods } from './listPods.backend';
import type { Pod } from './listPods.backend';

// healthyStatuses are pod phases that do not require any action.
const healthyStatuses = new Set(['running', 'succeeded', 'completed']);

// unhealthyRestartsThreshold is the number of container restarts after which a
// pod is considered unhealthy even if its phase looks fine.
const unhealthyRestartsThreshold = 5;

const settingsStorageKey = 'k8s-pods-settings';

type Settings = {
	apiBaseURL: string;
};

function loadSettings(): Settings {
	try {
		const raw = window.localStorage.getItem(settingsStorageKey);
		if (raw) {
			const parsed = JSON.parse(raw);
			return {
				apiBaseURL: typeof parsed.apiBaseURL === 'string' ? parsed.apiBaseURL : '',
			};
		}
	} catch {
		// Ignore malformed stored settings.
	}
	return { apiBaseURL: '' };
}

function isUnhealthy(pod: Pod): boolean {
	return !healthyStatuses.has(pod.status.toLowerCase()) || pod.restarts >= unhealthyRestartsThreshold;
}

function formatAge(startedAt: string): string {
	if (startedAt === '') {
		return '-';
	}
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
	const queryClient = useQueryClient();
	const [selectedNamespace, setSelectedNamespace] = useState('');
	const [settings, setSettings] = useState<Settings>(loadSettings);
	const [showSettings, setShowSettings] = useState(false);
	const [actionMessage, setActionMessage] = useState('');

	const podsQuery = useQuery({
		queryKey: ['pods'],
		queryFn: () => listPods({ limit: 500 }),
		refetchInterval: 30_000,
	});

	const deleteMutation = useMutation({
		mutationFn: (pod: Pod) =>
			deletePod({
				namespace: pod.namespace,
				podName: pod.name,
				apiBaseURL: settings.apiBaseURL || undefined,
			}),
		onSuccess: (_data, pod) => {
			setActionMessage(`Deleted pod ${pod.namespace}/${pod.name}.`);
			void queryClient.invalidateQueries({ queryKey: ['pods'] });
		},
		onError: (error) => {
			setActionMessage(`Delete failed: ${error instanceof Error ? error.message : String(error)}`);
		},
	});

	const pods = useMemo(() => podsQuery.data?.pods ?? [], [podsQuery.data]);
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
					return (
						<Button
							label="Delete"
							isPrimary
							isDisabled={deleteMutation.isPending}
							onClick={() => deleteMutation.mutate(pod)}
						/>
					);
				},
			},
		],
		[deleteMutation],
	);

	const updateSettings = (patch: Partial<Settings>) => {
		const next = { ...settings, ...patch };
		setSettings(next);
		try {
			window.localStorage.setItem(settingsStorageKey, JSON.stringify(next));
		} catch {
			// Storage may be unavailable in the embedded iframe; keep in-memory state.
		}
	};

	return (
		<Spacing as="main" padding="lg">
			<Grid columns={1} gap="lg" isFullWidth>
				<GridItem>
					<Spacing as="section" padding="lg">
						<Text as="h1" size="xl" weight="bold" marginBottom="sm">
							Kubernetes Pods
						</Text>
						<Text as="p" size="md" variant="secondary" marginBottom="md">
							Pods reported by the Kubernetes integration. Unhealthy pods can be deleted through the
							Kubernetes API server.
						</Text>
					</Spacing>
				</GridItem>
				<GridItem>
					<Spacing as="section" padding="md">
						<Grid columns={2} gap="md" isFullWidth>
							<GridItem>
								<Select
									options={namespaceOptions}
									value={namespaceOptions.find((option) => option.value === selectedNamespace) ?? namespaceOptions[0]}
									onChange={(option) => {
										const value = Array.isArray(option) ? option[0] : option;
										setSelectedNamespace(value?.value ?? '');
									}}
								/>
							</GridItem>
							<GridItem>
								<Button label={showSettings ? 'Hide settings' : 'Settings…'} onClick={() => setShowSettings(!showSettings)} />
							</GridItem>
						</Grid>
					</Spacing>
				</GridItem>
				{showSettings && (
					<GridItem>
						<Spacing as="section" padding="md">
							<Grid columns={2} gap="md" isFullWidth>
								<GridItem>
									<Text as="p" size="sm" weight="bold" marginBottom="xs">
										Kubernetes API server URL (optional override)
									</Text>
									<InputText
										placeholder="https://kubernetes.default.svc"
										value={settings.apiBaseURL}
										onChange={(event) => updateSettings({ apiBaseURL: event.target.value })}
									/>
								</GridItem>
 								<GridItem>
									<Text as="p" size="sm" variant="secondary">
										Deleting pods requires the <code>kubeAPIConnectionId</code> constant in
										deletePod.backend.ts to reference an HTTP connection with Kubernetes API
										credentials.
									</Text>
								</GridItem>
							</Grid>
						</Spacing>
					</GridItem>
				)}
				{actionMessage !== '' && (
					<GridItem>
						<Text as="p" size="md">
							{actionMessage}
						</Text>
					</GridItem>
				)}
				<GridItem>
					{podsQuery.isLoading ? (
						<Text as="p" size="md">
							Loading pods…
						</Text>
					) : podsQuery.isError ? (
						<Text as="p" size="md">
							Unable to list pods: {String(podsQuery.error)}
						</Text>
					) : pods.length === 0 ? (
						<Text as="p" size="md">
							No pods found. Make sure the Kubernetes integration is installed and reporting data.
						</Text>
					) : (
						<Table
							data={visiblePods}
							columns={columns}
							getRowId={(row) => `${row.namespace}/${row.name}`}
							isLoading={deleteMutation.isPending}
						/>
					)}
				</GridItem>
			</Grid>
		</Spacing>
	);
}

export default App;
