import styles from './App.module.css';

const sparkles = Array.from({ length: 18 }, (_, index) => index);

function App() {
    return (
        <main className={styles.page}>
            <div className={styles.glow} aria-hidden="true" />
            <div className={styles.sparkles} aria-hidden="true">
                {sparkles.map((sparkle) => (
                    <span className={styles.sparkle} key={sparkle}>
                        ✦
                    </span>
                ))}
            </div>

            <section className={styles.hero} aria-label="Jessie">
                <span className={styles.kicker}>a little bit of magic</span>
                <h1 className={styles.title}>jessie</h1>
                <div className={styles.underline} aria-hidden="true">
                    <span>✧</span>
                    <span className={styles.line} />
                    <span>✧</span>
                </div>
            </section>
        </main>
    );
}

export default App;
