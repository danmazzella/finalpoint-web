import Image from 'next/image';

export const TEAM_COLORS: Record<string, string> = {
  'Red Bull': '#3671C6',
  'Ferrari': '#E8002D',
  'Mercedes': '#27F4D2',
  'McLaren': '#FF8000',
  'Aston Martin': '#229971',
  'Alpine': '#FF87BC',
  'Williams': '#64C4FF',
  'Haas': '#B6BABD',
  'Sauber': '#52E252',
  'Kick Sauber': '#52E252',
  'RB': '#6692FF',
  'Racing Bulls': '#6692FF',
  'Visa Cash App RB': '#6692FF',
};

export function getTeamColor(team: string): string {
  for (const [key, color] of Object.entries(TEAM_COLORS)) {
    if (team.toLowerCase().includes(key.toLowerCase())) return color;
  }
  return '#2563eb';
}

interface SocialCardFrameProps {
  raceName: string;
  cardTitle: string;
  cardSubtitle?: string;
  accentColor?: string;
  children: React.ReactNode;
}

export default function SocialCardFrame({
  raceName,
  cardTitle,
  cardSubtitle,
  accentColor = '#2563eb',
  children,
}: SocialCardFrameProps) {
  return (
    <div
      className="relative flex flex-col overflow-hidden"
      style={{
        width: 600,
        height: 600,
        background: 'linear-gradient(145deg, #090c14 0%, #0d1629 100%)',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* Top accent line */}
      <div style={{ height: 4, background: `linear-gradient(90deg, ${accentColor}, #7c3aed)` }} />

      {/* Header */}
      <div className="px-8 pt-5 pb-3">
        <p style={{ fontSize: 11, letterSpacing: '0.2em', color: accentColor, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>
          {raceName}
        </p>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1.1, margin: 0 }}>
          {cardTitle}
        </h2>
        {cardSubtitle && (
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 4, fontWeight: 500 }}>
            {cardSubtitle}
          </p>
        )}
      </div>

      {/* Divider */}
      <div className="mx-8" style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 8 }} />

      {/* Content */}
      <div className="flex-1 overflow-hidden px-8 py-3">
        {children}
      </div>

      {/* Footer */}
      <div
        className="mx-8 flex items-center justify-between"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 10, paddingBottom: 14 }}
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
