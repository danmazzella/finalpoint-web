import SocialCardFrame, { getTeamColor } from '../SocialCardFrame';

interface DriverPickStat {
  driverId: number;
  driverName: string;
  driverTeam: string;
  pickCount: number;
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

interface FinalPointCardProps {
  raceName: string;
  eventType: 'race' | 'sprint';
  positions: PositionStat[];
  /** Which position to spotlight — defaults to 10 */
  spotlightPosition?: number;
}

const SHOW_DRIVERS = 6;

export default function FinalPointCard({
  raceName,
  eventType,
  positions,
  spotlightPosition = 10,
}: FinalPointCardProps) {
  const pos = positions.find(p => p.position === spotlightPosition);
  const topDrivers = pos?.drivers.slice(0, SHOW_DRIVERS) ?? [];
  const totalPicks = pos?.totalPicks ?? 0;
  const maxPct = topDrivers[0]?.percentage ?? 1;

  const topPick = topDrivers[0];
  const topTeamColor = topPick ? getTeamColor(topPick.driverTeam) : '#2563eb';

  return (
    <SocialCardFrame
      raceName={raceName}
      cardTitle="Who Gets the Final Point?"
      cardSubtitle={`P${spotlightPosition} community picks${eventType === 'sprint' ? ' · Sprint' : ''}${totalPicks > 0 ? ` · ${totalPicks.toLocaleString()} picks` : ''}`}
      accentColor={topTeamColor}
    >
      {topDrivers.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p style={{ color: '#64748b', fontSize: 14 }}>No P{spotlightPosition} pick data yet.</p>
        </div>
      ) : (
        <div className="flex flex-col h-full">
          {/* Top pick hero */}
          <div
            style={{
              padding: '14px 16px',
              borderRadius: 12,
              background: `linear-gradient(135deg, ${topTeamColor}22 0%, ${topTeamColor}08 100%)`,
              border: `1px solid ${topTeamColor}44`,
              marginBottom: 14,
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p style={{ fontSize: 11, color: topTeamColor, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>
                  Community Favourite
                </p>
                <p style={{ fontSize: 28, fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1 }}>
                  {topPick.driverName.split(' ').pop()}
                </p>
                <p style={{ fontSize: 12, color: topTeamColor, fontWeight: 600, marginTop: 3, letterSpacing: '0.06em' }}>
                  {topPick.driverTeam}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 48, fontWeight: 900, color: topTeamColor, lineHeight: 1, letterSpacing: '-0.04em' }}>
                  {topPick.percentage}%
                </p>
                <p style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>of picks</p>
              </div>
            </div>
          </div>

          {/* Rest of drivers */}
          <div className="flex flex-col gap-2 flex-1">
            {topDrivers.slice(1).map((driver, i) => {
              const teamColor = getTeamColor(driver.driverTeam);
              const barWidth = maxPct > 0 ? (driver.percentage / maxPct) * 100 : 0;

              return (
                <div key={driver.driverId} className="flex items-center gap-2">
                  <span style={{ width: 18, fontSize: 10, color: '#475569', fontWeight: 700, flexShrink: 0, textAlign: 'center' }}>
                    {i + 2}
                  </span>
                  <span style={{ width: 96, fontSize: 12, fontWeight: 600, color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flexShrink: 0 }}>
                    {driver.driverName.split(' ').pop()}
                  </span>
                  <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 99 }}>
                    <div
                      style={{
                        width: `${barWidth}%`,
                        height: '100%',
                        borderRadius: 99,
                        background: `${teamColor}88`,
                      }}
                    />
                  </div>
                  <span style={{ width: 34, fontSize: 11, fontWeight: 600, color: '#64748b', textAlign: 'right', flexShrink: 0 }}>
                    {driver.percentage}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </SocialCardFrame>
  );
}
