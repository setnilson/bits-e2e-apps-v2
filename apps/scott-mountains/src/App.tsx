function Mountains() {
    return (
        <svg
            viewBox="0 0 800 360"
            style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 12 }}
            role="img"
            aria-label="Mountain range at sunset"
        >
            <defs>
                <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0b1d3a" />
                    <stop offset="55%" stopColor="#4b6cb7" />
                    <stop offset="100%" stopColor="#f8b195" />
                </linearGradient>
                <linearGradient id="peakBack" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7f9cc4" />
                    <stop offset="100%" stopColor="#4d6a96" />
                </linearGradient>
                <linearGradient id="peakMid" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#5d7ba8" />
                    <stop offset="100%" stopColor="#33507c" />
                </linearGradient>
                <linearGradient id="peakFront" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2c4470" />
                    <stop offset="100%" stopColor="#152440" />
                </linearGradient>
                <clipPath id="snowClipA">
                    <polygon points="200,90 140,240 260,240" />
                </clipPath>
            </defs>

            <rect width="800" height="360" fill="url(#sky)" />
            <circle cx="600" cy="120" r="42" fill="#ffd98e" opacity="0.95" />
            <circle cx="600" cy="120" r="60" fill="#ffd98e" opacity="0.25" />

            {[
                [60, 14],
                [180, 30],
                [320, 10],
                [420, 26],
                [540, 18],
                [700, 34],
                [760, 12],
            ].map(([cx, r], i) => (
                <circle key={i} cx={cx} cy={r} r={r / 6 + 1.2} fill="#ffffff" opacity="0.8" />
            ))}

            <polygon points="200,90 60,300 340,300" fill="url(#peakBack)" />
            <g clipPath="url(#snowClipA)">
                <path
                    d="M200 90 L182 132 L192 126 L200 146 L208 126 L218 132 Z L200 90 Z"
                    fill="#ffffff"
                    opacity="0.9"
                />
            </g>
            <polygon points="200,90 140,240 200,240 260,240" fill="#ffffff" opacity="0.25" />

            <polygon points="470,40 320,310 620,310" fill="url(#peakMid)" />
            <polygon points="470,40 430,148 442,136 452,162 462,136 474,160 486,134 496,150 510,148" fill="#ffffff" opacity="0.85" />
            <polygon points="470,40 430,148 470,148 510,148" fill="#eef4fb" opacity="0.35" />

            <polygon points="0,360 0,250 140,180 260,260 380,210 520,320 520,360" fill="url(#peakFront)" />
            <polygon points="140,180 118,222 130,212 140,232 150,210 162,220" fill="#ffffff" opacity="0.8" />
            <polygon points="380,210 362,246 372,238 380,254 390,238 398,246" fill="#ffffff" opacity="0.7" />

            <polygon points="640,360 640,300 730,240 800,310 800,360" fill="#101d33" />
        </svg>
    );
}

function App() {
    return (
        <main style={{ padding: 24 }}>
            <h1
                style={{
                    margin: '0 0 16px',
                    fontSize: '3.5rem',
                    lineHeight: 1.1,
                    letterSpacing: '0.35em',
                    textTransform: 'uppercase',
                    textAlign: 'center',
                    color: '#1a3a5c',
                    fontWeight: 800,
                }}
            >
                Scott
            </h1>
            <Mountains />
        </main>
    );
}

export default App;
