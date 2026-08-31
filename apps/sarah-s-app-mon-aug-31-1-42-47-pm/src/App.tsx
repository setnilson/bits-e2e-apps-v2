import { Spacing } from '@datadog/druids/layout/Spacing';
import { Text } from '@datadog/druids/typography/Text';

import './App.css';

function App() {
    return (
        <Spacing as="main" className="ameesha-app" padding="lg">
            <Text as="h1" className="ameesha-name">
                ameesha
            </Text>
        </Spacing>
    );
}

export default App;
