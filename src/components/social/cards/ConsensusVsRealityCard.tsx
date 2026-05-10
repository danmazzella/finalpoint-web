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

interface ConsensusVsRealityCardProps {
  raceName: string;
  eventType: 'race' | 'sprint';
  positions: PositionStat[];
}

export default function ConsensusVsRealityCard({
  raceName,
  eventType,
  positions,
}: ConsensusVsRealityCardProps) {
  const scored = positions.filter(p => p.isScored && p.actualResult);

  // Stats
  const correctCount = scored.filter(p => p.drivers[0]?.isCorrect).length;
  const total = scored.length;
  const crowdAccuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0;

  return (
    <SocialCardFrame
      raceName={raceName}
      cardTitle="Crowd vs Reality"
      cardSubtitle={`${eventType === 'sprint' ? 'Sprint · ' : ''}Top pick vs actual result`}
      accentColor={crowdAccuracy >= 50 ? '#22c55e' : '#f97316'}
    >
      <div className="flex flex-col h-full gap-3">
        {scored.map(pos => {
          const topPick = pos.drivers[0];
          const actual = pos.actualResult!;
          const correct = topPick?.driverName === actual.driverName;
          const topTeamColor = topPick ? getTeamColor(topPick.driverTeam) : '#64748b';
          const actualTeamColor = getTeamColor(actual.driverTeam);

          return (
            <div
              key={pos.position}
              style={{
                padding: '10px 12px',
                borderRadius: 10,
                background: correct ? 'rgba(34,197,94,0.06)' : 'rgba(255,255,255,0.03)',
                border: correct ? '1px solid rgba(34,197,94,0.2)' : '1px solid rgba(255,255,255,0.06)',
              }}
            >
              {/* Position label */}
              <p style={{ fontSize: 10, fontWeight: 800, color: '#64748b', letterSpacing: '0.12em', marginBottom: 8 }}>
                P{pos.position}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 8 }}>
                {/* Crowd pick */}
                <div>
                  <p style={{ fontSize: 10, color: '#475569', fontWeight: 600, marginBottom: 3, letterSpacing: '0.08em' }}>
                    CROWD PICKED
                  </p>
                  <p style={{ fontSize: 15, fontWeight: 800, color: topPick ? '#ffffff' : '#64748b', letterSpacing: '-0.01em' }}>
                    {topPick?.driverName.split(' ').pop() ?? '—'}
                  </p>
                  <p style={{ fontSize: 10, color: topTeamColor, fontWeight: 600, marginTop: 1 }}>
                    {topPick?.percentage ?? 0}% backed
                  </p>
                </div>

                {/* Arrow / result */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <span style={{ fontSize: 16 }}>{correct ? '✅' : '❌'}</span>
                </div>

                {/* Actual result */}
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 10, color: '#475569', fontWeight: 600, marginBottom: 3, letterSpacing: '0.08em' }}>
                    ACTUAL
                  </p>
                  <p style={{ fontSize: 15, fontWeight: 800, color: correct ? '#22c55e' : '#ffffff', letterSpacing: '-0.01em' }}>
                    {actual.driverName.split(' ').pop()}
                  </p>
                  <p style={{ fontSize: 10, color: actualTeamColor, fontWeight: 600, marginTop: 1 }}>
                    {actual.driverTeam.split(' ').slice(-1)[0]}
                  </p>
                </div>
              </div>
            </div>
          );
        })}

        {/* Summary */}
        {scored.length > 1 && (
          <div style={{ marginTop: 'auto', textAlign: 'center' }}>
            <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>
              Crowd nailed{' '}
              <span style={{ color: crowdAccuracy >= 50 ? '#22c55e' : '#f97316', fontWeight: 800 }}>
                {correctCount}/{total}
              </span>
              {' '}positions
            </span>
          </div>
        )}
      </div>
    </SocialCardFrame>
  );
}
