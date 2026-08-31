import { Spacing } from '@datadog/druids/layout/Spacing';
import { Text } from '@datadog/druids/typography/Text';

import './App.css';

function App() {
    return (
        <Spacing as="main" className="drew-app" padding="lg">
            <Text as="h1" className="drew-name">
                drew
            </Text>
        </Spacing>
    );
}

export default App;
