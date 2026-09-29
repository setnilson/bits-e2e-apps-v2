import { useEffect, useState } from 'react';
import { Grid } from '@datadog/druids/layout/Grid';
import { GridItem } from '@datadog/druids/layout/GridItem';
import { Spacing } from '@datadog/druids/layout/Spacing';
import { Text } from '@datadog/druids/typography/Text';

const SECOND_HAND_STEP_DEG = 6;

function useNow(): Date {
    const [now, setNow] = useState(() => new Date());

    useEffect(() => {
        const timer = window.setInterval(() => setNow(new Date()), 1000);
        return () => window.clearInterval(timer);
    }, []);

    return now;
}

function pad(value: number): string {
    return value.toString().padStart(2, '0');
}

function AnalogClock({ date }: { date: Date }) {
    const seconds = date.getSeconds();
    const minutes = date.getMinutes();
    const hours = date.getHours() % 12;

    const secondDeg = seconds * SECOND_HAND_STEP_DEG;
    const minuteDeg = minutes * SECOND_HAND_STEP_DEG + seconds * 0.1;
    const hourDeg = hours * 30 + minutes * 0.5;

    return (
        <svg viewBox="0 0 200 200" width={220} height={220} role="img" aria-label="Analog clock">
            <circle cx="100" cy="100" r="96" fill="var(--background)" stroke="var(--border-color)" strokeWidth="4" />
            {Array.from({ length: 12 }, (_, i) => {
                const angle = (i * Math.PI) / 6;
                const outer = 88;
                const inner = i % 3 === 0 ? 76 : 82;
                return (
                    <line
                        key={i}
                        x1={100 + inner * Math.sin(angle)}
                        y1={100 - inner * Math.cos(angle)}
                        x2={100 + outer * Math.sin(angle)}
                        y2={100 - outer * Math.cos(angle)}
                        stroke="currentColor"
                        strokeWidth={i % 3 === 0 ? 3 : 1.5}
                    />
                );
            })}
            <line
                x1="100" y1="100" x2="100" y2="48"
                stroke="currentColor" strokeWidth="6" strokeLinecap="round"
                transform={`rotate(${hourDeg} 100 100)`}
            />
            <line
                x1="100" y1="100" x2="100" y2="30"
                stroke="currentColor" strokeWidth="4" strokeLinecap="round"
                transform={`rotate(${minuteDeg} 100 100)`}
            />
            <line
                x1="100" y1="108" x2="100" y2="26"
                stroke="#e34402" strokeWidth="2" strokeLinecap="round"
                transform={`rotate(${secondDeg} 100 100)`}
            />
            <circle cx="100" cy="100" r="4" fill="currentColor" />
        </svg>
    );
}

function App() {
    const now = useNow();

    const timeText = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    const dateText = now.toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <Spacing as="main" padding="lg">
            <Grid columns={1} gap="lg" isFullWidth>
                <GridItem>
                    <Spacing as="section" padding="lg">
                        <Text as="h1" size="xl" weight="bold" marginBottom="sm">
                            Clock
                        </Text>
                        <Text as="p" size="md" variant="secondary" marginBottom="lg">
                            {dateText}
                        </Text>
                        <Text as="p" size="xxl" weight="bold" marginBottom="lg">
                            {timeText}
                        </Text>
                        <AnalogClock date={now} />
                    </Spacing>
                </GridItem>
            </Grid>
        </Spacing>
    );
}

export default App;
