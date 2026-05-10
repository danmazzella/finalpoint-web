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

interface DarkHorseCardProps {
  raceName: string;
  eventType: 'race' | 'sprint';
  positions: PositionStat[];
}

export default function DarkHorseCard({ raceName, eventType, positions }: DarkHorseCardProps) {
  const scored = positions.filter(p => p.isScored);

  // Find the correct pick with the lowest backing % across all positions
  const darkHorse = scored.reduce<{ pos: PositionStat; driver: DriverPickStat } | null>((pick, pos) => {
    const correct = pos.drivers.find(d => d.isCorrect);
    if (!correct) return pick;
    if (!pick || correct.percentage < pick.driver.percentage) return { pos, driver: correct };
    return pick;
  }, null);

  if (!darkHorse) {
    return (
      <SocialCardFrame raceName={raceName} cardTitle="Dark Horse">
        <div className="flex items-center justify-center h-full">
          <p style={{ color: '#64748b' }}>No scored data yet.</p>
        </div>
      </SocialCardFrame>
    );
  }

  const { pos, driver } = darkHorse;
  const teamColor = getTeamColor(driver.driverTeam);
  const lastName = driver.driverName.split(' ').pop() ?? driver.driverName;

  // How surprised should we be?
  const surprise = driver.percentage <= 5
    ? 'Almost nobody saw this coming'
    : driver.percentage <= 15
    ? 'Few had the faith'
    : 'The brave few were right';

  return (
    <SocialCardFrame
      raceName={raceName}
      cardTitle="Dark Horse"
      cardSubtitle={`${eventType === 'sprint' ? 'Sprint · ' : ''}Lowest-picked correct call`}
      accentColor={teamColor}
    >
      <div className="flex flex-col h-full justify-around items-center" style={{ textAlign: 'center' }}>

        {/* Position */}
        <p style={{ fontSize: 13, fontWeight: 800, color: '#64748b', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
          P{pos.position}
        </p>

        {/* Driver name — big hero */}
        <div>
          <div
            style={{
              fontSize: 68,
              fontWeight: 900,
              color: teamColor,
              letterSpacing: '-0.04em',
              lineHeight: 1,
            }}
          >
            {lastName}
          </div>
          <p style={{ fontSize: 14, color: teamColor, fontWeight: 600, opacity: 0.7, marginTop: 4, letterSpacing: '0.08em' }}>
            {driver.driverTeam}
          </p>
        </div>

        {/* Stat */}
        <div style={{
          padding: '20px 32px',
          background: `${teamColor}12`,
          border: `1px solid ${teamColor}30`,
          borderRadius: 16,
          width: '100%',
        }}>
          <p style={{ fontSize: 52, fontWeight: 900, color: '#ffffff', letterSpacing: '-0.04em', lineHeight: 1 }}>
            {driver.percentage}%
          </p>
          <p style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600, marginTop: 4 }}>
            of players backed this pick
          </p>
        </div>

        {/* Flavour text */}
        <p style={{ fontSize: 14, color: '#64748b', fontWeight: 600, fontStyle: 'italic' }}>
          {surprise}
        </p>
      </div>
    </SocialCardFrame>
  );
}
