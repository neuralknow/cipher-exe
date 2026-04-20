// Shared UI components
const { useState, useEffect, useRef, useMemo, useCallback } = React;

// Notched card with optional corner brackets
function Card({ children, className = '', brackets = false, elev = false, style }) {
  return (
    <div className={`card ${elev ? 'card-elev' : ''} ${className}`} style={style}>
      {brackets && <>
        <span className="corner-bracket tl"></span>
        <span className="corner-bracket tr"></span>
        <span className="corner-bracket bl"></span>
        <span className="corner-bracket br"></span>
      </>}
      {children}
    </div>
  );
}

function Chip({ children, kind = '', icon = null }) {
  const cls = kind ? `chip chip-${kind}` : 'chip';
  return <span className={cls}>{icon}{children}</span>;
}

function Btn({ children, primary, ghost, sm, onClick, disabled, style, className = '' }) {
  const cls = ['btn',
    primary && 'btn-primary',
    ghost && 'btn-ghost',
    sm && 'btn-sm',
    className
  ].filter(Boolean).join(' ');
  return <button className={cls} onClick={onClick} disabled={disabled} style={style}>{children}</button>;
}

function Eyebrow({ children }) {
  return <div className="eyebrow">{children}</div>;
}

function HeaderBar({ state, actions, showBack = false, title = null }) {
  const xpForNext = (Math.floor(state.xp / 500) + 1) * 500;
  const xpProgress = (state.xp % 500) / 500 * 100;
  const level = Math.floor(state.xp / 500) + 1;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '16px 24px', borderBottom: '1px solid var(--border)',
      background: 'var(--surface)', position: 'sticky', top: 0, zIndex: 50,
      backdropFilter: 'blur(8px)',
    }}>
      <div className="flex center gap-4">
        {showBack && <Btn ghost sm onClick={() => actions.goto('hub')}>◂ BACK</Btn>}
        <div className="flex center gap-2">
          <div style={{
            width: 24, height: 24, background: 'var(--accent)',
            clipPath: 'polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)',
            boxShadow: '0 0 12px var(--accent-glow)',
          }}/>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, letterSpacing: '0.08em' }}>
            CIPHER<span className="accent">.EXE</span>
          </span>
        </div>
        {title && <>
          <span style={{ color: 'var(--text-faint)', margin: '0 8px' }}>/</span>
          <span className="mono dim" style={{ fontSize: 13, letterSpacing: '0.1em' }}>{title}</span>
        </>}
      </div>

      <div className="flex center gap-6">
        <div className="flex center gap-3" title="Hint points">
          <span style={{ color: 'var(--amber)', fontSize: 14 }}>◆</span>
          <span className="mono" style={{ fontSize: 13 }}>{state.hintPoints}</span>
        </div>
        <div className="flex center gap-3" title="Streak">
          <span style={{ color: 'var(--danger)', fontSize: 14 }}>▲</span>
          <span className="mono" style={{ fontSize: 13 }}>{state.streak}d</span>
        </div>
        <div className="col gap-1" style={{ minWidth: 140 }}>
          <div className="flex between mono" style={{ fontSize: 11, color: 'var(--text-dim)' }}>
            <span>LVL {level}</span>
            <span>{state.xp} XP</span>
          </div>
          <div className="progress">
            <div className="progress-fill" style={{ width: `${xpProgress}%` }}/>
          </div>
        </div>
        <button
          onClick={() => actions.goto('profile')}
          style={{
            width: 36, height: 36, background: 'var(--elevated)',
            border: '1px solid var(--border-strong)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)',
          }}
          title={state.profile.name}
        >
          <Avatar idx={state.profile.avatar} size={20} />
        </button>
      </div>
    </div>
  );
}

// Simple geometric avatar
function Avatar({ idx = 0, size = 32 }) {
  const palettes = [
    ['#4FC3F7', '#7E57C2'],
    ['#81C784', '#4FC3F7'],
    ['#FFB74D', '#F06292'],
    ['#F06292', '#7E57C2'],
    ['#4DD0E1', '#81C784'],
    ['#BA68C8', '#4FC3F7'],
  ];
  const [c1, c2] = palettes[idx % palettes.length];
  const shapes = [
    // hex
    <polygon points="50,6 90,28 90,72 50,94 10,72 10,28" fill={`url(#g${idx})`} />,
    // diamond
    <polygon points="50,6 94,50 50,94 6,50" fill={`url(#g${idx})`} />,
    // triangle
    <polygon points="50,12 92,86 8,86" fill={`url(#g${idx})`} />,
    // circle
    <circle cx="50" cy="50" r="42" fill={`url(#g${idx})`} />,
    // square rot
    <rect x="18" y="18" width="64" height="64" fill={`url(#g${idx})`} transform="rotate(45 50 50)" />,
    // octagon
    <polygon points="30,8 70,8 92,30 92,70 70,92 30,92 8,70 8,30" fill={`url(#g${idx})`} />,
  ];
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <defs>
        <linearGradient id={`g${idx}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={c1} />
          <stop offset="100%" stopColor={c2} />
        </linearGradient>
      </defs>
      {shapes[idx % shapes.length]}
    </svg>
  );
}

// Starfield / grid background component
function GridBackdrop() {
  return (
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden',
    }}>
      <svg width="100%" height="100%" style={{ opacity: 0.5 }}>
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--border)" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>
  );
}

// Timer / stopwatch
function useTimer(active) {
  const [t, setT] = useState(0);
  const startRef = useRef(null);
  useEffect(() => {
    if (!active) return;
    startRef.current = Date.now() - t * 1000;
    const id = setInterval(() => {
      setT((Date.now() - startRef.current) / 1000);
    }, 100);
    return () => clearInterval(id);
  }, [active]);
  return [t, () => setT(0)];
}

function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

// Toast / flash
function Toast({ msg, kind = 'accent', onDone }) {
  useEffect(() => {
    const id = setTimeout(onDone, 2500);
    return () => clearTimeout(id);
  }, []);
  return (
    <div style={{
      position: 'fixed', top: 80, left: '50%', transform: 'translateX(-50%)',
      background: 'var(--elevated)', border: '1px solid var(--accent)',
      padding: '12px 20px', fontFamily: 'var(--font-mono)', fontSize: 13,
      color: 'var(--accent)', zIndex: 1000, boxShadow: '0 0 32px var(--accent-glow)',
      clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)',
    }}>
      {msg}
    </div>
  );
}

// Level completion modal
function LevelComplete({ level, stars, time, xp, onContinue }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(7, 11, 20, 0.85)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999,
      backdropFilter: 'blur(6px)',
    }}>
      <Card brackets style={{ padding: 40, minWidth: 480, textAlign: 'center', position: 'relative' }}>
        <Eyebrow>TRANSMISSION DECODED</Eyebrow>
        <div className="h1 accent glow-text" style={{ marginTop: 12, marginBottom: 4 }}>SUCCESS</div>
        <div className="dim mono" style={{ fontSize: 12, letterSpacing: '0.15em', marginBottom: 32 }}>
          {level.name.toUpperCase()} · {level.tag}
        </div>

        <div className="flex center gap-6" style={{ marginBottom: 32 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: 40, height: 40,
              clipPath: 'polygon(50% 0, 100% 38%, 82% 100%, 18% 100%, 0 38%)',
              background: i < stars ? 'var(--accent)' : 'var(--border)',
              boxShadow: i < stars ? '0 0 16px var(--accent-glow)' : 'none',
              transition: `all 0.3s ${i * 0.15}s`,
            }}/>
          ))}
        </div>

        <div className="flex gap-6 center" style={{ marginBottom: 32 }}>
          <div>
            <div className="dim mono" style={{ fontSize: 11, letterSpacing: '0.15em' }}>TIME</div>
            <div className="mono h3">{formatTime(time)}</div>
          </div>
          <div className="v-divider" style={{ height: 40 }}/>
          <div>
            <div className="dim mono" style={{ fontSize: 11, letterSpacing: '0.15em' }}>XP EARNED</div>
            <div className="mono h3 accent">+{xp}</div>
          </div>
          <div className="v-divider" style={{ height: 40 }}/>
          <div>
            <div className="dim mono" style={{ fontSize: 11, letterSpacing: '0.15em' }}>UNLOCKED</div>
            <div className="mono h3">
              {(LEVEL_UNLOCKS[level.id] || []).length || '—'}
            </div>
          </div>
        </div>

        <Btn primary onClick={onContinue}>CONTINUE ▸</Btn>
      </Card>
    </div>
  );
}

// Expose
Object.assign(window, {
  Card, Chip, Btn, Eyebrow, HeaderBar, Avatar, GridBackdrop,
  useTimer, formatTime, Toast, LevelComplete,
});
