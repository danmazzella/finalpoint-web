import Image from 'next/image';

interface LeagueCardFrameProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
  accentColor?: string;
  width?: number;
  children: React.ReactNode;
}

export default function LeagueCardFrame({
  eyebrow,
  title,
  subtitle,
  accentColor = '#2563eb',
  width = 640,
  children,
}: LeagueCardFrameProps) {
  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{
        width,
        background: 'linear-gradient(145deg, #090c14 0%, #0d1629 100%)',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      <div style={{ height: 4, background: `linear-gradient(90deg, ${accentColor}, #7c3aed)` }} />

      <div className="px-8 pt-6 pb-3">
        <p style={{ fontSize: 11, letterSpacing: '0.2em', color: accentColor, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>
          {eyebrow}
        </p>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1.1, margin: 0 }}>
          {title}
        </h2>
        {subtitle && (
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 4, fontWeight: 500 }}>
            {subtitle}
          </p>
        )}
      </div>

      <div className="mx-8" style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 4 }} />

      <div className="px-8 py-4">
        {children}
      </div>

      <div
        className="mx-8 flex items-center justify-between"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 10, paddingBottom: 16 }}
      >
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="FinalPoint" width={22} height={22} style={{ borderRadius: 4 }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: '#ffffff', letterSpacing: '0.02em' }}>FinalPoint</span>
        </div>
        <span style={{ fontSize: 11, color: '#475569', fontWeight: 500 }}>finalpoint.app</span>
      </div>
    </div>
  );
}
