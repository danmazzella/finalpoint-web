import SocialCardFrame, { getTeamColor } from '../SocialCardFrame';

interface DriverPickStat {
  driverName: string;
  driverTeam: string;
  percentage: number;
  isCorrect: boolean;
}

interface PositionStat {
  position: number;
  totalPicks: number;
  isScored: boolean;
  actualResult: { driverName: string; driverTeam: string } | null;
  drivers: DriverPickStat[];
}

interface DriverSpotlightCardProps {
  raceName: string;
  eventType: 'race' | 'sprint';
  positions: PositionStat[];
  driverName: string;
}

export default function DriverSpotlightCard({
  raceName,
  eventType,
  positions,
  driverName,
}: DriverSpotlightCardProps) {
  // Find this driver across all positions
  const driverPositions = positions
    .map(pos => {
      const d = pos.drivers.find(d => d.driverName === driverName);
      return d ? { position: pos.position, driver: d, isScored: pos.isScored } : null;
    })
    .filter(Boolean) as { position: number; driver: DriverPickStat; isScored: boolean }[];

  if (driverPositions.length === 0) {
    return (
      <SocialCardFrame raceName={raceName} cardTitle="Driver Spotlight">
        <div className="flex items-center justify-center h-full">
          <p style={{ color: '#64748b' }}>No data for this driver.</p>
        </div>
      </SocialCardFrame>
    );
  }

  const sample = driverPositions[0].driver;
  const teamColor = getTeamColor(sample.driverTeam);
  const lastName = driverName.split(' ').pop() ?? driverName;
  const maxPct = Math.max(...driverPositions.map(p => p.driver.percentage), 1);

  return (
    <SocialCardFrame
      raceName={raceName}
      cardTitle="Driver Spotlight"
      cardSubtitle={`${eventType === 'sprint' ? 'Sprint · ' : ''}Community backing`}
      accentColor={teamColor}
    >
      <div className="flex flex-col h-full">
        {/* Driver hero */}
        <div style={{
          padding: '12px 16px',
          borderRadius: 12,
          background: `linear-gradient(135deg, ${teamColor}22 0%, ${teamColor}08 100%)`,
          border: `1px solid ${teamColor}44`,
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <p style={{ fontSize: 32, fontWeight: 900, color: '#ffffff', letterSpacing: '-0.03em', lineHeight: 1 }}>
              {lastName}
            </p>
            <p style={{ fontSize: 12, color: teamColor, fontWeight: 600, marginTop: 3, letterSpacing: '0.06em' }}>
              {sample.driverTeam}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 11, color: '#64748b', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              picked for {driverPositions.length} position{driverPositions.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Per-position breakdown */}
        <div className="flex flex-col gap-3 flex-1 justify-around">
          {driverPositions.map(({ position, driver, isScored }) => {
            const barWidth = (driver.percentage / maxPct) * 100;
            const isCorrect = isScored && driver.isCorrect;
            const isWrong = isScored && !driver.isCorrect;

            return (
              <div key={position}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: 11, fontWeight: 800, color: '#64748b', letterSpacing: '0.12em' }}>
                      P{position}
                    </span>
                    {isCorrect && <span style={{ fontSize: 11, color: '#22c55e', fontWeight: 700 }}>✓ Correct</span>}
                    {isWrong && <span style={{ fontSize: 11, color: '#ef4444', fontWeight: 700 }}>✗ Wrong</span>}
                  </div>
                  <span style={{
                    fontSize: 18,
                    fontWeight: 900,
                    color: isCorrect ? '#22c55e' : isWrong ? '#ef4444' : '#ffffff',
                    letterSpacing: '-0.02em',
                  }}>
                    {driver.percentage}%
                  </span>
                </div>
                <div style={{ height: 10, background: 'rgba(255,255,255,0.06)', borderRadius: 99 }}>
                  <div style={{
                    width: `${barWidth}%`,
                    height: '100%',
                    borderRadius: 99,
                    background: isCorrect
                      ? 'linear-gradient(90deg, #22c55e, #16a34a)'
                      : isWrong
                      ? 'linear-gradient(90deg, #ef444466, #ef444433)'
                      : `linear-gradient(90deg, ${teamColor}, ${teamColor}aa)`,
                  }} />
                </div>
                <p style={{ fontSize: 10, color: '#475569', marginTop: 3, fontWeight: 500 }}>
                  {driver.percentage}% of players backed {lastName} for P{position}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </SocialCardFrame>
  );
}
