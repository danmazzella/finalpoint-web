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
  drivers: DriverPickStat[];
}

interface PickDistributionCardProps {
  raceName: string;
  eventType: 'race' | 'sprint';
  positions: PositionStat[];
  totalPlayers?: number;
}

const MAX_POSITIONS = 3;
const SHOW_DRIVERS = 4;

export default function PickDistributionCard({
  raceName,
  eventType,
  positions,
  totalPlayers,
}: PickDistributionCardProps) {
  const filtered = [...positions]
    .sort((a, b) => a.position - b.position)
    .slice(0, MAX_POSITIONS);
  const totalPicks = positions[0]?.totalPicks ?? totalPlayers ?? 0;

  const subtitle = totalPicks > 0
    ? `${totalPicks.toLocaleString()} picks locked in${eventType === 'sprint' ? ' · Sprint' : ''}`
    : eventType === 'sprint' ? 'Sprint' : undefined;

  return (
    <SocialCardFrame
      raceName={raceName}
      cardTitle="Community Picks"
      cardSubtitle={subtitle}
    >
      <div className="flex flex-col gap-3 h-full">
        {filtered.map((pos) => {
          const topDrivers = pos.drivers.slice(0, SHOW_DRIVERS);
          const maxPct = topDrivers[0]?.percentage ?? 1;

          return (
            <div key={pos.position}>
              {/* Position label */}
              <div className="flex items-center gap-2 mb-2">
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: '0.12em',
                    color: '#64748b',
                    textTransform: 'uppercase',
                  }}
                >
                  P{pos.position}
                </span>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.05)' }} />
              </div>

              {/* Drivers */}
              <div className="flex flex-col gap-1.5">
                {topDrivers.map((driver, i) => {
                  const teamColor = getTeamColor(driver.driverTeam);
                  const barWidth = maxPct > 0 ? (driver.percentage / maxPct) * 100 : 0;
                  const isTop = i === 0;

                  return (
                    <div key={driver.driverId} className="flex items-center gap-2">
                      {/* Driver name */}
                      <span
                        style={{
                          width: 108,
                          fontSize: isTop ? 13 : 12,
                          fontWeight: isTop ? 700 : 500,
                          color: isTop ? '#ffffff' : '#94a3b8',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          flexShrink: 0,
                        }}
                      >
                        {driver.driverName.split(' ').pop()}
                      </span>

                      {/* Bar */}
                      <div style={{ flex: 1, height: isTop ? 8 : 6, background: 'rgba(255,255,255,0.06)', borderRadius: 99 }}>
                        <div
                          style={{
                            width: `${barWidth}%`,
                            height: '100%',
                            borderRadius: 99,
                            background: isTop
                              ? `linear-gradient(90deg, ${teamColor}, ${teamColor}cc)`
                              : `${teamColor}66`,
                            transition: 'width 0.3s ease',
                          }}
                        />
                      </div>

                      {/* Percentage */}
                      <span
                        style={{
                          width: 36,
                          fontSize: isTop ? 13 : 11,
                          fontWeight: isTop ? 700 : 500,
                          color: isTop ? '#ffffff' : '#64748b',
                          textAlign: 'right',
                          flexShrink: 0,
                        }}
                      >
                        {driver.percentage}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </SocialCardFrame>
  );
}
