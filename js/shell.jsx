// Boot / intro screen — first impression
function BootScreen({ state, actions }) {
  const [phase, setPhase] = useState(0);
  const [lines, setLines] = useState([]);

  useEffect(() => {
    const script = [
      { t: 200, line: '[ ∙ ] CIPHER.EXE v4.02.1 initializing...' },
      { t: 500, line: '[ ∙ ] Loading WASM crypto runtime ......... OK' },
      { t: 800, line: '[ ∙ ] Mounting skill-tree kernel ........... OK' },
      { t: 1100, line: '[ ∙ ] Verifying operative signature ........ OK' },
      { t: 1400, line: '[ ✓ ] Secure channel established.' },
      { t: 1800, line: '' },
      { t: 2000, line: 'Welcome back, operative.' },
    ];
    script.forEach(({ t, line }) => {
      setTimeout(() => setLines(l => [...l, line]), t);
    });
    setTimeout(() => setPhase(1), 2400);
  }, []);

  const hasProfile = state.profile.path;

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', padding: 40,
    }}>
      <GridBackdrop />
      <div style={{ maxWidth: 720, width: '100%', position: 'relative', zIndex: 1 }}>
        {phase === 0 && (
          <Card brackets style={{ padding: 40, minHeight: 320 }}>
            <div className="mono" style={{ fontSize: 13, lineHeight: 1.8 }}>
              {lines.map((l, i) => (
                <div key={i} style={{ color: l.startsWith('[ ✓') ? 'var(--success)' : 'var(--text-dim)' }}>
                  {l || '\u00A0'}
                </div>
              ))}
              <span className="cursor"/>
            </div>
          </Card>
        )}
        {phase === 1 && (
          <div className="col gap-6">
            <div>
              <Eyebrow>ETHICAL HACKING DIVISION / TRAINING OS</Eyebrow>
              <div className="h1" style={{ marginTop: 8 }}>
                Learn to <span className="accent glow-text">break</span> and
                <br/>
                <span className="accent glow-text">build</span> secrets.
              </div>
              <div className="dim" style={{ fontSize: 16, marginTop: 12, maxWidth: 520, textWrap: 'pretty' }}>
                A progressive cryptography game. Eleven classical and modern ciphers, across text, 2D, and 3D puzzles. Pick a path — no experience required.
              </div>
            </div>

            <Card elev brackets style={{ padding: 24 }}>
              <div className="flex between center" style={{ marginBottom: 16 }}>
                <Eyebrow>SELECT PATH</Eyebrow>
                <Chip kind="accent"><span className="dot"/> ONE TIME SETUP</Chip>
              </div>
              <div className="flex gap-3">
                {[
                  { id: 'beginner', name: 'BEGINNER', age: 'AGES 8+', desc: 'Start from zero. Visual hints. Generous timers.', color: 'var(--success)' },
                  { id: 'intermediate', name: 'INTERMEDIATE', age: 'AGES 13+', desc: 'Standard challenge curve. Math explained inline.', color: 'var(--accent)' },
                  { id: 'expert', name: 'EXPERT', age: 'AGES 16+', desc: 'No hand-holding. Real crypto concepts. Hardcore.', color: 'var(--violet)' },
                ].map(p => (
                  <button
                    key={p.id}
                    onClick={() => {
                      actions.setProfile({ path: p.id });
                      actions.goto(hasProfile ? 'hub' : 'profile');
                    }}
                    style={{
                      flex: 1, padding: 20, textAlign: 'left',
                      background: 'var(--surface)', border: '1px solid var(--border-strong)',
                      cursor: 'pointer', transition: 'all 0.15s',
                      clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)',
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = p.color}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-strong)'}
                  >
                    <div className="mono" style={{ fontSize: 11, color: p.color, letterSpacing: '0.15em' }}>{p.age}</div>
                    <div className="h3" style={{ marginTop: 6, marginBottom: 8 }}>{p.name}</div>
                    <div className="dim" style={{ fontSize: 13, lineHeight: 1.5 }}>{p.desc}</div>
                  </button>
                ))}
              </div>
            </Card>

            {hasProfile && (
              <div className="flex center gap-3 dim mono" style={{ fontSize: 12 }}>
                <span>Returning operative?</span>
                <Btn sm ghost onClick={() => actions.goto('hub')}>CONTINUE MISSION ▸</Btn>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ResetModal({ onCancel, onConfirm }) {
  const [confirmText, setConfirmText] = useState('');
  const canConfirm = confirmText.toUpperCase() === 'RESET';
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(7, 11, 20, 0.85)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999,
      backdropFilter: 'blur(6px)',
    }} onClick={onCancel}>
      <Card brackets style={{ padding: 32, maxWidth: 460, width: '90%', position: 'relative' }}
        onClick={e => e.stopPropagation()}>
        <div className="flex between center" style={{ marginBottom: 12 }}>
          <Eyebrow style={{ color: 'var(--danger)' }}>⚠ DESTRUCTIVE ACTION</Eyebrow>
          <Chip kind="danger"><span className="dot"/> IRREVERSIBLE</Chip>
        </div>
        <div className="h2 danger glow-text" style={{ marginBottom: 8 }}>Reset Progress?</div>
        <div className="dim" style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 20, textWrap: 'pretty' }}>
          This will wipe your profile, XP, badges, streak, and all cleared ciphers. Skill tree will return to tier 1. This cannot be undone.
        </div>

        <div style={{
          padding: 12, background: 'var(--bg)', border: '1px dashed var(--danger)',
          marginBottom: 20,
        }}>
          <div className="faint mono" style={{ fontSize: 10, letterSpacing: '0.2em', marginBottom: 8 }}>
            TYPE "RESET" TO CONFIRM
          </div>
          <input
            className="input mono"
            style={{ fontSize: 16, letterSpacing: '0.15em', textTransform: 'uppercase' }}
            value={confirmText}
            onChange={e => setConfirmText(e.target.value.toUpperCase())}
            placeholder="RESET"
            autoFocus
          />
        </div>

        <div className="flex gap-3">
          <Btn ghost onClick={onCancel} style={{ flex: 1 }}>CANCEL</Btn>
          <button
            className="btn"
            onClick={canConfirm ? onConfirm : undefined}
            disabled={!canConfirm}
            style={{
              flex: 1,
              background: canConfirm ? 'var(--danger-soft)' : 'transparent',
              borderColor: canConfirm ? 'var(--danger)' : 'var(--border-strong)',
              color: canConfirm ? 'var(--danger)' : 'var(--text-faint)',
            }}
          >
            WIPE PROGRESS ▸
          </button>
        </div>
      </Card>
    </div>
  );
}

function ProfileScreen({ state, actions }) {
  const [name, setName] = useState(state.profile.name);
  const [avatar, setAvatar] = useState(state.profile.avatar);
  const [resetOpen, setResetOpen] = useState(false);

  function save() {
    actions.setProfile({ name: name.toUpperCase().slice(0, 16), avatar });
    actions.goto('hub');
  }

  const level = Math.floor(state.xp / 500) + 1;
  const completedCount = Object.keys(state.completed).length;
  const badgeCount = state.badges.length;

  return (
    <div>
      <HeaderBar state={state} actions={actions} title="OPERATIVE PROFILE" />
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '40px 24px' }}>
        <Eyebrow>OPERATIVE DOSSIER</Eyebrow>
        <div className="h2" style={{ marginTop: 8, marginBottom: 32 }}>Configure your identity</div>

        <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 24 }}>
          <Card brackets style={{ padding: 32, textAlign: 'center' }}>
            <div className="dim mono" style={{ fontSize: 11, letterSpacing: '0.15em', marginBottom: 16 }}>
              ID-{String(Math.abs(state.profile.created % 9999)).padStart(4, '0')}
            </div>
            <div style={{ display: 'inline-block', padding: 8, background: 'var(--bg)', border: '1px solid var(--border-strong)' }}>
              <Avatar idx={avatar} size={120} />
            </div>
            <div className="h2" style={{ marginTop: 16, letterSpacing: '0.05em' }}>{name || '···'}</div>
            <div className="dim mono" style={{ fontSize: 12, marginTop: 4 }}>
              {state.profile.path?.toUpperCase()} · LVL {level}
            </div>

            <div className="divider" style={{ margin: '24px 0' }}/>

            <div className="flex between dim mono" style={{ fontSize: 12 }}>
              <span>BADGES</span><span className="accent">{badgeCount}</span>
            </div>
            <div className="flex between dim mono" style={{ fontSize: 12, marginTop: 8 }}>
              <span>LEVELS CLEARED</span><span className="accent">{completedCount}/11</span>
            </div>
            <div className="flex between dim mono" style={{ fontSize: 12, marginTop: 8 }}>
              <span>TOTAL XP</span><span className="accent">{state.xp}</span>
            </div>
          </Card>

          <div className="col gap-4">
            <Card style={{ padding: 24 }}>
              <Eyebrow>CALLSIGN</Eyebrow>
              <input
                className="input"
                style={{ marginTop: 12, fontSize: 18, letterSpacing: '0.08em', textTransform: 'uppercase' }}
                value={name}
                onChange={e => setName(e.target.value.toUpperCase().slice(0, 16))}
                maxLength={16}
              />
            </Card>

            <Card style={{ padding: 24 }}>
              <Eyebrow>AVATAR GLYPH</Eyebrow>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12, marginTop: 12 }}>
                {[0,1,2,3,4,5].map(i => (
                  <button
                    key={i}
                    onClick={() => setAvatar(i)}
                    style={{
                      aspectRatio: '1', background: avatar === i ? 'var(--accent-soft)' : 'var(--bg)',
                      border: `1px solid ${avatar === i ? 'var(--accent)' : 'var(--border-strong)'}`,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.15s',
                    }}
                  >
                    <Avatar idx={i} size={56} />
                  </button>
                ))}
              </div>
            </Card>

            <div className="flex gap-3">
              <Btn primary onClick={save}>SAVE PROFILE ▸</Btn>
              <Btn ghost onClick={() => actions.goto('hub')}>CANCEL</Btn>
              <div className="grow"/>
              <Btn ghost onClick={() => setResetOpen(true)}>RESET PROGRESS</Btn>
            </div>
          </div>
        </div>
      </div>
      {resetOpen && <ResetModal
        onCancel={() => setResetOpen(false)}
        onConfirm={() => { setResetOpen(false); actions.reset(); }}
      />}
    </div>
  );
}

window.BootScreen = BootScreen;
window.ProfileScreen = ProfileScreen;
