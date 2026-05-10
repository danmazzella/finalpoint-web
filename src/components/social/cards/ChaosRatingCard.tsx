import SocialCardFrame, { getTeamColor } from '../SocialCardFrame';

interface DriverPickStat {
  driverName: string;
  driverTeam: string;
  percentage: number;
  isCorrect: boolean;
}

interface PositionStat {
  position: number;
  isScored: boolean;
  actualResult: { driverName: string; driverTeam: string } | null;
  drivers: DriverPickStat[];
}

interface ChaosRatingCardProps {
  raceName: string;
  eventType: 'race' | 'sprint';
  positions: PositionStat[];
}

function getChaosLabel(pct: number): { headline: string; sub: string; color: string } {
  if (pct >= 50) return { headline: 'By the book', sub: 'The community called it', color: '#22c55e' };
  if (pct >= 30) return { headline: 'Mostly predictable', sub: 'Some surprises, but nothing wild', color: '#86efac' };
  if (pct >= 15) return { headline: 'Chaos incoming', sub: 'The grid kept everyone guessing', color: '#f59e0b' };
  if (pct >= 5)  return { headline: 'Pure chaos', sub: 'Almost nobody saw that coming', color: '#f97316' };
  return { headline: 'Absolute madness', sub: 'Nobody predicted this podium', color: '#ef4444' };
}

export default function ChaosRatingCard({
  raceName,
  eventType,
  positions,
}: ChaosRatingCardProps) {
  const podiumPositions = positions.filter(p => [1, 2, 3].includes(p.position) && p.isScored);

  // Average % who got each podium position right
  const perPositionPct = podiumPositions.map(pos => {
    const correct = pos.drivers.find(d => d.isCorrect);
    return correct?.percentage ?? 0;
  });

  const avgPct = perPositionPct.length > 0
    ? Math.round(perPositionPct.reduce((a, b) => a + b, 0) / perPositionPct.length)
    : 0;

  const { headline, sub, color } = getChaosLabel(avgPct);

  // Podium result for display
  const podiumResult = podiumPositions.map(pos => ({
    position: pos.position,
    driverName: pos.actualResult?.driverName.split(' ').pop() ?? '?',
    driverTeam: pos.actualResult?.driverTeam ?? '',
    pct: pos.drivers.find(d => d.isCorrect)?.percentage ?? 0,
  }));

  return (
    <SocialCardFrame
      raceName={raceName}
      cardTitle={headline}
      cardSubtitle={`${eventType === 'sprint' ? 'Sprint · ' : ''}Podium prediction accuracy`}
      accentColor={color}
    >
      <div className="flex flex-col items-center justify-center h-full gap-6">
        {/* Big stat */}
        <div className="flex flex-col items-center">
          <span
            style={{
              fontSize: 96,
              fontWeight: 900,
              color,
              letterSpacing: '-0.04em',
              lineHeight: 1,
            }}
          >
            {avgPct}%
          </span>
          <span style={{ fontSize: 15, color: '#94a3b8', fontWeight: 600, marginTop: 4, textAlign: 'center' }}>
            {sub}
          </span>
        </div>

        {/* Podium result chips */}
        {podiumResult.length > 0 && (
          <div className="flex gap-3">
            {podiumResult.map(({ position, driverName, driverTeam, pct }) => {
              const teamColor = getTeamColor(driverTeam);
              return (
                <div
                  key={position}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '10px 16px',
                    borderRadius: 10,
                    background: 'rgba(255,255,255,0.04)',
                    border: `1px solid ${teamColor}33`,
                    minWidth: 90,
                  }}
                >
                  <span style={{ fontSize: 10, color: '#64748b', fontWeight: 700, letterSpacing: '0.12em' }}>
                    P{position}
                  </span>
                  <span style={{ fontSize: 15, fontWeight: 800, color: '#ffffff', marginTop: 2 }}>
                    {driverName}
                  </span>
                  <span style={{ fontSize: 11, color: teamColor, fontWeight: 600, marginTop: 1 }}>
                    {pct}% right
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </SocialCardFrame>
  );
}
