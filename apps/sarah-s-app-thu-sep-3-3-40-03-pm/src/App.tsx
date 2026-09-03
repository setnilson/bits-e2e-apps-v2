import { Spacing } from '@datadog/druids/layout/Spacing';
import { Text } from '@datadog/druids/typography/Text';

import './App.css';

function App() {
    return (
        <Spacing as="main" className="emma-page" padding="lg">
            <Text as="h1" className="emma-title" weight="bold">
                emma
            </Text>
        </Spacing>
    );
}

export default App;
