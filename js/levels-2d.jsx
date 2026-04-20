// ============ XOR, BASE64, VIGENERE, ENIGMA (2D puzzles) ============

// -------- XOR LOGIC CIRCUIT --------
function XorLevel({ state, actions, level }) {
  const [plaintext] = useState('ATTACK');
  const [key] = useState('KEY');
  const [complete, setComplete] = useState(false);
  const [time] = useTimer(!complete);
  const [showHint, setShowHint] = useState(false);

  // Visible state: user toggles 8 bits of the XOR result manually? Simpler: user enters the XOR'd result.
  // Better: show plaintext bits + key bits, user clicks each output bit to set 0/1, must match XOR.
  const plainBits = plaintext.charCodeAt(0).toString(2).padStart(8, '0');
  const keyBits = key.charCodeAt(0).toString(2).padStart(8, '0');
  const correctOut = plainBits.split('').map((b, i) => b === keyBits[i] ? '0' : '1').join('');

  const [output, setOutput] = useState('00000000');

  useEffect(() => {
    if (output === correctOut && !complete) setComplete(true);
  }, [output]);

  function toggleBit(i) {
    const arr = output.split('');
    arr[i] = arr[i] === '0' ? '1' : '0';
    setOutput(arr.join(''));
  }

  const stars = time < 40 ? 3 : time < 80 ? 2 : 1;

  return (
    <>
      <LevelShell
        state={state} actions={actions} level={level}
        success={complete ? { level, stars, time, xp: level.xp, answer: `${plainBits} ⊕ ${keyBits} = ${correctOut}`, onContinue: () => actions.completeLevel(level.id, { stars, time, xp: level.xp }) } : null}
        briefing="XOR gate array ready. Stream one byte at a time."
        objective={`Compute P ⊕ K for the first byte of "${plaintext}" XOR'd with key byte "${key[0]}". Click output bits until the gate turns green.`}
        hint={showHint ? `XOR rule: 0⊕0=0, 0⊕1=1, 1⊕0=1, 1⊕1=0. Output = ${correctOut}` : null}
        onHint={() => { if (state.hintPoints > 0) { actions.useHint(); setShowHint(true); } }}
        rightPanel={<TimerPanel time={time} />}
      >
        <Card style={{ padding: 32 }}>
          <Eyebrow>GATE ARRAY</Eyebrow>
          <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <BitRow label={`PLAINTEXT "${plaintext[0]}"`} bits={plainBits} color="var(--text-dim)" />
            <div className="flex center" style={{ padding: '8px 0' }}>
              <div className="mono accent" style={{ fontSize: 20, letterSpacing: '0.2em' }}>⊕ XOR</div>
            </div>
            <BitRow label={`KEY "${key[0]}"`} bits={keyBits} color="var(--violet)" />
            <div style={{ borderTop: '1px dashed var(--border-strong)', margin: '12px 0' }}/>
            <BitRow
              label="OUTPUT (CLICK)"
              bits={output}
              color={complete ? 'var(--success)' : 'var(--accent)'}
              interactive
              correctBits={correctOut}
              onToggle={toggleBit}
            />
          </div>

          <div className="divider" style={{ margin: '32px 0' }}/>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {[
              ['0 ⊕ 0', '0'], ['0 ⊕ 1', '1'], ['1 ⊕ 0', '1'], ['1 ⊕ 1', '0'],
            ].map(([inp, out]) => (
              <div key={inp} style={{
                padding: '12px 16px', background: 'var(--bg)',
                border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between',
                fontFamily: 'var(--font-mono)', fontSize: 14,
              }}>
                <span className="dim">{inp}</span>
                <span className="accent">= {out}</span>
              </div>
            ))}
          </div>
        </Card>
      </LevelShell>
    </>
  );
}

function BitRow({ label, bits, color, interactive, correctBits, onToggle }) {
  return (
    <div className="flex center gap-4">
      <div className="mono faint" style={{ fontSize: 10, width: 140, letterSpacing: '0.1em' }}>{label}</div>
      <div style={{ display: 'flex', gap: 6 }}>
        {bits.split('').map((b, i) => {
          const isCorrect = correctBits ? b === correctBits[i] : true;
          return (
            <div key={i}
              onClick={() => interactive && onToggle(i)}
              style={{
                width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: b === '1' ? (interactive ? (isCorrect ? 'var(--success-soft)' : 'var(--accent-soft)') : 'var(--accent-soft)') : 'var(--bg)',
                border: `1px solid ${b === '1' ? (interactive ? (isCorrect ? 'var(--success)' : 'var(--accent)') : 'var(--accent)') : 'var(--border-strong)'}`,
                color: b === '1' ? (interactive && isCorrect ? 'var(--success)' : color) : 'var(--text-faint)',
                fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 600,
                cursor: interactive ? 'pointer' : 'default',
                transition: 'all 0.15s',
                boxShadow: b === '1' ? `0 0 8px ${color}` : 'none',
              }}>{b}</div>
          );
        })}
      </div>
    </div>
  );
}

// -------- BASE64 --------
function b64Encode(s) {
  return btoa(s);
}

const B64_PUZZLES = ['RUN', 'GO', 'KEY', 'BOT'];

function Base64Level({ state, actions, level }) {
  const [plain] = useState(() => B64_PUZZLES[Math.floor(Math.random() * B64_PUZZLES.length)]);
  const [input, setInput] = useState('');
  const [complete, setComplete] = useState(false);
  const [time] = useTimer(!complete);
  const [showHint, setShowHint] = useState(false);

  const encoded = b64Encode(plain);

  function submit() {
    if (input.toUpperCase().trim() === plain) setComplete(true);
  }

  const stars = time < 20 ? 3 : time < 45 ? 2 : 1;

  return (
    <>
      <LevelShell
        state={state} actions={actions} level={level}
        success={complete ? { level, stars, time, xp: level.xp, answer: plain, onContinue: () => actions.completeLevel(level.id, { stars, time, xp: level.xp }) } : null}
        briefing="Packet header dumped. Base64 payload captured."
        objective="Decode the Base64 string. Remember — Base64 isn't encryption, just encoding."
        hint={showHint ? `Hint: 3 plaintext bytes → 4 Base64 chars. Plaintext length = ${plain.length}.` : null}
        onHint={() => { if (state.hintPoints > 0) { actions.useHint(); setShowHint(true); } }}
        rightPanel={<TimerPanel time={time} />}
      >
        <Card style={{ padding: 32 }}>
          <Eyebrow>BASE64 PAYLOAD</Eyebrow>
          <div className="mono" style={{
            marginTop: 12, padding: 24, background: 'var(--bg)',
            border: '1px solid var(--border-strong)',
            fontSize: 40, letterSpacing: '0.15em', textAlign: 'center',
            color: 'var(--violet)', textShadow: '0 0 12px var(--violet)',
          }}>{encoded}</div>

          <div style={{ marginTop: 24 }}>
            <Eyebrow>DECODE STEPS</Eyebrow>
            <div className="mono dim" style={{ fontSize: 13, marginTop: 12, lineHeight: 1.8 }}>
              <div>1. Base64 uses chars: A-Z a-z 0-9 + /</div>
              <div>2. Each char maps to 6 bits. Group them in bytes of 8.</div>
              <div>3. Each byte is an ASCII character.</div>
            </div>
          </div>

          <div className="divider" style={{ margin: '24px 0' }}/>

          <Eyebrow>PLAINTEXT</Eyebrow>
          <div className="flex gap-3" style={{ marginTop: 12 }}>
            <input
              className="input mono"
              style={{ fontSize: 20, letterSpacing: '0.15em', textTransform: 'uppercase' }}
              value={input}
              onChange={e => setInput(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && submit()}
              placeholder="TYPE DECODED TEXT"
              disabled={complete}
            />
            <Btn primary onClick={submit} disabled={complete}>DECODE ▸</Btn>
          </div>
          <div className="dim mono" style={{ fontSize: 11, marginTop: 12 }}>
            TIP: in a real terminal, <span className="accent">echo "{encoded}" | base64 -d</span>
          </div>
        </Card>
      </LevelShell>
    </>
  );
}

// -------- VIGENERE --------
const VIG_PUZZLES = [
  { plain: 'ATTACK', key: 'LEMON' },
  { plain: 'SECRET', key: 'CODE' },
];

function vigenereEncode(plain, key) {
  const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  return plain.split('').map((c, i) => {
    const pi = A.indexOf(c);
    const ki = A.indexOf(key[i % key.length]);
    return A[(pi + ki) % 26];
  }).join('');
}

function VigenereLevel({ state, actions, level }) {
  const [puzzle] = useState(() => VIG_PUZZLES[Math.floor(Math.random() * VIG_PUZZLES.length)]);
  const [key, setKey] = useState('');
  const [complete, setComplete] = useState(false);
  const [time] = useTimer(!complete);
  const [showHint, setShowHint] = useState(false);

  const cipher = vigenereEncode(puzzle.plain, puzzle.key);
  const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const decoded = key.length > 0
    ? cipher.split('').map((c, i) => {
        const ci = A.indexOf(c);
        const ki = A.indexOf(key[i % key.length] || 'A');
        return A[(ci - ki + 26) % 26];
      }).join('')
    : '';

  useEffect(() => {
    if (decoded === puzzle.plain && !complete) setComplete(true);
  }, [decoded]);

  const stars = time < 40 ? 3 : time < 90 ? 2 : 1;

  return (
    <>
      <LevelShell
        state={state} actions={actions} level={level}
        success={complete ? { level, stars, time, xp: level.xp, answer: puzzle.plain, onContinue: () => actions.completeLevel(level.id, { stars, time, xp: level.xp }) } : null}
        briefing="Polyalphabetic cipher. Each letter shifted by a different key letter."
        objective={`Find the ${puzzle.key.length}-letter key. When the decoded text looks like English, you're correct.`}
        hint={showHint ? `Key is "${puzzle.key}" (${puzzle.key.length} letters).` : null}
        onHint={() => { if (state.hintPoints > 0) { actions.useHint(); setShowHint(true); } }}
        rightPanel={<TimerPanel time={time} />}
      >
        <Card style={{ padding: 32 }}>
          <Eyebrow>CIPHERTEXT</Eyebrow>
          <div className="mono" style={{
            marginTop: 12, padding: 20, background: 'var(--bg)',
            border: '1px solid var(--border-strong)',
            fontSize: 28, letterSpacing: '0.2em', color: 'var(--text-dim)',
          }}>{cipher}</div>

          <div style={{ marginTop: 24 }}>
            <Eyebrow>KEY (try {puzzle.key.length} letters)</Eyebrow>
            <input
              className="input mono"
              style={{ fontSize: 22, letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: 8 }}
              value={key}
              onChange={e => setKey(e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 8))}
              placeholder="KEY"
              disabled={complete}
              autoFocus
            />
          </div>

          <div style={{ marginTop: 24 }}>
            <Eyebrow>DECODED</Eyebrow>
            <div className="mono" style={{
              marginTop: 8, padding: 20, background: 'var(--bg)',
              border: `1px solid ${complete ? 'var(--success)' : 'var(--border-strong)'}`,
              fontSize: 28, letterSpacing: '0.2em',
              color: complete ? 'var(--success)' : 'var(--accent)',
              minHeight: 70,
            }}>{decoded || '—'}</div>
          </div>

          <div style={{ marginTop: 32 }}>
            <Eyebrow>VIGENÈRE TABLEAU</Eyebrow>
            <div className="mono" style={{ fontSize: 10, marginTop: 12, lineHeight: 1.4, color: 'var(--text-dim)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(27, 1fr)', gap: 1 }}>
                <div></div>
                {A.split('').map(c => <div key={c} className="accent" style={{ textAlign: 'center' }}>{c}</div>)}
                {A.split('').slice(0, 8).map((row, r) => (
                  <React.Fragment key={r}>
                    <div className="violet" style={{ textAlign: 'center' }}>{row}</div>
                    {A.split('').map((_, c) => (
                      <div key={c} style={{ textAlign: 'center', opacity: 0.5 }}>{A[(r + c) % 26]}</div>
                    ))}
                  </React.Fragment>
                ))}
                <div className="faint" style={{ gridColumn: 'span 27', textAlign: 'center', marginTop: 4 }}>... (first 8 rows shown)</div>
              </div>
            </div>
          </div>
        </Card>
      </LevelShell>
    </>
  );
}

// -------- ENIGMA --------
function EnigmaLevel({ state, actions, level }) {
  // Simplified: 3 rotors, user sets starting positions 0-25, must match target to decode
  const [target] = useState(() => [
    Math.floor(Math.random() * 26),
    Math.floor(Math.random() * 26),
    Math.floor(Math.random() * 26),
  ]);
  const [rotors, setRotors] = useState([0, 0, 0]);
  const [complete, setComplete] = useState(false);
  const [time] = useTimer(!complete);
  const [showHint, setShowHint] = useState(false);

  const matching = rotors.every((r, i) => r === target[i]);
  useEffect(() => {
    if (matching && !complete) setComplete(true);
  }, [matching]);

  const stars = time < 60 ? 3 : time < 120 ? 2 : 1;

  const intercepted = 'XFGPZWMRKQHN';
  const decoded = matching ? 'REINFORCEMENTS AT DAWN' : '??????????????????????';

  return (
    <>
      <LevelShell
        state={state} actions={actions} level={level}
        success={complete ? { level, stars, time, xp: level.xp, answer: 'REINFORCEMENTS AT DAWN', onContinue: () => actions.completeLevel(level.id, { stars, time, xp: level.xp }) } : null}
        briefing="Enigma M3 intercept. Three rotors, reflector B, no plugboard."
        objective={`Dial the correct rotor start positions. Bletchley's cribs suggest: I-${target[0]}... wait, no — figure it out.`}
        hint={showHint ? `Try ${target[0]} / ${target[1]} / ${target[2]}` : null}
        onHint={() => { if (state.hintPoints > 0) { actions.useHint(); setShowHint(true); } }}
        rightPanel={<TimerPanel time={time} />}
      >
        <Card style={{ padding: 32 }}>
          <Eyebrow>ROTOR ASSEMBLY I · II · III</Eyebrow>
          <div className="flex center gap-6" style={{ marginTop: 24, marginBottom: 24 }}>
            {rotors.map((r, i) => (
              <EnigmaRotor key={i}
                value={r}
                label={['I', 'II', 'III'][i]}
                onChange={v => setRotors(rs => rs.map((x, j) => j === i ? v : x))}
                locked={complete}
                match={r === target[i]}
              />
            ))}
          </div>

          <div className="divider" style={{ margin: '24px 0' }}/>

          <Eyebrow>INTERCEPTED CIPHERTEXT</Eyebrow>
          <div className="mono" style={{
            marginTop: 12, padding: 20, background: 'var(--bg)',
            border: '1px solid var(--border-strong)',
            fontSize: 24, letterSpacing: '0.3em', color: 'var(--text-dim)',
          }}>{intercepted}</div>

          <div style={{ marginTop: 16 }}>
            <Eyebrow>DECODED OUTPUT</Eyebrow>
            <div className="mono" style={{
              marginTop: 8, padding: 20, background: 'var(--bg)',
              border: `1px solid ${complete ? 'var(--success)' : 'var(--border-strong)'}`,
              fontSize: 22, letterSpacing: '0.2em',
              color: complete ? 'var(--success)' : 'var(--text-faint)',
              textShadow: complete ? '0 0 12px currentColor' : 'none',
            }}>{decoded}</div>
          </div>
        </Card>
      </LevelShell>
    </>
  );
}

function EnigmaRotor({ value, onChange, label, locked, match }) {
  const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  return (
    <div className="col center">
      <div className="mono faint" style={{ fontSize: 11, letterSpacing: '0.2em', marginBottom: 8 }}>ROTOR {label}</div>
      <div style={{
        width: 110, height: 180,
        background: 'var(--bg)', border: `2px solid ${match ? 'var(--success)' : 'var(--border-strong)'}`,
        boxShadow: match ? '0 0 24px var(--success)' : 'inset 0 0 24px rgba(0,0,0,0.6)',
        position: 'relative', overflow: 'hidden',
        clipPath: 'polygon(12px 0, calc(100% - 12px) 0, 100% 12px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 12px 100%, 0 calc(100% - 12px), 0 12px)',
      }}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'transform 0.2s' }}>
          {[-2, -1, 0, 1, 2].map(off => {
            const v = (value + off + 26) % 26;
            return (
              <div key={off} className="mono" style={{
                fontSize: off === 0 ? 36 : 18,
                opacity: off === 0 ? 1 : 0.3 - Math.abs(off) * 0.05,
                color: off === 0 ? (match ? 'var(--success)' : 'var(--accent)') : 'var(--text-dim)',
                textShadow: off === 0 ? '0 0 12px currentColor' : 'none',
                transition: 'all 0.15s',
                fontWeight: 600,
              }}>{A[v]}</div>
            );
          })}
        </div>
      </div>
      <div className="flex gap-2" style={{ marginTop: 12 }}>
        <Btn sm onClick={() => !locked && onChange((value - 1 + 26) % 26)} disabled={locked}>▾</Btn>
        <Btn sm onClick={() => !locked && onChange((value + 1) % 26)} disabled={locked}>▴</Btn>
      </div>
      <div className="mono faint" style={{ fontSize: 10, marginTop: 6 }}>POS {String(value).padStart(2, '0')}</div>
    </div>
  );
}

Object.assign(window, { XorLevel, Base64Level, VigenereLevel, EnigmaLevel });
