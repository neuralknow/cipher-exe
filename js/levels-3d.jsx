// ============ 3D LEVELS + HASH + RSA + SANDBOX + DAILY ============

// -------- CIPHER CUBE (3D Three.js) --------
function CubeLevel({ state, actions, level }) {
  const mountRef = useRef(null);
  const [targetFace, setTargetFace] = useState(() => Math.floor(Math.random() * 6));
  const [currentFace, setCurrentFace] = useState(0);
  const [complete, setComplete] = useState(false);
  const [time] = useTimer(!complete);
  const [showHint, setShowHint] = useState(false);
  const rotRef = useRef({ x: 0, y: 0, tx: 0, ty: 0 });

  const FACE_LETTERS = ['A', 'L', 'E', 'R', 'T', 'S']; // the solved face forms a word when you align them in sequence
  const PLAIN = FACE_LETTERS.join('');
  const [solved, setSolved] = useState([]);

  useEffect(() => {
    if (!window.THREE) return;
    const THREE = window.THREE;
    const mount = mountRef.current;
    const W = mount.clientWidth, H = 420;

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x070B14, 6, 14);

    const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 100);
    camera.position.set(0, 0, 5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(window.devicePixelRatio);
    mount.appendChild(renderer.domElement);

    // Cube with per-face letters drawn to canvas textures
    function makeFaceTexture(letter, glow = false) {
      const c = document.createElement('canvas');
      c.width = c.height = 256;
      const g = c.getContext('2d');
      g.fillStyle = '#0E1524';
      g.fillRect(0, 0, 256, 256);
      // border
      g.strokeStyle = glow ? '#4FC3F7' : '#2A3A5C';
      g.lineWidth = 4;
      g.strokeRect(6, 6, 244, 244);
      // grid
      g.strokeStyle = '#1E2A44';
      g.lineWidth = 1;
      for (let i = 20; i < 256; i += 20) {
        g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 256); g.stroke();
        g.beginPath(); g.moveTo(0, i); g.lineTo(256, i); g.stroke();
      }
      // letter
      g.fillStyle = glow ? '#4FC3F7' : '#E6EEFF';
      g.shadowColor = glow ? '#4FC3F7' : 'transparent';
      g.shadowBlur = glow ? 24 : 0;
      g.font = 'bold 140px "JetBrains Mono", monospace';
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillText(letter, 128, 132);
      // corner marks
      g.shadowBlur = 0;
      g.fillStyle = glow ? '#4FC3F7' : '#55648A';
      g.font = '14px "JetBrains Mono", monospace';
      g.fillText('◤ FACE', 40, 28);
      return new THREE.CanvasTexture(c);
    }

    const materials = FACE_LETTERS.map((l, i) =>
      new THREE.MeshStandardMaterial({ map: makeFaceTexture(l, i === targetFace) })
    );
    const geo = new THREE.BoxGeometry(2, 2, 2);
    const cube = new THREE.Mesh(geo, materials);
    scene.add(cube);

    // Wireframe overlay
    const edges = new THREE.EdgesGeometry(geo);
    const wire = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x4FC3F7, transparent: true, opacity: 0.4 }));
    cube.add(wire);

    // Lights
    scene.add(new THREE.AmbientLight(0x4FC3F7, 0.3));
    const dir = new THREE.DirectionalLight(0x7E57C2, 0.8);
    dir.position.set(3, 4, 5);
    scene.add(dir);
    const rim = new THREE.DirectionalLight(0x4FC3F7, 0.6);
    rim.position.set(-4, -2, -3);
    scene.add(rim);

    // Grid floor
    const grid = new THREE.GridHelper(20, 20, 0x1E2A44, 0x1E2A44);
    grid.position.y = -2;
    scene.add(grid);

    // Drag-to-rotate
    let dragging = false, sx = 0, sy = 0;
    const onDown = (e) => { dragging = true; sx = e.clientX; sy = e.clientY; };
    const onMove = (e) => {
      if (!dragging) return;
      const dx = e.clientX - sx, dy = e.clientY - sy;
      rotRef.current.ty += dx * 0.01;
      rotRef.current.tx += dy * 0.01;
      sx = e.clientX; sy = e.clientY;
    };
    const onUp = () => { dragging = false; };
    renderer.domElement.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);

    // Face detection: which face is pointing toward camera
    const faceNormals = [
      new THREE.Vector3(1, 0, 0),   // +X
      new THREE.Vector3(-1, 0, 0),  // -X
      new THREE.Vector3(0, 1, 0),   // +Y
      new THREE.Vector3(0, -1, 0),  // -Y
      new THREE.Vector3(0, 0, 1),   // +Z
      new THREE.Vector3(0, 0, -1),  // -Z
    ];

    let rafId;
    const loop = () => {
      rotRef.current.x += (rotRef.current.tx - rotRef.current.x) * 0.15;
      rotRef.current.y += (rotRef.current.ty - rotRef.current.y) * 0.15;
      cube.rotation.x = rotRef.current.x;
      cube.rotation.y = rotRef.current.y;

      // Determine which face is facing camera
      const camDir = new THREE.Vector3(0, 0, 1);
      let best = 0, bestDot = -1;
      faceNormals.forEach((n, i) => {
        const world = n.clone().applyQuaternion(cube.quaternion);
        const d = world.dot(camDir);
        if (d > bestDot) { bestDot = d; best = i; }
      });
      setCurrentFace(best);

      renderer.render(scene, camera);
      rafId = requestAnimationFrame(loop);
    };
    loop();

    const onResize = () => {
      const w = mount.clientWidth;
      renderer.setSize(w, H);
      camera.aspect = w / H;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, [targetFace]);

  // When user shows the target face, capture it
  useEffect(() => {
    if (currentFace === targetFace && !solved.includes(FACE_LETTERS[currentFace])) {
      const next = [...solved, FACE_LETTERS[currentFace]];
      setSolved(next);
      if (next.length >= 4) {
        setComplete(true);
      } else {
        // pick a new target
        const remaining = FACE_LETTERS.map((_, i) => i).filter(i => !next.includes(FACE_LETTERS[i]));
        setTimeout(() => setTargetFace(remaining[Math.floor(Math.random() * remaining.length)]), 600);
      }
    }
  }, [currentFace]);

  const stars = time < 40 ? 3 : time < 90 ? 2 : 1;

  return (
    <>
      <LevelShell
        state={state} actions={actions} level={level}
        success={complete ? { level, stars, time, xp: level.xp, answer: FACE_LETTERS.join(""), onContinue: () => actions.completeLevel(level.id, { stars, time, xp: level.xp }) } : null}
        briefing="Six-faced substitution cube. Each face is a letter of the plaintext."
        objective={`Rotate the cube to align face "${FACE_LETTERS[targetFace]}" toward the camera. Capture 4 faces.`}
        hint={showHint ? `Currently showing: ${FACE_LETTERS[currentFace]}. Keep rotating.` : null}
        onHint={() => { if (state.hintPoints > 0) { actions.useHint(); setShowHint(true); } }}
        rightPanel={<TimerPanel time={time} />}
      >
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Eyebrow>3D SUBSTITUTION CUBE · DRAG TO ROTATE</Eyebrow>
            <div className="flex gap-2">
              {FACE_LETTERS.map(l => (
                <div key={l} style={{
                  width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: solved.includes(l) ? 'var(--success-soft)' : 'var(--bg)',
                  border: `1px solid ${solved.includes(l) ? 'var(--success)' : 'var(--border-strong)'}`,
                  color: solved.includes(l) ? 'var(--success)' : 'var(--text-dim)',
                  fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600,
                }}>{l}</div>
              ))}
            </div>
          </div>
          <div ref={mountRef} style={{ width: '100%', height: 420, background: 'radial-gradient(ellipse at center, var(--elevated), var(--bg))' }}/>
          <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <div className="faint mono" style={{ fontSize: 10, letterSpacing: '0.2em' }}>TARGET FACE</div>
              <div className="accent mono" style={{ fontSize: 28, fontWeight: 700 }}>{FACE_LETTERS[targetFace]}</div>
            </div>
            <div>
              <div className="faint mono" style={{ fontSize: 10, letterSpacing: '0.2em' }}>CURRENT</div>
              <div className={currentFace === targetFace ? 'success' : 'dim'} style={{ fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 700 }}>{FACE_LETTERS[currentFace]}</div>
            </div>
            <div style={{ flex: 1 }}/>
            <div>
              <div className="faint mono" style={{ fontSize: 10, letterSpacing: '0.2em' }}>CAPTURED</div>
              <div className="mono" style={{ fontSize: 20, letterSpacing: '0.2em' }}>
                <span className="accent">{solved.join('')}</span>
                <span className="faint">{PLAIN.slice(solved.length)}</span>
              </div>
            </div>
          </div>
        </Card>
      </LevelShell>
    </>
  );
}

// -------- KEY EXCHANGE (3D scene) --------
function KeyExchangeLevel({ state, actions, level }) {
  const mountRef = useRef(null);
  const [aliceSecret, setAliceSecret] = useState(null);
  const [bobSecret, setBobSecret] = useState(null);
  const [eveSent, setEveSent] = useState(false);
  const [complete, setComplete] = useState(false);
  const [time] = useTimer(!complete);
  const [showHint, setShowHint] = useState(false);

  // Diffie-Hellman simplified with small primes: g=5, p=23
  const G = 5, P = 23;
  // Secret values for alice/bob (random 1-10)
  const [aliceP] = useState(() => 4 + Math.floor(Math.random() * 6));
  const [bobP] = useState(() => 3 + Math.floor(Math.random() * 6));
  const aliceA = Math.pow(G, aliceP) % P;
  const bobB = Math.pow(G, bobP) % P;
  const sharedFromAlice = Math.pow(bobB, aliceP) % P;
  const sharedFromBob = Math.pow(aliceA, bobP) % P;

  const refs = useRef({});

  useEffect(() => {
    if (!window.THREE) return;
    const THREE = window.THREE;
    const mount = mountRef.current;
    const W = mount.clientWidth, H = 420;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 100);
    camera.position.set(0, 3, 9);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(window.devicePixelRatio);
    mount.appendChild(renderer.domElement);

    // Alice (left, cyan sphere)
    const alice = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.8, 1),
      new THREE.MeshStandardMaterial({ color: 0x4FC3F7, emissive: 0x1a4a6e, wireframe: false, flatShading: true })
    );
    alice.position.set(-4, 0, 0);
    scene.add(alice);

    // Bob (right, violet sphere)
    const bob = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.8, 1),
      new THREE.MeshStandardMaterial({ color: 0x7E57C2, emissive: 0x2a1b5c, flatShading: true })
    );
    bob.position.set(4, 0, 0);
    scene.add(bob);

    // Eve (bottom, red observer)
    const eve = new THREE.Mesh(
      new THREE.TetrahedronGeometry(0.5),
      new THREE.MeshStandardMaterial({ color: 0xe57373, emissive: 0x4a1a1a, flatShading: true })
    );
    eve.position.set(0, -2.2, 0);
    scene.add(eve);

    // Lines between them (public channel)
    const channelMat = new THREE.LineDashedMaterial({ color: 0x4FC3F7, dashSize: 0.2, gapSize: 0.15, transparent: true, opacity: 0.4 });
    const channelGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-4, 0, 0), new THREE.Vector3(4, 0, 0),
    ]);
    const channel = new THREE.Line(channelGeo, channelMat);
    channel.computeLineDistances();
    scene.add(channel);

    // Grid floor
    const grid = new THREE.GridHelper(20, 20, 0x1E2A44, 0x1E2A44);
    grid.position.y = -2.8;
    scene.add(grid);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const dl = new THREE.DirectionalLight(0xffffff, 0.7);
    dl.position.set(2, 5, 3);
    scene.add(dl);

    // Labels: HTML overlay (simpler than sprites)
    refs.current = { alice, bob, eve, scene, camera, renderer, THREE };

    let rafId;
    let t = 0;
    const loop = () => {
      t += 0.01;
      alice.rotation.y = t;
      alice.rotation.x = t * 0.5;
      bob.rotation.y = -t;
      bob.rotation.x = t * 0.3;
      eve.rotation.y = t * 2;

      // gentle camera orbit
      camera.position.x = Math.sin(t * 0.2) * 0.4;
      camera.lookAt(0, 0, 0);

      // animate any in-flight packets
      if (refs.current.packets) {
        refs.current.packets = refs.current.packets.filter(p => {
          p.progress += 0.02;
          p.mesh.position.lerpVectors(p.from, p.to, p.progress);
          p.mesh.rotation.y += 0.1;
          if (p.progress >= 1) {
            scene.remove(p.mesh);
            p.onArrive?.();
            return false;
          }
          return true;
        });
      }

      renderer.render(scene, camera);
      rafId = requestAnimationFrame(loop);
    };
    loop();

    const onResize = () => {
      const w = mount.clientWidth;
      renderer.setSize(w, H);
      camera.aspect = w / H;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  function sendPacket(fromName, color, onArrive) {
    const THREE = window.THREE;
    const { alice, bob, scene } = refs.current;
    if (!THREE || !alice) return;
    const from = fromName === 'alice' ? alice.position.clone() : bob.position.clone();
    const to = fromName === 'alice' ? bob.position.clone() : alice.position.clone();
    const mesh = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.22),
      new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.5 })
    );
    mesh.position.copy(from);
    scene.add(mesh);
    refs.current.packets = refs.current.packets || [];
    refs.current.packets.push({ mesh, from, to, progress: 0, onArrive });
  }

  function aliceSend() {
    sendPacket('alice', 0x4FC3F7, () => setAliceSecret(aliceA));
  }
  function bobSend() {
    sendPacket('bob', 0x7E57C2, () => setBobSecret(bobB));
  }
  function mix() {
    if (aliceSecret && bobSecret) {
      setComplete(true);
    }
  }

  const stars = time < 60 ? 3 : time < 120 ? 2 : 1;

  return (
    <>
      <LevelShell
        state={state} actions={actions} level={level}
        success={complete ? { level, stars, time, xp: level.xp, answer: `SHARED KEY = ${sharedFromAlice}`, onContinue: () => actions.completeLevel(level.id, { stars, time, xp: level.xp }) } : null}
        briefing="Alice and Bob must agree on a shared secret. Eve is watching everything."
        objective={`Exchange public values A and B. Each party combines them with their own private key. Same secret — never transmitted.`}
        hint={showHint ? `Public g=${G}, p=${P}. Alice sends A=${aliceA}. Bob sends B=${bobB}. Both compute ${sharedFromAlice}.` : null}
        onHint={() => { if (state.hintPoints > 0) { actions.useHint(); setShowHint(true); } }}
        rightPanel={<TimerPanel time={time} />}
      >
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
            <Eyebrow>DIFFIE–HELLMAN KEY EXCHANGE · PUBLIC CHANNEL</Eyebrow>
            <div className="mono dim" style={{ fontSize: 11 }}>g={G} · p={P}</div>
          </div>
          <div ref={mountRef} style={{ width: '100%', height: 420, background: 'radial-gradient(ellipse at center, var(--elevated), var(--bg))' }}/>
          <div style={{ padding: 20, borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
              <PartyPanel name="ALICE" color="var(--accent)" priv={aliceP} pub={aliceA} sent={!!aliceSecret} />
              <div style={{
                padding: 16, background: 'var(--bg)', border: '1px dashed var(--danger)',
                textAlign: 'center',
              }}>
                <div className="mono" style={{ color: 'var(--danger)', fontSize: 11, letterSpacing: '0.2em' }}>EVE — EAVESDROPPER</div>
                <div className="mono dim" style={{ fontSize: 12, marginTop: 8 }}>sees: {aliceSecret ? `A=${aliceA}` : '—'} {bobSecret ? `B=${bobB}` : ''}</div>
                <div className="mono" style={{ color: 'var(--danger)', fontSize: 12, marginTop: 6 }}>
                  CANNOT COMPUTE: s = {aliceSecret && bobSecret ? '?' : '—'}
                </div>
              </div>
              <PartyPanel name="BOB" color="var(--violet)" priv={bobP} pub={bobB} sent={!!bobSecret} />
            </div>
            <div className="flex gap-3 center">
              <Btn onClick={aliceSend} disabled={!!aliceSecret}>◂ ALICE TRANSMITS A</Btn>
              <Btn onClick={bobSend} disabled={!!bobSecret}>BOB TRANSMITS B ▸</Btn>
              <Btn primary onClick={mix} disabled={!aliceSecret || !bobSecret || complete}>
                COMPUTE SHARED KEY = {sharedFromAlice}
              </Btn>
            </div>
          </div>
        </Card>
      </LevelShell>
    </>
  );
}

function PartyPanel({ name, color, priv, pub, sent }) {
  return (
    <div style={{ padding: 16, background: 'var(--bg)', border: `1px solid ${color}` }}>
      <div className="mono" style={{ color, fontSize: 11, letterSpacing: '0.2em' }}>{name}</div>
      <div className="mono dim" style={{ fontSize: 12, marginTop: 8 }}>private a = <span style={{ color }}>{priv}</span></div>
      <div className="mono dim" style={{ fontSize: 12 }}>public  A = g^a mod p = <span style={{ color }}>{pub}</span></div>
      <div className="mono" style={{ fontSize: 11, marginTop: 6, color: sent ? 'var(--success)' : 'var(--text-faint)' }}>
        {sent ? '● TRANSMITTED' : '○ PENDING'}
      </div>
    </div>
  );
}

// -------- HASH TOWER (3D) --------
function HashLevel({ state, actions, level }) {
  const mountRef = useRef(null);
  const [attempts, setAttempts] = useState(0);
  const [hash, setHash] = useState('');
  const [input, setInput] = useState('');
  const [complete, setComplete] = useState(false);
  const [time] = useTimer(!complete);
  const [showHint, setShowHint] = useState(false);
  const towerRef = useRef([]);
  const sceneRef = useRef(null);

  const TARGET_PREFIX = '00'; // find input whose hash starts with this (fake simple hash)

  // Fake hash — deterministic but looks hex
  function fakeHash(s) {
    let h = 0x811c9dc5;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = (h * 0x01000193) >>> 0;
    }
    return h.toString(16).padStart(8, '0') +
           ((h ^ 0xa1b2c3d4) >>> 0).toString(16).padStart(8, '0');
  }

  useEffect(() => {
    if (!window.THREE) return;
    const THREE = window.THREE;
    const mount = mountRef.current;
    const W = mount.clientWidth, H = 420;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 100);
    camera.position.set(0, 4, 10);
    camera.lookAt(0, 2, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(window.devicePixelRatio);
    mount.appendChild(renderer.domElement);

    // Base platform
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(3, 3, 0.3, 6),
      new THREE.MeshStandardMaterial({ color: 0x151F33, emissive: 0x0a1120 })
    );
    base.position.y = -0.5;
    scene.add(base);

    // Grid
    const grid = new THREE.GridHelper(20, 20, 0x1E2A44, 0x1E2A44);
    grid.position.y = -0.6;
    scene.add(grid);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.3));
    const dl = new THREE.DirectionalLight(0x4FC3F7, 0.8);
    dl.position.set(3, 8, 4);
    scene.add(dl);
    const rim = new THREE.DirectionalLight(0x7E57C2, 0.5);
    rim.position.set(-3, 3, -4);
    scene.add(rim);

    sceneRef.current = { scene, camera, renderer, THREE };

    let rafId;
    let t = 0;
    const loop = () => {
      t += 0.005;
      camera.position.x = Math.sin(t) * 2;
      camera.position.z = 10 + Math.cos(t) * 1;
      camera.lookAt(0, 1.5, 0);
      towerRef.current.forEach((m, i) => {
        m.rotation.y += 0.005;
      });
      renderer.render(scene, camera);
      rafId = requestAnimationFrame(loop);
    };
    loop();

    const onResize = () => {
      const w = mount.clientWidth;
      renderer.setSize(w, H);
      camera.aspect = w / H;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  function stackBlock(good) {
    if (!sceneRef.current) return;
    const { scene, THREE } = sceneRef.current;
    const idx = towerRef.current.length;
    const color = good ? 0x81c784 : 0xe57373;
    const block = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 0.45, 1.4),
      new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.15 })
    );
    block.position.set(
      (Math.random() - 0.5) * 0.2,
      -0.3 + idx * 0.46 + 0.3,
      (Math.random() - 0.5) * 0.2
    );
    block.rotation.y = Math.random() * 0.2 - 0.1;
    scene.add(block);
    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(block.geometry),
      new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 })
    );
    block.add(edges);
    towerRef.current.push(block);
  }

  function tryInput() {
    if (!input) return;
    const h = fakeHash(input);
    setHash(h);
    setAttempts(a => a + 1);
    const good = h.startsWith(TARGET_PREFIX);
    stackBlock(good);
    if (good) setComplete(true);
    setInput('');
  }

  const stars = attempts < 20 ? 3 : attempts < 50 ? 2 : 1;

  return (
    <>
      <LevelShell
        state={state} actions={actions} level={level}
        success={complete ? { level, stars, time, xp: level.xp, answer: hash, onContinue: () => actions.completeLevel(level.id, { stars, time, xp: level.xp }) } : null}
        briefing="Mining a proof-of-work block. Find an input whose hash begins with '00'."
        objective="Each try stacks a block. Red = rejected, green = match. Lower attempts = more stars."
        hint={showHint ? `Try short numeric strings: "42", "100", "9".` : null}
        onHint={() => { if (state.hintPoints > 0) { actions.useHint(); setShowHint(true); } }}
        rightPanel={<>
          <TimerPanel time={time} />
          <Card style={{ padding: 20 }}>
            <Eyebrow>ATTEMPTS</Eyebrow>
            <div className="mono accent" style={{ fontSize: 36, fontWeight: 600 }}>{attempts}</div>
            <div className="faint mono" style={{ fontSize: 11 }}>less is better</div>
          </Card>
        </>}
      >
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <div ref={mountRef} style={{ width: '100%', height: 420, background: 'radial-gradient(ellipse at center, var(--elevated), var(--bg))' }}/>
          <div style={{ padding: 20, borderTop: '1px solid var(--border)' }}>
            <Eyebrow>NONCE INPUT</Eyebrow>
            <div className="flex gap-3" style={{ marginTop: 8 }}>
              <input
                className="input mono"
                style={{ fontSize: 18 }}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && tryInput()}
                placeholder="any string — try numbers"
                disabled={complete}
              />
              <Btn primary onClick={tryInput} disabled={complete || !input}>HASH ▸</Btn>
            </div>
            <div style={{ marginTop: 16, padding: 12, background: 'var(--bg)', border: '1px solid var(--border)' }}>
              <div className="faint mono" style={{ fontSize: 10, letterSpacing: '0.2em' }}>OUTPUT DIGEST</div>
              <div className="mono" style={{
                fontSize: 14, letterSpacing: '0.1em', marginTop: 4, wordBreak: 'break-all',
                color: hash.startsWith(TARGET_PREFIX) ? 'var(--success)' : 'var(--accent)',
              }}>
                <span style={{
                  color: hash.startsWith(TARGET_PREFIX) ? 'var(--success)' : 'var(--danger)',
                  background: hash.startsWith(TARGET_PREFIX) ? 'var(--success-soft)' : 'var(--danger-soft)',
                  padding: '2px 4px',
                }}>{hash.slice(0, 2)}</span>
                <span className="dim">{hash.slice(2) || '—'}</span>
              </div>
              <div className="faint mono" style={{ fontSize: 10, marginTop: 6 }}>
                target: begins with <span className="accent">{TARGET_PREFIX}</span>
              </div>
            </div>
          </div>
        </Card>
      </LevelShell>
    </>
  );
}

// -------- RSA (text, conceptual) --------
function RsaLevel({ state, actions, level }) {
  // Small primes for demo
  const p = 11, q = 13;
  const n = p * q; // 143
  const phi = (p - 1) * (q - 1); // 120
  const e = 7;
  // d such that e*d ≡ 1 mod phi. 7*103 = 721 = 6*120 + 1. d = 103.
  const d = 103;

  const message = 9;
  const cipher = Math.pow(message, e) % n; // 9^7 mod 143

  const [dInput, setDInput] = useState('');
  const [decoded, setDecoded] = useState(null);
  const [complete, setComplete] = useState(false);
  const [time] = useTimer(!complete);
  const [showHint, setShowHint] = useState(false);

  function tryDecode() {
    const dNum = parseInt(dInput);
    if (!dNum) return;
    // BigInt for safety
    let result = 1n;
    const base = BigInt(cipher);
    const mod = BigInt(n);
    for (let i = 0; i < dNum; i++) result = (result * base) % mod;
    const r = Number(result);
    setDecoded(r);
    if (r === message) setComplete(true);
  }

  const stars = time < 60 ? 3 : time < 120 ? 2 : 1;

  return (
    <>
      <LevelShell
        state={state} actions={actions} level={level}
        success={complete ? { level, stars, time, xp: level.xp, answer: `m = ${message}  (d = ${d})`, onContinue: () => actions.completeLevel(level.id, { stars, time, xp: level.xp }) } : null}
        briefing="You intercepted an RSA ciphertext. Public key (e, n) is known. Private key d is not."
        objective="Find d such that e · d ≡ 1 (mod φ(n)). Then decrypt: m = c^d mod n."
        hint={showHint ? `φ(n) = (p-1)(q-1) = ${phi}. Solve 7·d ≡ 1 mod 120.  Answer: d = ${d}.` : null}
        onHint={() => { if (state.hintPoints > 0) { actions.useHint(); setShowHint(true); } }}
        rightPanel={<TimerPanel time={time} />}
      >
        <Card style={{ padding: 32 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
            <div>
              <Eyebrow>PUBLIC KEY</Eyebrow>
              <div style={{ padding: 16, background: 'var(--bg)', border: '1px solid var(--accent)', marginTop: 8 }}>
                <MathRow label="e" value={e} />
                <MathRow label="n" value={`${n} (= ${p} × ${q})`} />
              </div>
              <Eyebrow style={{ marginTop: 20 }}>CIPHERTEXT</Eyebrow>
              <div style={{ padding: 16, background: 'var(--bg)', border: '1px solid var(--border-strong)', marginTop: 8 }}>
                <MathRow label="c" value={cipher} />
                <div className="mono faint" style={{ fontSize: 11, marginTop: 6 }}>(originally m = {message}, encrypted as m^e mod n)</div>
              </div>
            </div>
            <div>
              <Eyebrow>PRIVATE KEY (SOLVE)</Eyebrow>
              <div style={{ padding: 16, background: 'var(--bg)', border: '1px solid var(--violet)', marginTop: 8 }}>
                <MathRow label="φ(n)" value={`? — derive`} hint={`(p-1)(q-1) = ${phi}`} />
                <div className="flex center gap-3" style={{ marginTop: 12 }}>
                  <span className="mono violet" style={{ fontSize: 18 }}>d =</span>
                  <input
                    className="input mono"
                    style={{ fontSize: 18, maxWidth: 140 }}
                    value={dInput}
                    onChange={e => setDInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="?"
                    disabled={complete}
                  />
                </div>
                <div className="mono faint" style={{ fontSize: 11, marginTop: 6 }}>must satisfy e·d ≡ 1 mod φ(n)</div>
              </div>

              <div style={{ marginTop: 20 }}>
                <Btn primary onClick={tryDecode} disabled={complete || !dInput}>DECRYPT c^d mod n ▸</Btn>
              </div>

              {decoded !== null && (
                <div style={{
                  marginTop: 16, padding: 16,
                  background: decoded === message ? 'var(--success-soft)' : 'var(--danger-soft)',
                  border: `1px solid ${decoded === message ? 'var(--success)' : 'var(--danger)'}`,
                }}>
                  <div className="mono" style={{ fontSize: 11, letterSpacing: '0.15em',
                    color: decoded === message ? 'var(--success)' : 'var(--danger)' }}>
                    {decoded === message ? '● DECRYPTED — ORIGINAL MESSAGE RECOVERED' : '● INCORRECT d'}
                  </div>
                  <div className="mono" style={{ fontSize: 22, marginTop: 8, color: decoded === message ? 'var(--success)' : 'var(--text)' }}>
                    m = {decoded}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      </LevelShell>
    </>
  );
}

function MathRow({ label, value, hint }) {
  return (
    <div className="flex between center" style={{ padding: '6px 0' }}>
      <span className="mono dim" style={{ fontSize: 14 }}>{label}</span>
      <span className="mono accent" style={{ fontSize: 18 }}>{value}</span>
    </div>
  );
}

// -------- SANDBOX --------
function SandboxScreen({ state, actions }) {
  const [mode, setMode] = useState('caesar');
  const [plain, setPlain] = useState('MEET AT MIDNIGHT');
  const [shift, setShift] = useState(3);
  const [key, setKey] = useState('LEMON');

  const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let cipher = '';
  if (mode === 'caesar') {
    cipher = plain.toUpperCase().split('').map(c => {
      const i = A.indexOf(c);
      return i === -1 ? c : A[(i + shift) % 26];
    }).join('');
  } else if (mode === 'binary') {
    cipher = plain.toUpperCase().split('').map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');
  } else if (mode === 'base64') {
    try { cipher = btoa(plain); } catch (e) { cipher = 'ERR'; }
  } else if (mode === 'vigenere') {
    const k = key.toUpperCase().replace(/[^A-Z]/g, '') || 'A';
    let ki = 0;
    cipher = plain.toUpperCase().split('').map(c => {
      const ci = A.indexOf(c);
      if (ci === -1) return c;
      const r = A[(ci + A.indexOf(k[ki % k.length])) % 26];
      ki++;
      return r;
    }).join('');
  } else if (mode === 'morse') {
    cipher = plain.toUpperCase().split('').map(c => MORSE[c] || c).join(' ');
  }

  const modes = [
    { id: 'caesar', label: 'CAESAR' },
    { id: 'binary', label: 'BINARY' },
    { id: 'base64', label: 'BASE64' },
    { id: 'vigenere', label: 'VIGENÈRE' },
    { id: 'morse', label: 'MORSE' },
  ];

  const shareLink = `cipher://msg?m=${mode}&c=${encodeURIComponent(cipher).slice(0, 40)}`;

  return (
    <div>
      <HeaderBar state={state} actions={actions} showBack title="SANDBOX" />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>
        <Eyebrow>ENCRYPT YOUR OWN MESSAGE</Eyebrow>
        <div className="h1" style={{ marginTop: 6, marginBottom: 32 }}>The Sandbox</div>

        <Card brackets style={{ padding: 32 }}>
          <div className="flex gap-2" style={{ marginBottom: 24, flexWrap: 'wrap' }}>
            {modes.map(m => (
              <button key={m.id}
                onClick={() => setMode(m.id)}
                style={{
                  padding: '8px 16px',
                  background: mode === m.id ? 'var(--accent-soft)' : 'transparent',
                  border: `1px solid ${mode === m.id ? 'var(--accent)' : 'var(--border-strong)'}`,
                  color: mode === m.id ? 'var(--accent)' : 'var(--text-dim)',
                  fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.15em',
                  cursor: 'pointer',
                  clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)',
                }}>{m.label}</button>
            ))}
          </div>

          <Eyebrow>PLAINTEXT</Eyebrow>
          <textarea
            className="input mono"
            style={{ marginTop: 8, minHeight: 100, fontSize: 18, letterSpacing: '0.1em', resize: 'vertical' }}
            value={plain}
            onChange={e => setPlain(e.target.value.toUpperCase().slice(0, 120))}
          />

          {mode === 'caesar' && (
            <div style={{ marginTop: 16 }}>
              <div className="flex between">
                <Eyebrow>SHIFT</Eyebrow>
                <span className="mono accent">{shift}</span>
              </div>
              <input type="range" min="0" max="25" value={shift}
                     onChange={e => setShift(+e.target.value)}
                     style={{ width: '100%', accentColor: 'var(--accent)' }}/>
            </div>
          )}

          {mode === 'vigenere' && (
            <div style={{ marginTop: 16 }}>
              <Eyebrow>KEYWORD</Eyebrow>
              <input className="input mono"
                style={{ marginTop: 8, letterSpacing: '0.2em', textTransform: 'uppercase' }}
                value={key} onChange={e => setKey(e.target.value.toUpperCase().slice(0, 16))}/>
            </div>
          )}

          <div className="divider" style={{ margin: '24px 0' }}/>

          <div className="flex between">
            <Eyebrow>CIPHERTEXT</Eyebrow>
            <Btn sm onClick={() => navigator.clipboard?.writeText(cipher)}>COPY</Btn>
          </div>
          <div className="mono" style={{
            marginTop: 8, padding: 20, background: 'var(--bg)',
            border: '1px solid var(--accent)',
            fontSize: 18, lineHeight: 1.6, wordBreak: 'break-all',
            color: 'var(--accent)', minHeight: 80,
          }}>{cipher || '—'}</div>

          <div style={{ marginTop: 16, padding: 12, background: 'var(--bg)', border: '1px dashed var(--border-strong)' }}>
            <div className="faint mono" style={{ fontSize: 10, letterSpacing: '0.2em' }}>SHARE LINK (COSMETIC)</div>
            <div className="mono violet" style={{ fontSize: 12, marginTop: 4, wordBreak: 'break-all' }}>{shareLink}</div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// -------- DAILY CHALLENGE --------
function DailyScreen({ state, actions }) {
  // Deterministic daily puzzle
  const today = new Date().toDateString();
  const seed = [...today].reduce((a, c) => a + c.charCodeAt(0), 0);
  const shift = 1 + (seed % 25);
  const msgs = ['DAILY INTEL', 'SECURE LINE', 'KEEP GOING', 'STAY SHARP', 'TRUST NONE'];
  const plain = msgs[seed % msgs.length];
  const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const cipher = plain.split('').map(c => {
    const i = A.indexOf(c);
    return i === -1 ? c : A[(i + shift) % 26];
  }).join('');

  const [input, setInput] = useState('');
  const [complete, setComplete] = useState(false);

  function submit() {
    if (input.toUpperCase().trim() === plain) setComplete(true);
  }

  return (
    <div>
      <HeaderBar state={state} actions={actions} showBack title="DAILY" />
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>
        <Eyebrow>DAILY CHALLENGE · {today.toUpperCase()}</Eyebrow>
        <div className="h1" style={{ marginTop: 6, marginBottom: 8 }}>The Daily Cipher</div>
        <div className="dim" style={{ marginBottom: 32 }}>
          A fresh Caesar puzzle each day. Solve it to maintain your streak.
        </div>

        <Card brackets style={{ padding: 32 }}>
          <Eyebrow>INTERCEPT</Eyebrow>
          <div className="mono" style={{
            marginTop: 12, padding: 24, background: 'var(--bg)',
            border: '1px solid var(--border-strong)',
            fontSize: 32, letterSpacing: '0.3em', textAlign: 'center',
            color: 'var(--accent)',
          }}>{cipher}</div>

          <div style={{ marginTop: 24 }}>
            <Eyebrow>PLAINTEXT</Eyebrow>
            <div className="flex gap-3" style={{ marginTop: 8 }}>
              <input
                className="input mono"
                style={{ fontSize: 20, letterSpacing: '0.15em', textTransform: 'uppercase' }}
                value={input}
                onChange={e => setInput(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && submit()}
                placeholder="DECODE"
                disabled={complete}
                autoFocus
              />
              <Btn primary onClick={submit} disabled={complete}>SUBMIT ▸</Btn>
            </div>
          </div>

          {complete && (
            <div style={{
              marginTop: 24, padding: 20,
              background: 'var(--success-soft)', border: '1px solid var(--success)',
              textAlign: 'center',
            }}>
              <div className="success mono" style={{ fontSize: 12, letterSpacing: '0.2em' }}>● DAILY COMPLETE</div>
              <div className="h3 success glow-text" style={{ marginTop: 8 }}>STREAK MAINTAINED</div>
              <div className="dim" style={{ fontSize: 13, marginTop: 4 }}>+50 XP · come back tomorrow</div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

Object.assign(window, { CubeLevel, KeyExchangeLevel, HashLevel, RsaLevel, SandboxScreen, DailyScreen });
