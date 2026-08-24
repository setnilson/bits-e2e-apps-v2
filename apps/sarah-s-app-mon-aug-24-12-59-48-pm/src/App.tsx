import { Spacing } from '@datadog/druids/layout/Spacing';
import { Text } from '@datadog/druids/typography/Text';

function App() {
    return (
        <Spacing
            as="main"
            padding="xl"
            style={{
                alignItems: 'center',
                display: 'flex',
                minHeight: '100vh',
                justifyContent: 'center',
            }}
        >
            <Text
                as="h1"
                size="xl"
                weight="bold"
                style={{
                    color: '#d20f0f',
                    fontSize: '64px',
                    lineHeight: 1,
                }}
            >
                alexander
            </Text>
        </Spacing>
    );
}

export default App;
