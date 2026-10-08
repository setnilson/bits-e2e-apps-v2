import { useState } from 'react';
import './App.css';

export default function App() {
    const [splash, setSplash] = useState(false);
    const [count, setCount] = useState(0);
    return (
        <main className="cove">
            <header><a className="brand" href="#">◒ <span>Dolphin Cove</span></a><span className="header-note">A LITTLE OCEAN. A LITTLE JOY.</span></header>
            <section className="intro">
                <span className="eyebrow"><i /> YOUR HAPPY PLACE</span>
                <h1>Life’s better<br />with a <em>splash.</em></h1>
                <p>Meet Finn, your friendly neighborhood dolphin.<br />Take a breath. Catch a wave. Stay a little while.</p>
            </section>
            <section className="ocean" aria-label="Finn's ocean cove">
                <div className="sun" />
                <span className="cloud cloud-one" /><span className="cloud cloud-two" />
                <span className="hello">Hey there, ocean friend! <span>✦</span></span>
                <svg className={`dolphin ${splash ? 'jump' : ''}`} viewBox="0 0 600 400" role="img" aria-labelledby="dolphin-title" onAnimationEnd={() => setSplash(false)}>
                    <title id="dolphin-title">Finn, a smiling blue cartoon dolphin</title>
                    <defs><linearGradient id="body" x2="0.3" y2="1"><stop stopColor="#6ed4ec" /><stop offset="1" stopColor="#278fc2" /></linearGradient></defs>
                    <g stroke="#185c80" strokeWidth="5" strokeLinejoin="round" strokeLinecap="round">
                        <path fill="#329ac6" d="M276 151 Q273 99 320 75 Q309 119 343 151" />
                        <path fill="#2996c1" d="M431 234 Q488 251 496 219 Q514 179 548 191 Q541 224 516 238 Q554 240 557 271 Q514 278 491 250 L443 277" />
                        <path fill="url(#body)" d="M471 249 C424 235 444 155 345 136 C266 115 204 133 178 182 C166 188 127 183 119 198 C112 213 146 227 179 225 C208 292 361 318 471 249Z" />
                        <path fill="#c2f0f3" stroke="none" d="M180 222 C233 257 292 265 361 258 Q417 257 463 249 C386 308 226 298 180 222Z" />
                        <path fill="#309bc7" d="M295 249 Q298 302 364 307 Q332 276 337 247" />
                        <path fill="none" d="M163 218 Q194 239 228 218" />
                        <ellipse fill="#133f59" stroke="none" cx="223" cy="187" rx="10" ry="14" />
                        <circle fill="white" stroke="none" cx="220" cy="182" r="4" />
                        <path fill="none" strokeWidth="4" d="M211 164 Q224 157 236 166" />
                        <ellipse fill="#efa9aa" stroke="none" cx="240" cy="215" rx="13" ry="7" opacity=".8" />
                        <path fill="none" stroke="#a5e9f4" strokeWidth="8" d="M266 151 Q306 142 338 153" />
                    </g>
                </svg>
                <div className={`splash-drops ${splash ? 'active' : ''}`} aria-hidden="true">✧ ˚ · ✧ ˚</div>
                <svg className="waves wave-back" viewBox="0 0 1440 220" preserveAspectRatio="none" aria-hidden="true"><path d="M0 70 Q180 0 360 70 T720 70 T1080 70 T1440 70 V220 H0Z" /></svg>
                <svg className="waves wave-front" viewBox="0 0 1440 220" preserveAspectRatio="none" aria-hidden="true"><path d="M0 95 Q180 165 360 95 T720 95 T1080 95 T1440 95 V220 H0Z" /></svg>
                <svg className="water-lines" width="600" height="24" viewBox="0 0 600 24" aria-hidden="true"><path d="M0 12q12 8 24 0t24 0 M210 12q12 8 24 0t24 0 M420 12q12 8 24 0t24 0" fill="none" stroke="#b5e8df" strokeWidth="2" /></svg>
                <span className="scene-label">CURRENT MOOD: FIN-TASTIC</span>
            </section>
            <section className="actions">
                <div><span className="finn-dot" /><strong>Finn’s ready to play</strong><p aria-live="polite">{count ? `${count} happy ${count === 1 ? 'splash' : 'splashes'}. Keep the good waves going!` : 'A small splash can make your whole day.'}</p></div>
                <button disabled={splash} onClick={() => { setSplash(true); setCount(count + 1); }}>Make a splash <span aria-hidden="true">↗</span></button>
            </section>
            <footer><span>Made for a moment of calm.</span><span>STAY CURIOUS. STAY PLAYFUL. <span aria-hidden="true">✳</span></span></footer>
        </main>
    );
}
