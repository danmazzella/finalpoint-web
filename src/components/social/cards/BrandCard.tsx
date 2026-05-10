import Image from 'next/image';

export default function BrandCard() {
  return (
    <div
      style={{
        width: 600,
        height: 600,
        background: 'linear-gradient(145deg, #090c14 0%, #0d1629 100%)',
        fontFamily: 'Inter, system-ui, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Top accent */}
      <div style={{ height: 4, background: 'linear-gradient(90deg, #2563eb, #7c3aed)' }} />

      {/* Background decorative number */}
      <div style={{
        position: 'absolute',
        bottom: -30,
        right: -20,
        fontSize: 320,
        fontWeight: 900,
        color: 'rgba(37,99,235,0.04)',
        lineHeight: 1,
        letterSpacing: '-0.05em',
        userSelect: 'none',
      }}>
        10
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 56px' }}>

        {/* Logo + name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
          <Image src="/logo.png" alt="FinalPoint" width={64} height={64} style={{ borderRadius: 14 }} />
          <p style={{ fontSize: 48, fontWeight: 900, color: '#ffffff', letterSpacing: '-0.03em', lineHeight: 1 }}>
            FinalPoint
          </p>
        </div>

        {/* Tagline */}
        <p style={{ fontSize: 22, fontWeight: 700, color: '#e2e8f0', letterSpacing: '-0.01em', lineHeight: 1.3, marginBottom: 20 }}>
          The F1 prediction game where every position matters.
        </p>

        {/* Divider */}
        <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', marginBottom: 20 }} />

        {/* Features */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
          {[
            { icon: '🏎️', text: 'Pick driver finishing positions before every Grand Prix' },
            { icon: '🏆', text: 'Compete in private and public leagues with friends' },
            { icon: '📊', text: 'Track your accuracy and stats across the season' },
          ].map(({ icon, text }) => (
            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 18 }}>{icon}</span>
              <p style={{ fontSize: 14, color: '#94a3b8', fontWeight: 500, lineHeight: 1.3 }}>{text}</p>
            </div>
          ))}
        </div>

        {/* Why the name */}
        <div style={{
          padding: '12px 16px',
          background: 'rgba(37,99,235,0.08)',
          border: '1px solid rgba(37,99,235,0.2)',
          borderRadius: 10,
        }}>
          <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>
            <span style={{ color: '#3b82f6', fontWeight: 700 }}>Why FinalPoint?</span>{' '}
            In F1, P10 is the last position that earns points — the final point available in a race.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '12px 56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Image src="/logo.png" alt="FinalPoint" width={20} height={20} style={{ borderRadius: 4 }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: '#ffffff' }}>FinalPoint</span>
        </div>
        <span style={{ fontSize: 11, color: '#475569' }}>Free · iOS & Android · finalpoint.app</span>
      </div>
    </div>
  );
}
