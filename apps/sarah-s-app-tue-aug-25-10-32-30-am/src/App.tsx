import { Grid } from '@datadog/druids/layout/Grid';
import { GridItem } from '@datadog/druids/layout/GridItem';
import { Spacing } from '@datadog/druids/layout/Spacing';
import { Text } from '@datadog/druids/typography/Text';

import './App.css';

const rainbowBands = [
    { name: 'Red', value: '#f04d5e' },
    { name: 'Orange', value: '#ff9f1c' },
    { name: 'Yellow', value: '#ffd166' },
    { name: 'Green', value: '#2ec4b6' },
    { name: 'Blue', value: '#2f80ed' },
    { name: 'Violet', value: '#8a5cf6' },
];

function App() {
    return (
        <Spacing as="main" padding="lg" className="barak-app">
            <Grid columns={1} gap="lg" isFullWidth>
                <GridItem>
                    <Spacing as="section" className="barak-stage" padding="lg">
                        <div className="rainbow-sky" aria-hidden="true">
                            <span className="rainbow-arc rainbow-arc-red" />
                            <span className="rainbow-arc rainbow-arc-orange" />
                            <span className="rainbow-arc rainbow-arc-yellow" />
                            <span className="rainbow-arc rainbow-arc-green" />
                            <span className="rainbow-arc rainbow-arc-blue" />
                            <span className="rainbow-arc rainbow-arc-violet" />
                        </div>

                        <Spacing as="div" className="barak-copy" padding="none">
                            <Text as="p" size="sm" weight="bold" className="eyebrow">
                                Rainbow mode
                            </Text>
                            <Text as="h1" className="barak-title">
                                Barak
                            </Text>
                            <Text as="p" size="lg" className="barak-subtitle">
                                A bright, color-forward space built around one name.
                            </Text>
                        </Spacing>

                        <div className="rainbow-palette" aria-label="Rainbow palette">
                            {rainbowBands.map((band) => (
                                <div className="palette-band" key={band.name}>
                                    <span
                                        className="palette-swatch"
                                        style={{ backgroundColor: band.value }}
                                    />
                                    <Text as="span" size="sm" weight="bold">
                                        {band.name}
                                    </Text>
                                </div>
                            ))}
                        </div>
                    </Spacing>
                </GridItem>
            </Grid>
        </Spacing>
    );
}

export default App;
