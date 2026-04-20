// Codex — inline cipher knowledge base
const CODEX_ENTRIES = [
  {
    id: 'caesar', title: 'Caesar Cipher', era: 'c. 58 BC',
    summary: 'Shift every letter by a fixed amount. Julius Caesar used shift-3.',
    math: 'E(x) = (x + k) mod 26\nD(x) = (x − k) mod 26',
    example: 'HELLO  →  KHOOR   (shift 3)',
    notes: 'Only 25 possible keys. Broken by brute force in milliseconds. Still useful for obfuscation.'
  },
  {
    id: 'binary', title: 'Binary / ASCII', era: '1963',
    summary: 'Every character is a number. Every number is 8 bits.',
    math: 'A = 65 = 01000001\na = 97 = 01100001',
    example: '01001000 01101001  →  "Hi"',
    notes: 'Not encryption — just representation. But every cipher starts with bits.'
  },
  {
    id: 'morse', title: 'Morse Code', era: '1836',
    summary: 'A telegraph encoding: dots and dashes. The first electronic character set.',
    math: 'A = ·−    B = −···    C = −·−·',
    example: '··· −−− ···   →   SOS',
    notes: 'Not meant as encryption — but often used as one. Speed-read by trained operators.'
  },
  {
    id: 'xor', title: 'XOR Encryption', era: '1950s+',
    summary: 'Exclusive-OR. The atomic operation of modern cryptography.',
    math: 'A ⊕ A = 0\nA ⊕ 0 = A\n(A ⊕ K) ⊕ K = A',
    example: '01101000 ⊕ 10110101  =  11011101',
    notes: 'With a truly random key as long as the message (one-time pad), XOR is provably unbreakable.'
  },
  {
    id: 'base64', title: 'Base64', era: '1992 (MIME)',
    summary: 'Encode binary as 64 printable characters. Not encryption.',
    math: '3 bytes → 4 chars   (8×3 = 6×4 = 24 bits)',
    example: '"Man"  →  "TWFu"',
    notes: 'Ubiquitous for email attachments, data URIs. Rookies mistake it for encryption — do not.'
  },
  {
    id: 'vigenere', title: 'Vigenère Cipher', era: '1553',
    summary: 'Polyalphabetic shift. A keyword cycles to shift each letter differently.',
    math: 'E(xᵢ) = (xᵢ + kᵢ mod n) mod 26',
    example: 'ATTACKATDAWN  +  LEMONLEMONLE  =  LXFOPVEFRNHR',
    notes: 'Called "le chiffre indéchiffrable" for 300 years. Cracked by Babbage and Kasiski in the 1800s.'
  },
  {
    id: 'substitution', title: 'Substitution Cipher', era: 'Ancient',
    summary: 'Replace each letter with a fixed different letter.',
    math: 'Key is a permutation of 26 letters.\n26! = 4 × 10²⁶ possible keys',
    example: 'ABC...  →  QJN...',
    notes: 'Huge keyspace but broken by frequency analysis. E, T, A, O, I — the telltale letters.'
  },
  {
    id: 'enigma', title: 'Enigma Machine', era: '1923–1945',
    summary: 'Rotor cipher used by Nazi Germany in WWII. Broken at Bletchley Park.',
    math: 'E = P⁻¹ ∘ R₁⁻¹ ∘ R₂⁻¹ ∘ R₃⁻¹ ∘ U ∘ R₃ ∘ R₂ ∘ R₁ ∘ P',
    example: '158 million million million settings.',
    notes: 'Turing, Welchman and the Polish Bureau built the Bombe to break it. Shortened WWII by ~2 years.'
  },
  {
    id: 'aes', title: 'AES (Symmetric)', era: '2001',
    summary: 'Advanced Encryption Standard. The current gold standard of symmetric crypto.',
    math: 'Block size: 128 bits\nKey: 128 / 192 / 256 bits\nRounds: 10 / 12 / 14',
    example: 'SubBytes → ShiftRows → MixColumns → AddRoundKey',
    notes: 'Both parties need the same key. Secure, fast, implemented in hardware on every CPU since ~2010.'
  },
  {
    id: 'dh', title: 'Diffie–Hellman', era: '1976',
    summary: 'Two parties agree on a shared secret over an insecure channel — without ever transmitting it.',
    math: 'Public: g, p\nAlice: a, A = gᵃ mod p\nBob: b, B = gᵇ mod p\nShared: Aᵇ = Bᵃ mod p',
    example: 'Eve sees g, p, A, B — but cannot compute a, b.',
    notes: 'Relies on the discrete logarithm problem being hard. The foundation of every HTTPS handshake.'
  },
  {
    id: 'rsa', title: 'RSA (Public Key)', era: '1977',
    summary: 'Two keys: one public (anyone can encrypt), one private (only you can decrypt).',
    math: 'n = p × q (two large primes)\ne × d ≡ 1  (mod (p−1)(q−1))\nE(m) = mᵉ mod n',
    example: 'Bob encrypts with Alice\'s public key.\nOnly Alice can decrypt with her private key.',
    notes: 'Security rests on the hardness of factoring large primes. Quantum computers may change that.'
  },
  {
    id: 'hash', title: 'Hash Functions', era: '1979+',
    summary: 'One-way function. Any input → fixed-size digest. Cannot be reversed.',
    math: 'SHA-256: 2²⁵⁶ possible outputs\nCollision resistance: ~2¹²⁸ ops',
    example: 'SHA-256("abc") = ba7816bf8f01cfea41...',
    notes: 'Used for passwords, integrity, blockchain. MD5 and SHA-1 are broken — use SHA-256 or SHA-3.'
  },
];

function CodexScreen({ state, actions }) {
  const [selected, setSelected] = useState(CODEX_ENTRIES[0].id);
  const entry = CODEX_ENTRIES.find(e => e.id === selected);

  return (
    <div>
      <HeaderBar state={state} actions={actions} showBack title="CODEX" />
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}>
        <Eyebrow>CRYPTOGRAPHY FIELD MANUAL</Eyebrow>
        <div className="h1" style={{ marginTop: 6, marginBottom: 8 }}>The Codex</div>
        <div className="dim" style={{ marginBottom: 32, maxWidth: 600 }}>
          A reference for every cipher in the game. The math is the fun part.
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 24 }}>
          <Card style={{ padding: 0, height: 'fit-content', position: 'sticky', top: 90 }}>
            {CODEX_ENTRIES.map(e => (
              <button
                key={e.id}
                onClick={() => setSelected(e.id)}
                style={{
                  display: 'block', width: '100%', padding: '12px 16px', textAlign: 'left',
                  background: selected === e.id ? 'var(--accent-soft)' : 'transparent',
                  borderLeft: `2px solid ${selected === e.id ? 'var(--accent)' : 'transparent'}`,
                  borderBottom: '1px solid var(--border)',
                  color: selected === e.id ? 'var(--accent)' : 'var(--text)',
                  cursor: 'pointer', fontFamily: 'var(--font-ui)',
                }}
              >
                <div style={{ fontWeight: 500, fontSize: 13 }}>{e.title}</div>
                <div className="mono" style={{ fontSize: 10, color: 'var(--text-faint)', marginTop: 2 }}>{e.era}</div>
              </button>
            ))}
          </Card>

          <Card brackets style={{ padding: 40 }}>
            <div className="flex between">
              <Eyebrow>{entry.era}</Eyebrow>
              {state.completed[entry.id] && <Chip kind="success"><span className="dot"/> CLEARED</Chip>}
            </div>
            <div className="h1 accent glow-text" style={{ marginTop: 8, marginBottom: 16 }}>{entry.title}</div>
            <div style={{ fontSize: 17, color: 'var(--text)', maxWidth: 640, textWrap: 'pretty', marginBottom: 32 }}>
              {entry.summary}
            </div>

            <div className="divider" style={{ margin: '32px 0' }}/>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div>
                <Eyebrow>MATHEMATICS</Eyebrow>
                <pre className="mono" style={{
                  marginTop: 12, padding: 16, background: 'var(--bg)',
                  border: '1px solid var(--border)', fontSize: 13, lineHeight: 1.7,
                  whiteSpace: 'pre-wrap', color: 'var(--accent)',
                }}>{entry.math}</pre>
              </div>
              <div>
                <Eyebrow>EXAMPLE</Eyebrow>
                <pre className="mono" style={{
                  marginTop: 12, padding: 16, background: 'var(--bg)',
                  border: '1px solid var(--border)', fontSize: 13, lineHeight: 1.7,
                  whiteSpace: 'pre-wrap', color: 'var(--violet)',
                }}>{entry.example}</pre>
              </div>
            </div>

            <div className="divider" style={{ margin: '32px 0' }}/>

            <Eyebrow>OPERATIVE'S NOTE</Eyebrow>
            <div style={{ marginTop: 12, fontSize: 15, lineHeight: 1.7, color: 'var(--text-dim)', textWrap: 'pretty' }}>
              {entry.notes}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

window.CodexScreen = CodexScreen;
