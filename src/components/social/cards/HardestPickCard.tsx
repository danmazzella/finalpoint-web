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

interface HardestPickCardProps {
  raceName: string;
  eventType: 'race' | 'sprint';
  positions: PositionStat[];
}

export default function HardestPickCard({ raceName, eventType, positions }: HardestPickCardProps) {
  const scored = positions.filter(p => p.isScored);

  // Find position with lowest correct pick %
  const hardest = scored.reduce<{ pos: PositionStat; correctPct: number } | null>((worst, pos) => {
    const correct = pos.drivers.find(d => d.isCorrect);
    const pct = correct?.percentage ?? 0;
    if (!worst || pct < worst.correctPct) return { pos, correctPct: pct };
    return worst;
  }, null);

  if (!hardest) {
    return (
      <SocialCardFrame raceName={raceName} cardTitle="Hardest to Call">
        <div className="flex items-center justify-center h-full">
          <p style={{ color: '#64748b' }}>No scored data yet.</p>
        </div>
      </SocialCardFrame>
    );
  }

  const { pos, correctPct } = hardest;
  const actual = pos.actualResult;
  const topCommunityPick = pos.drivers.find(d => !d.isCorrect && d.percentage === Math.max(...pos.drivers.filter(d => !d.isCorrect).map(d => d.percentage)));
  const teamColor = actual ? getTeamColor(actual.driverTeam) : '#2563eb';
  const topPickTeamColor = topCommunityPick ? getTeamColor(topCommunityPick.driverTeam) : '#64748b';

  return (
    <SocialCardFrame
      raceName={raceName}
      cardTitle="Hardest to Call"
      cardSubtitle={`${eventType === 'sprint' ? 'Sprint · ' : ''}Lowest correct pick rate`}
      accentColor="#ef4444"
    >
      <div className="flex flex-col h-full justify-around">

        {/* Position badge */}
        <div style={{ textAlign: 'center' }}>
          <span style={{
            fontSize: 72,
            fontWeight: 900,
            color: '#ef4444',
            letterSpacing: '-0.04em',
            lineHeight: 1,
          }}>
            P{pos.position}
          </span>
        </div>

        {/* Stat */}
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: '#64748b', fontWeight: 600, marginBottom: 4 }}>
            Only
          </p>
          <span style={{
            fontSize: 64,
            fontWeight: 900,
            color: '#ef4444',
            letterSpacing: '-0.04em',
            lineHeight: 1,
          }}>
            {correctPct}%
          </span>
          <p style={{ fontSize: 14, color: '#64748b', fontWeight: 600, marginTop: 4 }}>
            of players got this right
          </p>
        </div>

        {/* Actual vs expected */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div style={{ padding: '12px 14px', background: `${teamColor}14`, border: `1px solid ${teamColor}33`, borderRadius: 10 }}>
            <p style={{ fontSize: 10, color: '#64748b', fontWeight: 700, letterSpacing: '0.1em', marginBottom: 4 }}>ACTUAL RESULT</p>
            <p style={{ fontSize: 16, fontWeight: 800, color: '#ffffff' }}>{actual?.driverName.split(' ').pop() ?? '?'}</p>
            <p style={{ fontSize: 11, color: teamColor, fontWeight: 600 }}>{actual?.driverTeam}</p>
          </div>
          {topCommunityPick && (
            <div style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10 }}>
              <p style={{ fontSize: 10, color: '#64748b', fontWeight: 700, letterSpacing: '0.1em', marginBottom: 4 }}>CROWD FAVOURITE</p>
              <p style={{ fontSize: 16, fontWeight: 800, color: '#94a3b8' }}>{topCommunityPick.driverName.split(' ').pop()}</p>
              <p style={{ fontSize: 11, color: topPickTeamColor, fontWeight: 600 }}>{topCommunityPick.percentage}% picked this</p>
            </div>
          )}
        </div>
      </div>
    </SocialCardFrame>
  );
}
