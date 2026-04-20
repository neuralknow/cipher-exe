// ============ LEVEL ROUTER + TEXT/2D PUZZLES ============

const DIFFICULTY_CONFIG = {
  easy:   { timerMult: 1.5, hintsVisible: true },
  normal: { timerMult: 1.0, hintsVisible: true },
  hard:   { timerMult: 0.6, hintsVisible: false },
};

function LevelRouter({ state, actions }) {
  const lvl = LEVELS[state.levelId];
  if (!lvl) return <div className="dim" style={{ padding: 40 }}>Level not found.</div>;

  const shared = { state, actions, level: lvl };
  const map = {
    caesar: <CaesarLevel {...shared} />,
    binary: <BinaryLevel {...shared} />,
    morse: <MorseLevel {...shared} />,
    xor: <XorLevel {...shared} />,
    base64: <Base64Level {...shared} />,
    vigenere: <VigenereLevel {...shared} />,
    cube: <CubeLevel {...shared} />,
    enigma: <EnigmaLevel {...shared} />,
    keyexchange: <KeyExchangeLevel {...shared} />,
    hash: <HashLevel {...shared} />,
    rsa: <RsaLevel {...shared} />,
  };
  return map[lvl.id] || <div className="dim" style={{ padding: 40 }}>Not yet implemented.</div>;
}

// ============ Shared level scaffold ============
function LevelShell({ state, actions, level, briefing, objective, children, hint, rightPanel, onHint, success }) {
  return (
    <div>
      <HeaderBar state={state} actions={actions} showBack title={level.name.toUpperCase()} />
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
          <div className="col gap-4">
            {/* Briefing strip */}
            <Card style={{ padding: 20 }}>
              <div className="flex between center">
                <div className="flex center gap-3">
                  <Chip kind="accent">{level.kind}</Chip>
                  <Chip>{level.tag}</Chip>
                  <Chip>TIER {level.tier}</Chip>
                </div>
                <div className="mono dim" style={{ fontSize: 11, letterSpacing: '0.15em' }}>
                  MISSION · {level.id.toUpperCase()}
                </div>
              </div>
              <div className="h3" style={{ marginTop: 12 }}>{briefing}</div>
              <div className="dim" style={{ marginTop: 6, fontSize: 14 }}>{objective}</div>
            </Card>
            {/* Puzzle */}
            <div>{children}</div>
          </div>

          {/* Right sidebar */}
          <div className="col gap-4" style={{ position: 'sticky', top: 90, alignSelf: 'start' }}>
            {rightPanel}
            <Card style={{ padding: 20 }}>
              <div className="flex between center">
                <Eyebrow>HINT</Eyebrow>
                <Chip kind="amber">◆ {state.hintPoints} LEFT</Chip>
              </div>
              <div className="dim" style={{ fontSize: 13, marginTop: 10, lineHeight: 1.5 }}>
                Stuck? Use a hint point for a targeted clue.
              </div>
              <Btn sm style={{ marginTop: 12 }} disabled={state.hintPoints === 0 || success} onClick={onHint}>
                USE HINT ◆
              </Btn>
              {hint && (
                <div style={{
                  marginTop: 12, padding: 12, background: 'var(--bg)',
                  border: '1px dashed var(--amber)', fontSize: 12,
                  color: 'var(--amber)', fontFamily: 'var(--font-mono)',
                }}>
                  {hint}
                </div>
              )}
            </Card>
            {success && <SuccessPanel {...success} />}
          </div>
        </div>
      </div>
    </div>
  );
}

function SuccessPanel({ level, stars, time, xp, answer, onContinue }) {
  return (
    <Card brackets style={{ padding: 20, position: 'relative' }}>
      <div className="flex between center">
        <Eyebrow>● DECODED</Eyebrow>
        <Chip kind="success">CLEARED</Chip>
      </div>
      <div className="h3 success glow-text" style={{ marginTop: 8 }}>SUCCESS</div>
      <div className="dim mono" style={{ fontSize: 11, letterSpacing: '0.15em', marginTop: 2 }}>
        {level.name.toUpperCase()} · {level.tag}
      </div>

      <div className="flex center gap-3" style={{ marginTop: 16, marginBottom: 16 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 28, height: 28,
            clipPath: 'polygon(50% 0, 100% 38%, 82% 100%, 18% 100%, 0 38%)',
            background: i < stars ? 'var(--success)' : 'var(--border)',
            boxShadow: i < stars ? '0 0 12px var(--success)' : 'none',
            transition: `all 0.3s ${i * 0.15}s`,
          }}/>
        ))}
      </div>

      {answer && (
        <div style={{
          padding: 12, background: 'var(--bg)',
          border: '1px solid var(--success)', marginBottom: 12,
        }}>
          <div className="faint mono" style={{ fontSize: 9, letterSpacing: '0.15em' }}>ANSWER</div>
          <div className="mono success glow-text" style={{
            fontSize: 15, letterSpacing: '0.1em', marginTop: 4,
            wordBreak: 'break-all', lineHeight: 1.4,
          }}>{answer}</div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
        <div style={{ padding: 10, background: 'var(--bg)', border: '1px solid var(--border)' }}>
          <div className="faint mono" style={{ fontSize: 9, letterSpacing: '0.15em' }}>TIME</div>
          <div className="mono" style={{ fontSize: 18, fontWeight: 600 }}>{formatTime(time)}</div>
        </div>
        <div style={{ padding: 10, background: 'var(--bg)', border: '1px solid var(--border)' }}>
          <div className="faint mono" style={{ fontSize: 9, letterSpacing: '0.15em' }}>XP</div>
          <div className="mono success" style={{ fontSize: 18, fontWeight: 600 }}>+{xp}</div>
        </div>
      </div>

      <div className="dim" style={{ fontSize: 12, marginBottom: 12, lineHeight: 1.5, textWrap: 'pretty' }}>
        Review your solution above, then continue when ready.
      </div>

      <Btn primary onClick={onContinue} style={{ width: '100%' }}>CONTINUE ▸</Btn>
    </Card>
  );
}

// ============ CAESAR CIPHER — rotating wheel ============
const CAESAR_PUZZLES = [
  { cipher: 'KHOOR ZRUOG', plain: 'HELLO WORLD', shift: 3 },
  { cipher: 'VHFUHW PHVVDJH', plain: 'SECRET MESSAGE', shift: 3 },
  { cipher: 'PELS YDULHG', plain: 'CODE VARIED', shift: 5 },
];

function CaesarLevel({ state, actions, level }) {
  const [puzzleIdx] = useState(() => Math.floor(Math.random() * CAESAR_PUZZLES.length));
  const puzzle = CAESAR_PUZZLES[puzzleIdx];
  const [shift, setShift] = useState(0);
  const [complete, setComplete] = useState(false);
  const [time] = useTimer(!complete);
  const [showHint, setShowHint] = useState(false);

  const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const decoded = puzzle.cipher.split('').map(c => {
    if (c === ' ') return ' ';
    const i = A.indexOf(c);
    if (i === -1) return c;
    return A[(i - shift + 26) % 26];
  }).join('');

  useEffect(() => {
    if (decoded === puzzle.plain && !complete) {
      setComplete(true);
    }
  }, [decoded]);

  const stars = time < 30 ? 3 : time < 60 ? 2 : 1;

  return (
    <>
      <LevelShell
        state={state} actions={actions} level={level}
        success={complete ? { level, stars, time, xp: level.xp, answer: puzzle.plain, onContinue: () => actions.completeLevel(level.id, { stars, time, xp: level.xp }) } : null}
        briefing="A shifted message has been intercepted."
        objective="Rotate the outer wheel until the cipher aligns to plaintext."
        hint={showHint ? `The plaintext begins with "${puzzle.plain.split(' ')[0]}". Try shift = ${puzzle.shift}.` : null}
        onHint={() => { if (state.hintPoints > 0) { actions.useHint(); setShowHint(true); } }}
        rightPanel={<TimerPanel time={time} />}
      >
        <Card style={{ padding: 32 }}>
          <div className="flex gap-6">
            {/* Cipher wheel */}
            <div style={{ position: 'relative', width: 320, height: 320, flexShrink: 0 }}>
              <CipherWheel shift={shift} />
              <div style={{ position: 'absolute', bottom: -8, left: '50%', transform: 'translateX(-50%)' }}>
                <div style={{ width: 0, height: 0, borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderBottom: '12px solid var(--accent)' }}/>
              </div>
            </div>

            <div className="col gap-4 grow">
              <div>
                <Eyebrow>INTERCEPTED CIPHERTEXT</Eyebrow>
                <div className="mono" style={{
                  fontSize: 26, letterSpacing: '0.15em', marginTop: 8, padding: 16,
                  background: 'var(--bg)', border: '1px solid var(--border-strong)',
                  color: 'var(--text-dim)',
                }}>{puzzle.cipher}</div>
              </div>
              <div>
                <Eyebrow>DECODED OUTPUT</Eyebrow>
                <div className="mono" style={{
                  fontSize: 26, letterSpacing: '0.15em', marginTop: 8, padding: 16,
                  background: 'var(--bg)',
                  border: `1px solid ${complete ? 'var(--success)' : 'var(--border-strong)'}`,
                  color: complete ? 'var(--success)' : 'var(--accent)',
                  textShadow: complete ? '0 0 12px currentColor' : 'none',
                }}>{decoded}<span className="cursor"/></div>
              </div>
              <div>
                <div className="flex between">
                  <Eyebrow>SHIFT KEY</Eyebrow>
                  <span className="mono accent">k = {shift}</span>
                </div>
                <input type="range" min="0" max="25" value={shift}
                       onChange={e => setShift(+e.target.value)}
                       style={{ width: '100%', marginTop: 8, accentColor: 'var(--accent)' }}/>
                <div className="flex between mono faint" style={{ fontSize: 10, marginTop: 4 }}>
                  <span>0</span><span>13</span><span>25</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </LevelShell>
    </>
  );
}

function CipherWheel({ shift }) {
  const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const R_OUTER = 150, R_MID = 110, R_INNER = 75;
  return (
    <svg width={320} height={320} viewBox="-160 -160 320 320">
      {/* Outer ring — rotates with shift */}
      <g style={{ transform: `rotate(${-shift * 360 / 26}deg)`, transition: 'transform 0.2s' }}>
        <circle r={R_OUTER} fill="none" stroke="var(--border-strong)"/>
        <circle r={R_MID} fill="none" stroke="var(--border-strong)"/>
        {A.split('').map((c, i) => {
          const angle = i * 360 / 26 - 90;
          const rad = angle * Math.PI / 180;
          const r = (R_OUTER + R_MID) / 2;
          return (
            <g key={i} transform={`translate(${r * Math.cos(rad)},${r * Math.sin(rad)})`}>
              <text textAnchor="middle" dy="5" fill="var(--accent)" fontSize="14"
                    fontFamily="var(--font-mono)" fontWeight="600">{c}</text>
            </g>
          );
        })}
        {/* tick marks */}
        {A.split('').map((_, i) => {
          const angle = i * 360 / 26 - 90;
          const rad = angle * Math.PI / 180;
          return <line key={i}
            x1={R_MID * Math.cos(rad)} y1={R_MID * Math.sin(rad)}
            x2={R_OUTER * Math.cos(rad)} y2={R_OUTER * Math.sin(rad)}
            stroke="var(--border)" strokeWidth="0.5"/>;
        })}
      </g>
      {/* Inner ring (fixed) */}
      <circle r={R_INNER + 30} fill="none" stroke="var(--border-strong)"/>
      <circle r={R_INNER} fill="var(--elevated)" stroke="var(--border-strong)"/>
      {A.split('').map((c, i) => {
        const angle = i * 360 / 26 - 90;
        const rad = angle * Math.PI / 180;
        const r = (R_INNER + R_INNER + 30) / 2;
        return (
          <text key={i}
            x={r * Math.cos(rad)} y={r * Math.sin(rad)}
            textAnchor="middle" dy="4" fill="var(--text-dim)" fontSize="11"
            fontFamily="var(--font-mono)">{c}</text>
        );
      })}
      <text x={0} y={-8} textAnchor="middle" fill="var(--text-faint)" fontSize="9" fontFamily="var(--font-mono)" letterSpacing="1.5">SHIFT</text>
      <text x={0} y={10} textAnchor="middle" fill="var(--accent)" fontSize="20" fontFamily="var(--font-mono)" fontWeight="700">{shift}</text>
    </svg>
  );
}

// ============ TIMER PANEL ============
function TimerPanel({ time, target = null, danger = false }) {
  return (
    <Card style={{ padding: 20 }}>
      <div className="flex between">
        <Eyebrow>ELAPSED</Eyebrow>
        {target && <span className="mono faint" style={{ fontSize: 11 }}>TGT {formatTime(target)}</span>}
      </div>
      <div className="mono" style={{
        fontSize: 36, fontWeight: 600, marginTop: 4,
        color: danger ? 'var(--danger)' : 'var(--accent)',
        textShadow: '0 0 12px currentColor',
      }}>{formatTime(time)}</div>
    </Card>
  );
}

// ============ BINARY / ASCII — timed terminal ============
const BINARY_PUZZLES = [
  { plain: 'HACK' },
  { plain: 'DATA' },
  { plain: 'ROOT' },
  { plain: 'KEY' },
];
function toBinary(s) {
  return s.split('').map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');
}

function BinaryLevel({ state, actions, level }) {
  const [puzzle] = useState(() => BINARY_PUZZLES[Math.floor(Math.random() * BINARY_PUZZLES.length)]);
  const [input, setInput] = useState('');
  const [complete, setComplete] = useState(false);
  const [failed, setFailed] = useState(false);
  const [time] = useTimer(!complete && !failed);
  const [showHint, setShowHint] = useState(false);
  const TIME_LIMIT = 60;

  const cipher = toBinary(puzzle.plain);
  const remaining = Math.max(0, TIME_LIMIT - time);

  useEffect(() => {
    if (remaining === 0 && !complete) setFailed(true);
  }, [remaining]);

  function submit() {
    if (input.toUpperCase().trim() === puzzle.plain) setComplete(true);
  }

  const stars = time < 20 ? 3 : time < 40 ? 2 : 1;

  return (
    <>
      <LevelShell
        state={state} actions={actions} level={level}
        success={complete ? { level, stars, time, xp: level.xp, answer: puzzle.plain, onContinue: () => actions.completeLevel(level.id, { stars, time, xp: level.xp }) } : null}
        briefing="Binary stream decoded from attack packet."
        objective="Convert each 8-bit group to its ASCII character. Type the plaintext before the timer expires."
        hint={showHint ? `First byte is 01001XXX — uppercase letter range. A=65, Z=90.` : null}
        onHint={() => { if (state.hintPoints > 0) { actions.useHint(); setShowHint(true); } }}
        rightPanel={<TimerPanel time={remaining} danger={remaining < 15} />}
      >
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <div className="flex between center" style={{ padding: '12px 20px', background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
            <div className="flex center gap-2">
              <span style={{ width: 10, height: 10, background: 'var(--danger)' }}/>
              <span style={{ width: 10, height: 10, background: 'var(--amber)' }}/>
              <span style={{ width: 10, height: 10, background: 'var(--success)' }}/>
              <span className="mono dim" style={{ fontSize: 11, marginLeft: 12 }}>/bin/cipher-decode-v4 — tty0</span>
            </div>
            <div className="mono accent" style={{ fontSize: 11 }}>● LIVE</div>
          </div>
          <div style={{ padding: 24, background: 'var(--bg)', minHeight: 400, fontFamily: 'var(--font-mono)' }}>
            <div className="dim" style={{ fontSize: 13 }}>$ wasm-exec crypto.wasm --stream=packet.bin</div>
            <div className="dim" style={{ fontSize: 13, marginTop: 4 }}>&gt; buffer loaded ({cipher.length / 9 + 1} bytes)</div>
            <div className="dim" style={{ fontSize: 13, marginTop: 4 }}>&gt; waiting for plaintext...</div>
            <div style={{ marginTop: 24, padding: 20, background: 'var(--elevated)', border: '1px solid var(--border)' }}>
              <div className="accent" style={{ fontSize: 20, letterSpacing: '0.1em', lineHeight: 1.8, wordBreak: 'break-all' }}>
                {cipher}
              </div>
            </div>
            <div style={{ marginTop: 24 }}>
              <div className="dim" style={{ fontSize: 12, marginBottom: 8 }}>YOUR INPUT:</div>
              <div className="flex center">
                <span className="accent" style={{ fontSize: 18, marginRight: 8 }}>&gt;</span>
                <input
                  className="input mono"
                  style={{ fontSize: 20, letterSpacing: '0.15em', textTransform: 'uppercase', border: 'none', background: 'transparent' }}
                  value={input}
                  onChange={e => setInput(e.target.value.toUpperCase())}
                  onKeyDown={e => e.key === 'Enter' && submit()}
                  placeholder="TYPE HERE AND PRESS ENTER"
                  autoFocus
                  disabled={complete || failed}
                />
              </div>
              <div className="flex gap-3" style={{ marginTop: 16 }}>
                <Btn primary onClick={submit} disabled={complete || failed}>TRANSMIT ▸</Btn>
                {failed && <Btn onClick={() => window.location.reload()}>RETRY</Btn>}
              </div>
            </div>
          </div>
        </Card>
      </LevelShell>
    </>
  );
}

// ============ MORSE ============
const MORSE = { A:'·−', B:'−···', C:'−·−·', D:'−··', E:'·', F:'··−·', G:'−−·', H:'····', I:'··', J:'·−−−', K:'−·−', L:'·−··', M:'−−', N:'−·', O:'−−−', P:'·−−·', Q:'−−·−', R:'·−·', S:'···', T:'−', U:'··−', V:'···−', W:'·−−', X:'−··−', Y:'−·−−', Z:'−−··' };
const MORSE_PUZZLES = ['SOS', 'RUN', 'ENEMY', 'SAFE'];

function MorseLevel({ state, actions, level }) {
  const [plain] = useState(() => MORSE_PUZZLES[Math.floor(Math.random() * MORSE_PUZZLES.length)]);
  const [input, setInput] = useState('');
  const [complete, setComplete] = useState(false);
  const [time] = useTimer(!complete);
  const [showHint, setShowHint] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [lit, setLit] = useState(-1);

  const code = plain.split('').map(c => MORSE[c]).join(' / ');

  function submit() {
    if (input.toUpperCase().trim() === plain) setComplete(true);
  }

  async function playAudio() {
    if (playing) return;
    setPlaying(true);
    const chars = plain.split('');
    for (let ci = 0; ci < chars.length; ci++) {
      const morse = MORSE[chars[ci]];
      for (let i = 0; i < morse.length; i++) {
        setLit(Math.random());
        await new Promise(r => setTimeout(r, morse[i] === '·' ? 150 : 400));
        setLit(-1);
        await new Promise(r => setTimeout(r, 100));
      }
      await new Promise(r => setTimeout(r, 300));
    }
    setPlaying(false);
  }

  const stars = time < 30 ? 3 : time < 60 ? 2 : 1;

  return (
    <>
      <LevelShell
        state={state} actions={actions} level={level}
        success={complete ? { level, stars, time, xp: level.xp, answer: plain, onContinue: () => actions.completeLevel(level.id, { stars, time, xp: level.xp }) } : null}
        briefing="Signal intercepted over shortwave. 4,500 kHz."
        objective="Each group separated by / is one letter. Decode and transmit."
        hint={showHint ? `Starts with ${plain[0]} (${MORSE[plain[0]]})` : null}
        onHint={() => { if (state.hintPoints > 0) { actions.useHint(); setShowHint(true); } }}
        rightPanel={<TimerPanel time={time} />}
      >
        <Card style={{ padding: 32 }}>
          <Eyebrow>TRANSMISSION</Eyebrow>
          <div style={{
            marginTop: 12, padding: 28, background: 'var(--bg)',
            border: '1px solid var(--border-strong)', textAlign: 'center',
            fontFamily: 'var(--font-mono)', fontSize: 40, letterSpacing: '0.3em',
            color: 'var(--accent)', textShadow: '0 0 12px var(--accent-glow)',
            minHeight: 120,
          }}>
            <div style={{ opacity: lit > 0 ? 1 : 0.6, transition: 'opacity 0.05s' }}>{code}</div>
          </div>
          <div className="flex gap-3" style={{ marginTop: 16 }}>
            <Btn onClick={playAudio} disabled={playing}>{playing ? '▶ PLAYING...' : '▶ REPLAY VISUAL'}</Btn>
            <div className="flex center grow gap-2">
              <span className="faint mono" style={{ fontSize: 11 }}>· = DIT   − = DAH   / = LETTER BREAK</span>
            </div>
          </div>

          <div className="divider" style={{ margin: '32px 0' }}/>

          <Eyebrow>DECODED PLAINTEXT</Eyebrow>
          <div className="flex gap-3" style={{ marginTop: 12 }}>
            <input
              className="input mono"
              style={{ fontSize: 20, letterSpacing: '0.15em', textTransform: 'uppercase' }}
              value={input}
              onChange={e => setInput(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && submit()}
              placeholder="TYPE PLAINTEXT"
              disabled={complete}
            />
            <Btn primary onClick={submit} disabled={complete}>TRANSMIT ▸</Btn>
          </div>

          {/* Morse reference */}
          <div style={{ marginTop: 32 }}>
            <Eyebrow>MORSE REFERENCE</Eyebrow>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(13, 1fr)', gap: 4, marginTop: 12 }}>
              {Object.entries(MORSE).map(([l, m]) => (
                <div key={l} style={{
                  padding: '6px 4px', background: 'var(--bg)',
                  border: '1px solid var(--border)', textAlign: 'center',
                  fontFamily: 'var(--font-mono)', fontSize: 10,
                }}>
                  <div className="accent" style={{ fontSize: 12, fontWeight: 600 }}>{l}</div>
                  <div className="dim" style={{ letterSpacing: '0.1em' }}>{m}</div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </LevelShell>
    </>
  );
}

// Expose partial
Object.assign(window, { LevelRouter, LevelShell, TimerPanel });
