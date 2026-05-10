import SocialCardFrame from '../SocialCardFrame';

interface MilestoneCardProps {
  seasonYear: number;
  totalPicks: number;
  totalUsers: number;
  totalLeagues: number;
  accuracy: number;
}

export default function MilestoneCard({
  seasonYear,
  totalPicks = 0,
  totalUsers = 0,
  totalLeagues = 0,
  accuracy = 0,
}: MilestoneCardProps) {
  return (
    <SocialCardFrame
      raceName={`${seasonYear} Season`}
      cardTitle="The Community"
      accentColor="#2563eb"
    >
      <div className="flex flex-col h-full justify-between">

        {/* Hero stat — total picks */}
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <div
            style={{
              fontSize: 86,
              fontWeight: 900,
              letterSpacing: '-0.05em',
              lineHeight: 1,
              background: 'linear-gradient(135deg, #ffffff 0%, #3b82f6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {totalPicks.toLocaleString()}
          </div>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#64748b', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 6 }}>
            Picks made this season
          </p>
        </div>

        {/* Supporting stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          {[
            { label: 'Players', value: totalUsers.toLocaleString(), color: '#2563eb' },
            { label: 'Leagues', value: totalLeagues.toLocaleString(), color: '#7c3aed' },
            { label: 'Avg accuracy', value: `${accuracy}%`, color: '#22c55e' },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              style={{
                padding: '14px 10px',
                background: 'rgba(255,255,255,0.04)',
                borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.06)',
                textAlign: 'center',
              }}
            >
              <p style={{ fontSize: 24, fontWeight: 900, color, letterSpacing: '-0.02em', lineHeight: 1 }}>
                {value}
              </p>
              <p style={{ fontSize: 10, color: '#475569', fontWeight: 600, marginTop: 4, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {label}
              </p>
            </div>
          ))}
        </div>

        <p style={{ fontSize: 13, color: '#334155', fontWeight: 600, textAlign: 'center' }}>
          Join the community at finalpoint.app
        </p>
      </div>
    </SocialCardFrame>
  );
}
