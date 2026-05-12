import SocialCardFrame, { getTeamColor } from '../SocialCardFrame';

interface DriverPickStat {
  driverId: number;
  driverName: string;
  driverTeam: string;
  percentage: number;
  isCorrect: boolean;
}

interface PositionStat {
  position: number;
  totalPicks: number;
  isScored: boolean;
  actualResult: { driverId: number; driverName: string; driverTeam: string } | null;
  drivers: DriverPickStat[];
}

interface AccuracyRevealCardProps {
  raceName: string;
  eventType: 'race' | 'sprint';
  positions: PositionStat[];
}

function getAccuracyLabel(pct: number): { label: string; color: string } {
  if (pct >= 60) return { label: 'Most saw it coming', color: '#22c55e' };
  if (pct >= 35) return { label: 'Half the grid got it', color: '#f59e0b' };
  if (pct >= 15) return { label: 'Few called it', color: '#f97316' };
  if (pct > 0)   return { label: 'Almost nobody predicted this', color: '#ef4444' };
  return { label: 'Nobody called it', color: '#ef4444' };
}

export default function AccuracyRevealCard({
  raceName,
  eventType,
  positions,
}: AccuracyRevealCardProps) {
  const filtered = positions.filter(p => p.isScored);

  return (
    <SocialCardFrame
      raceName={raceName}
      cardTitle="Race Accuracy"
      cardSubtitle={`How well did the community predict?${eventType === 'sprint' ? ' · Sprint' : ''}`}
      accentColor="#22c55e"
    >
      <div className="flex flex-col gap-4 h-full justify-around">
        {filtered.map((pos) => {
          const correct = pos.drivers.find(d => d.isCorrect);
          const correctPct = correct?.percentage ?? 0;
          const actual = pos.actualResult;
          const { label, color } = getAccuracyLabel(correctPct);
          const teamColor = actual ? getTeamColor(actual.driverTeam) : '#2563eb';

          return (
            <div key={pos.position}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  {/* Position + driver */}
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: 11, fontWeight: 800, color: '#64748b', letterSpacing: '0.12em' }}>
                      P{pos.position}
                    </span>
                    <span
                      style={{
                        fontSize: 18,
                        fontWeight: 800,
                        color: '#ffffff',
                        letterSpacing: '-0.02em',
                      }}
                    >
                      {actual?.driverName.split(' ').pop() ?? '—'}
                    </span>
                    <span style={{ fontSize: 11, color: teamColor, fontWeight: 600, letterSpacing: '0.06em' }}>
                      {actual?.driverTeam.split(' ').slice(-1)[0]}
                    </span>
                  </div>
                  <span style={{ fontSize: 11, color, fontWeight: 600, marginTop: 1, display: 'block' }}>
                    {label}
                  </span>
                </div>

                {/* Big percentage */}
                <span style={{ fontSize: 28, fontWeight: 900, color, lineHeight: 1 }}>
                  {correctPct}%
                </span>
              </div>

              {/* Progress bar */}
              <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 99 }}>
                <div
                  style={{
                    width: `${correctPct}%`,
                    height: '100%',
                    borderRadius: 99,
                    background: `linear-gradient(90deg, ${color}, ${color}99)`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </SocialCardFrame>
  );
}
