import Image from 'next/image';

interface InviteCardProps {
  leagueName: string;
  seasonYear?: number;
}

export default function InviteCard({ leagueName, seasonYear }: InviteCardProps) {
  const hasLeague = leagueName.trim().length > 0;

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

      {/* Background decorative F1 */}
      <div style={{
        position: 'absolute',
        top: 40,
        right: -20,
        fontSize: 280,
        fontWeight: 900,
        color: 'rgba(37,99,235,0.04)',
        lineHeight: 1,
        letterSpacing: '-0.05em',
        userSelect: 'none',
        pointerEvents: 'none',
      }}>
        F1
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 56px' }}>

        {/* Eyebrow */}
        <p style={{ fontSize: 12, fontWeight: 700, color: '#2563eb', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 14 }}>
          {hasLeague ? 'Play with me' : 'Come play'}
        </p>

        {/* Logo + name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
          <Image src="/logo.png" alt="FinalPoint" width={56} height={56} style={{ borderRadius: 12 }} />
          <div>
            <p style={{ fontSize: 44, fontWeight: 900, color: '#ffffff', letterSpacing: '-0.03em', lineHeight: 1 }}>
              FinalPoint
            </p>
            <p style={{ fontSize: 14, color: '#64748b', fontWeight: 500, marginTop: 3 }}>
              F1 Race Prediction Game{seasonYear ? ` · ${seasonYear}` : ''}
            </p>
          </div>
        </div>

        <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 24 }} />

        {/* League name (optional) */}
        {hasLeague && (
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 11, color: '#475569', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>
              League
            </p>
            <p style={{ fontSize: 32, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
              {leagueName}
            </p>
          </div>
        )}

        {/* Feature bullets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
          {[
            '🏎️  Pick driver positions before every GP',
            '🏆  Compete in leagues with friends',
            '📊  Track your accuracy across the season',
          ].map(line => (
            <p key={line} style={{ fontSize: 14, color: '#94a3b8', fontWeight: 500 }}>{line}</p>
          ))}
        </div>

        {/* CTA */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          padding: '14px 20px',
          background: 'rgba(37,99,235,0.12)',
          border: '1px solid rgba(37,99,235,0.3)',
          borderRadius: 12,
          alignSelf: 'flex-start',
        }}>
          <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 500 }}>Free to play at</span>
          <span style={{ fontSize: 18, fontWeight: 800, color: '#2563eb', letterSpacing: '-0.01em' }}>finalpoint.app</span>
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '12px 56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Image src="/logo.png" alt="FinalPoint" width={20} height={20} style={{ borderRadius: 4 }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: '#ffffff' }}>FinalPoint</span>
        </div>
        <span style={{ fontSize: 11, color: '#475569' }}>Free · iOS & Android</span>
      </div>
    </div>
  );
}
