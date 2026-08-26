import { Spacing } from '@datadog/druids/layout/Spacing';
import { Text } from '@datadog/druids/typography/Text';

import './App.css';

function App() {
    return (
        <Spacing as="main" padding="none" className="brat-app">
            <Text as="h1" className="brat-wordmark">
                kelly
            </Text>
        </Spacing>
    );
}

export default App;
