import SocialCardFrame from '../SocialCardFrame';

interface Race {
  weekNumber: number;
  raceName: string;
  raceDate: string;
  status?: string;
}

interface SeasonProgressCardProps {
  seasonYear: number;
  races: Race[];
  completedCount: number;
}

export default function SeasonProgressCard({ seasonYear, races, completedCount }: SeasonProgressCardProps) {
  const total = races.length;
  const remaining = total - completedCount;
  const progressPct = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  // Next race
  const nextRace = races.find((_, i) => i >= completedCount);

  return (
    <SocialCardFrame
      raceName={`${seasonYear} Season`}
      cardTitle="Season Progress"
      cardSubtitle={`${completedCount} of ${total} races complete`}
      accentColor="#2563eb"
    >
      <div className="flex flex-col h-full justify-around">

        {/* Progress ring visual */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{ position: 'relative', width: 140, height: 140 }}>
            <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
              {/* Background circle */}
              <circle cx="70" cy="70" r="58" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12" />
              {/* Progress circle */}
              <circle
                cx="70" cy="70" r="58"
                fill="none"
                stroke="#2563eb"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 58}`}
                strokeDashoffset={`${2 * Math.PI * 58 * (1 - progressPct / 100)}`}
                style={{ transition: 'stroke-dashoffset 0.5s ease' }}
              />
            </svg>
            {/* Center text */}
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <span style={{ fontSize: 32, fontWeight: 900, color: '#ffffff', lineHeight: 1, letterSpacing: '-0.03em' }}>
                {progressPct}%
              </span>
              <span style={{ fontSize: 10, color: '#64748b', fontWeight: 600, letterSpacing: '0.08em', marginTop: 2 }}>
                DONE
              </span>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div style={{ padding: '14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, textAlign: 'center' }}>
            <p style={{ fontSize: 28, fontWeight: 900, color: '#22c55e', letterSpacing: '-0.02em', lineHeight: 1 }}>{completedCount}</p>
            <p style={{ fontSize: 10, color: '#475569', fontWeight: 600, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Races done</p>
          </div>
          <div style={{ padding: '14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, textAlign: 'center' }}>
            <p style={{ fontSize: 28, fontWeight: 900, color: '#f59e0b', letterSpacing: '-0.02em', lineHeight: 1 }}>{remaining}</p>
            <p style={{ fontSize: 10, color: '#475569', fontWeight: 600, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>To go</p>
          </div>
        </div>

        {/* Next race */}
        {nextRace && (
          <div style={{ padding: '12px 14px', background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.2)', borderRadius: 10 }}>
            <p style={{ fontSize: 10, color: '#3b82f6', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 3 }}>
              Up next
            </p>
            <p style={{ fontSize: 16, fontWeight: 800, color: '#ffffff' }}>{nextRace.raceName}</p>
          </div>
        )}
      </div>
    </SocialCardFrame>
  );
}
