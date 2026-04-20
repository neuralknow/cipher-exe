// Global store for game state — progression, XP, profile, settings
const STORAGE_KEY = 'cipher_exe_v1';

const DEFAULT_STATE = {
  profile: {
    name: 'OPERATIVE',
    avatar: 0,           // 0-5 index
    path: null,          // 'beginner' | 'intermediate' | 'expert'
    created: Date.now(),
  },
  xp: 0,
  hintPoints: 3,
  streak: 1,
  badges: [],
  completed: {},         // levelId -> { stars, time, date }
  unlocked: ['caesar'],  // skill tree nodes unlocked
  current: null,         // current route
  view: 'boot',          // boot | profile | hub | level | codex | sandbox | daily
  levelId: null,
  settings: {
    sound: true,
    accent: 'cyan',
    font: 'ui',
    difficulty: 'normal',
    startingLevel: 0,
  },
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch (e) {
    return DEFAULT_STATE;
  }
}

function saveState(s) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch (e) {}
}

function useGameState() {
  const [state, setState] = React.useState(loadState);
  React.useEffect(() => { saveState(state); }, [state]);

  const actions = React.useMemo(() => ({
    goto: (view, extra = {}) => setState(s => ({ ...s, view, ...extra })),
    setProfile: (p) => setState(s => ({ ...s, profile: { ...s.profile, ...p } })),
    setSettings: (p) => setState(s => ({ ...s, settings: { ...s.settings, ...p } })),
    completeLevel: (id, { stars = 3, time = 0, xp = 100 } = {}) => setState(s => {
      const prev = s.completed[id];
      const best = prev ? { stars: Math.max(prev.stars, stars), time: Math.min(prev.time || 9999, time) } : { stars, time };
      const unlocked = [...new Set([...s.unlocked, ...LEVEL_UNLOCKS[id] || []])];
      return {
        ...s,
        xp: s.xp + (prev ? 10 : xp),
        completed: { ...s.completed, [id]: { ...best, date: Date.now() } },
        unlocked,
        view: 'hub',
      };
    }),
    useHint: () => setState(s => s.hintPoints > 0 ? { ...s, hintPoints: s.hintPoints - 1 } : s),
    addBadge: (b) => setState(s => s.badges.includes(b) ? s : { ...s, badges: [...s.badges, b] }),
    reset: () => { localStorage.removeItem(STORAGE_KEY); setState(DEFAULT_STATE); },
  }), []);

  return [state, actions, setState];
}

const LEVEL_UNLOCKS = {
  caesar: ['binary', 'morse'],
  binary: ['xor', 'base64'],
  morse: ['vigenere'],
  xor: ['cube'],
  base64: ['cube'],
  vigenere: ['enigma'],
  cube: ['keyexchange'],
  enigma: ['keyexchange'],
  keyexchange: ['hash'],
  hash: ['rsa'],
  rsa: [],
};

const LEVELS = {
  caesar:     { id: 'caesar',     name: 'Caesar Cipher',      kind: '2D',   tier: 1, tag: 'SHIFT',     xp: 120, desc: 'Rotate the wheel to decode your first message. Each letter shifts by a fixed amount.' },
  binary:     { id: 'binary',     name: 'Binary Terminal',    kind: 'TEXT', tier: 1, tag: 'ASCII',     xp: 150, desc: 'Every character is 8 bits. Convert binary streams to plaintext under time pressure.' },
  morse:      { id: 'morse',      name: 'Morse Intercept',    kind: 'TEXT', tier: 1, tag: 'DOTS',      xp: 140, desc: 'Signal intercepted. Decode the dots and dashes before the timer runs out.' },
  xor:        { id: 'xor',        name: 'XOR Circuit',        kind: '2D',   tier: 2, tag: 'LOGIC',     xp: 220, desc: 'Wire logic gates to apply a XOR key. The foundation of every modern cipher.' },
  base64:     { id: 'base64',     name: 'Base64 Packets',     kind: 'TEXT', tier: 2, tag: 'ENCODE',    xp: 200, desc: 'Encoding is not encryption — but every operative must recognize it instantly.' },
  vigenere:   { id: 'vigenere',   name: 'Vigenère Grid',      kind: '2D',   tier: 2, tag: 'POLY',      xp: 240, desc: 'Polyalphabetic. Use a keyword to shift each letter by a different amount.' },
  cube:       { id: 'cube',       name: 'Cipher Cube',        kind: '3D',   tier: 3, tag: 'SUB',       xp: 320, desc: 'Rotate the 3D cube to align substitution faces and reveal the hidden word.' },
  enigma:     { id: 'enigma',     name: 'Enigma Rotors',      kind: '2D',   tier: 3, tag: 'WW2',       xp: 340, desc: 'Three rotors, a reflector, a plugboard. Crack a message the Allies spent years on.' },
  keyexchange:{ id: 'keyexchange',name: 'Key Exchange',       kind: '3D',   tier: 4, tag: 'DH',        xp: 400, desc: 'Alice and Bob must share a secret over a public channel. Mix the colors. Trust the math.' },
  hash:       { id: 'hash',       name: 'Hash Tower',         kind: '3D',   tier: 4, tag: 'SHA',       xp: 420, desc: 'Stack blocks to find a hash collision. One-way functions, visualized.' },
  rsa:        { id: 'rsa',        name: 'RSA Keypair',        kind: 'TEXT', tier: 5, tag: 'PRIME',     xp: 500, desc: 'Two primes. One public key. Unbreakable — for now. Sign the message.' },
};

const BADGES = {
  first_blood: { name: 'First Blood', desc: 'Complete your first level' },
  shift_master: { name: 'Shift Master', desc: 'Finish Caesar with 3 stars' },
  speedrunner: { name: 'Speedrunner', desc: 'Finish any timed level under 30s' },
  no_hints: { name: 'Purist', desc: 'Clear a level without using hints' },
  tier_2: { name: 'Tier II Operative', desc: 'Unlock 5 skill tree nodes' },
  tier_3: { name: 'Cryptographer', desc: 'Unlock 8 skill tree nodes' },
};

window.useGameState = useGameState;
window.LEVELS = LEVELS;
window.BADGES = BADGES;
window.LEVEL_UNLOCKS = LEVEL_UNLOCKS;
