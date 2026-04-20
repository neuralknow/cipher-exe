// Main hub with skill tree
const TREE_LAYOUT = {
  caesar:      { x: 0, y: 0 },
  binary:      { x: -1.5, y: 1 },
  morse:       { x: 1.5, y: 1 },
  xor:         { x: -2, y: 2 },
  base64:      { x: -0.5, y: 2 },
  vigenere:    { x: 1.5, y: 2 },
  cube:        { x: -1, y: 3 },
  enigma:      { x: 1.5, y: 3 },
  keyexchange: { x: 0, y: 4 },
  hash:        { x: -1.5, y: 4.2 },
  rsa:         { x: 0, y: 5 },
};

const TREE_EDGES = [
  ['caesar', 'binary'], ['caesar', 'morse'],
  ['binary', 'xor'], ['binary', 'base64'],
  ['morse', 'vigenere'],
  ['xor', 'cube'], ['base64', 'cube'],
  ['vigenere', 'enigma'],
  ['cube', 'keyexchange'],
  ['enigma', 'keyexchange'],
  ['keyexchange', 'hash'],
  ['hash', 'rsa'],
];

function HubScreen({ state, actions }) {
  const [tab, setTab] = useState('tree');
  const level = Math.floor(state.xp / 500) + 1;

  return (
    <div>
      <HeaderBar state={state} actions={actions} />
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}>
        {/* Welcome header */}
        <div className="flex between" style={{ marginBottom: 32 }}>
          <div>
            <Eyebrow>MISSION HUB / {state.profile.path?.toUpperCase() || 'OPERATIVE'}</Eyebrow>
            <div className="h1" style={{ marginTop: 6 }}>
              Welcome back, <span className="accent glow-text">{state.profile.name}</span>.
            </div>
            <div className="dim" style={{ marginTop: 8, fontSize: 15 }}>
              {Object.keys(state.completed).length === 0
                ? "Your first cipher awaits. Start with the Caesar shift — it's been used for 2,000 years."
                : `${Object.keys(state.completed).length} of 11 ciphers cracked. Keep the streak alive.`}
            </div>
          </div>
          <div className="flex gap-3">
            <Btn onClick={() => actions.goto('sandbox')}>▦ SANDBOX</Btn>
            <Btn onClick={() => actions.goto('daily')}>◈ DAILY</Btn>
            <Btn onClick={() => actions.goto('codex')}>☰ CODEX</Btn>
          </div>
        </div>

        {/* Stat strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
          <StatTile label="OPERATIVE LEVEL" value={level} sub={`${state.xp} XP`} accent="accent" />
          <StatTile label="CIPHERS CRACKED" value={`${Object.keys(state.completed).length}/11`} sub="skill nodes" accent="violet" />
          <StatTile label="CURRENT STREAK" value={`${state.streak}d`} sub="daily login" accent="amber" />
          <StatTile label="BADGES EARNED" value={state.badges.length} sub={`of ${Object.keys(BADGES).length}`} accent="success" />
        </div>

        {/* Tabs */}
        <div className="flex gap-2" style={{ marginBottom: 24, borderBottom: '1px solid var(--border)' }}>
          {[
            { id: 'tree', label: 'SKILL TREE' },
            { id: 'feed', label: 'BRIEFING FEED' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: '10px 20px',
                background: 'transparent',
                border: 'none',
                borderBottom: tab === t.id ? '2px solid var(--accent)' : '2px solid transparent',
                color: tab === t.id ? 'var(--accent)' : 'var(--text-dim)',
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                letterSpacing: '0.15em',
                cursor: 'pointer',
                marginBottom: -1,
              }}
            >{t.label}</button>
          ))}
        </div>

        {tab === 'tree' && <SkillTree state={state} actions={actions} />}
        {tab === 'feed' && <BriefingFeed state={state} actions={actions} />}
      </div>
    </div>
  );
}

function StatTile({ label, value, sub, accent }) {
  return (
    <Card style={{ padding: 20 }}>
      <div className="dim mono" style={{ fontSize: 10, letterSpacing: '0.2em' }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 600, marginTop: 4 }} className={accent}>{value}</div>
      <div className="faint mono" style={{ fontSize: 11, marginTop: 2 }}>{sub}</div>
    </Card>
  );
}

function SkillTree({ state, actions }) {
  const W = 900, H = 720;
  const CX = W / 2;
  const SCALE_X = 140;
  const SCALE_Y = 130;

  function nodePos(id) {
    const { x, y } = TREE_LAYOUT[id];
    return { x: CX + x * SCALE_X, y: 60 + y * SCALE_Y };
  }

  return (
    <Card brackets style={{ padding: 0, overflow: 'hidden', position: 'relative' }}>
      <div className="flex between" style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
        <div>
          <Eyebrow>SKILL TREE</Eyebrow>
          <div className="dim" style={{ fontSize: 13, marginTop: 4 }}>
            Click any unlocked node to deploy. Completing a node unlocks its children.
          </div>
        </div>
        <div className="flex gap-3">
          <div className="flex center gap-2"><span style={{ width: 10, height: 10, background: 'var(--accent)', boxShadow: '0 0 8px var(--accent-glow)' }}/><span className="mono dim" style={{ fontSize: 11 }}>READY</span></div>
          <div className="flex center gap-2"><span style={{ width: 10, height: 10, background: 'var(--success)' }}/><span className="mono dim" style={{ fontSize: 11 }}>CLEARED</span></div>
          <div className="flex center gap-2"><span style={{ width: 10, height: 10, background: 'var(--border-strong)' }}/><span className="mono dim" style={{ fontSize: 11 }}>LOCKED</span></div>
        </div>
      </div>

      <div style={{ position: 'relative', height: H, background: 'var(--bg)', overflow: 'auto' }}>
        <svg width={W} height={H} style={{ display: 'block', margin: '0 auto' }}>
          <defs>
            <pattern id="hexdots" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="12" cy="12" r="1" fill="var(--border)"/>
            </pattern>
            <linearGradient id="edgeActive" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--accent)"/>
              <stop offset="100%" stopColor="var(--violet)"/>
            </linearGradient>
          </defs>
          <rect width={W} height={H} fill="url(#hexdots)" />

          {/* Tier labels */}
          {[1, 2, 3, 4, 5].map(t => (
            <g key={t}>
              <line x1={40} x2={W - 40} y1={60 + (t - 0.5) * SCALE_Y} y2={60 + (t - 0.5) * SCALE_Y}
                    stroke="var(--border)" strokeDasharray="3 6"/>
              <text x={50} y={60 + (t - 0.5) * SCALE_Y - 6} fill="var(--text-faint)" fontSize="10"
                    fontFamily="var(--font-mono)" letterSpacing="2">TIER {t.toString().padStart(2, '0')}</text>
            </g>
          ))}

          {/* Edges */}
          {TREE_EDGES.map(([a, b], i) => {
            const p1 = nodePos(a);
            const p2 = nodePos(b);
            const done = state.completed[a];
            const active = state.unlocked.includes(b);
            return (
              <line key={i} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                    stroke={done ? 'url(#edgeActive)' : 'var(--border-strong)'}
                    strokeWidth={done ? 2 : 1}
                    opacity={active ? 1 : 0.4}/>
            );
          })}

          {/* Nodes */}
          {Object.values(LEVELS).map(lvl => {
            const { x, y } = nodePos(lvl.id);
            const isUnlocked = state.unlocked.includes(lvl.id);
            const isDone = !!state.completed[lvl.id];
            const stars = state.completed[lvl.id]?.stars || 0;
            return (
              <g key={lvl.id}
                 style={{ cursor: isUnlocked ? 'pointer' : 'not-allowed' }}
                 onClick={() => isUnlocked && actions.goto('level', { levelId: lvl.id })}>
                {/* Outer ring */}
                {isUnlocked && !isDone && (
                  <circle cx={x} cy={y} r={38}
                          fill="none" stroke="var(--accent)" strokeWidth={1} opacity="0.4">
                    <animate attributeName="r" from="38" to="48" dur="2s" repeatCount="indefinite"/>
                    <animate attributeName="opacity" from="0.5" to="0" dur="2s" repeatCount="indefinite"/>
                  </circle>
                )}
                {/* Node shape */}
                <polygon
                  points={hexPoints(x, y, 32)}
                  fill={isDone ? 'var(--success-soft)' : isUnlocked ? 'var(--accent-soft)' : 'var(--surface)'}
                  stroke={isDone ? 'var(--success)' : isUnlocked ? 'var(--accent)' : 'var(--border-strong)'}
                  strokeWidth={isUnlocked ? 2 : 1}
                  style={{ filter: isUnlocked ? 'drop-shadow(0 0 8px var(--accent-glow))' : 'none' }}
                />
                {/* Kind label */}
                <text x={x} y={y - 2} textAnchor="middle"
                      fill={isDone ? 'var(--success)' : isUnlocked ? 'var(--accent)' : 'var(--text-faint)'}
                      fontSize="10" fontFamily="var(--font-mono)" letterSpacing="1.5">
                  {lvl.kind}
                </text>
                <text x={x} y={y + 10} textAnchor="middle"
                      fill={isDone ? 'var(--success)' : isUnlocked ? 'var(--text)' : 'var(--text-faint)'}
                      fontSize="9" fontFamily="var(--font-mono)" letterSpacing="1" opacity="0.8">
                  {lvl.tag}
                </text>

                {/* Name below */}
                <text x={x} y={y + 54} textAnchor="middle"
                      fill={isUnlocked ? 'var(--text)' : 'var(--text-faint)'}
                      fontSize="12" fontFamily="var(--font-ui)" fontWeight="500">
                  {lvl.name}
                </text>

                {/* Stars */}
                {isDone && [0, 1, 2].map(i => (
                  <polygon key={i}
                    points={starPoints(x - 10 + i * 10, y + 66, 3.5)}
                    fill={i < stars ? 'var(--accent)' : 'var(--border)'}/>
                ))}

                {/* Lock icon */}
                {!isUnlocked && (
                  <text x={x} y={y + 4} textAnchor="middle" fill="var(--text-faint)" fontSize="16">⌧</text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </Card>
  );
}

function hexPoints(cx, cy, r) {
  return [0, 60, 120, 180, 240, 300].map(a => {
    const rad = (a - 30) * Math.PI / 180;
    return `${cx + r * Math.cos(rad)},${cy + r * Math.sin(rad)}`;
  }).join(' ');
}
function starPoints(cx, cy, r) {
  let pts = '';
  for (let i = 0; i < 10; i++) {
    const rad = (i * 36 - 90) * Math.PI / 180;
    const rr = i % 2 === 0 ? r : r * 0.45;
    pts += `${cx + rr * Math.cos(rad)},${cy + rr * Math.sin(rad)} `;
  }
  return pts;
}

function BriefingFeed({ state, actions }) {
  const completedList = Object.entries(state.completed).map(([id, data]) => ({ id, ...data, level: LEVELS[id] }));
  const available = Object.values(LEVELS).filter(l => state.unlocked.includes(l.id) && !state.completed[l.id]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
      <Card style={{ padding: 0 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <Eyebrow>ACTIVE MISSIONS</Eyebrow>
        </div>
        <div>
          {available.length === 0 && (
            <div className="dim" style={{ padding: 40, textAlign: 'center' }}>No missions available. Complete pending levels to unlock more.</div>
          )}
          {available.map(lvl => (
            <div key={lvl.id} className="flex center gap-4" style={{
              padding: '16px 20px', borderBottom: '1px solid var(--border)', cursor: 'pointer',
            }} onClick={() => actions.goto('level', { levelId: lvl.id })}>
              <div style={{
                width: 44, height: 44,
                background: 'var(--accent-soft)', border: '1px solid var(--accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontSize: 11,
                clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)',
              }}>{lvl.kind}</div>
              <div className="grow">
                <div className="flex center gap-3">
                  <span style={{ fontWeight: 500 }}>{lvl.name}</span>
                  <Chip>{lvl.tag}</Chip>
                  <Chip kind="accent">TIER {lvl.tier}</Chip>
                </div>
                <div className="dim" style={{ fontSize: 13, marginTop: 2 }}>{lvl.desc}</div>
              </div>
              <div className="flex center gap-3">
                <span className="mono accent" style={{ fontSize: 12 }}>+{lvl.xp} XP</span>
                <span className="accent">▸</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card style={{ padding: 20 }}>
        <Eyebrow>RECENT ACTIVITY</Eyebrow>
        <div className="col gap-3" style={{ marginTop: 16 }}>
          {completedList.length === 0 && (
            <div className="dim" style={{ fontSize: 13 }}>No activity yet. Deploy on your first mission.</div>
          )}
          {completedList.slice(-5).reverse().map(c => (
            <div key={c.id} className="flex center gap-3">
              <span className="success">●</span>
              <div className="grow">
                <div style={{ fontSize: 13 }}>{c.level?.name}</div>
                <div className="faint mono" style={{ fontSize: 10 }}>{formatTime(c.time)} · {c.stars}★</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

window.HubScreen = HubScreen;
