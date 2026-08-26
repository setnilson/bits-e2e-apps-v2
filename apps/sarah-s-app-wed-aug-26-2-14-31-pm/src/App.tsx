import { Spacing } from '@datadog/druids/layout/Spacing';
import { Text } from '@datadog/druids/typography/Text';

import './App.css';

function App() {
    return (
        <Spacing as="main" className="alexander-page" padding="lg">
            <Text as="h1" className="alexander-title" size="xl" weight="bold">
                <span aria-hidden="true" className="sparkle sparkle-left">
                    ✦
                </span>
                alexander
                <span aria-hidden="true" className="sparkle sparkle-right">
                    ✦
                </span>
            </Text>
        </Spacing>
    );
}

export default App;
