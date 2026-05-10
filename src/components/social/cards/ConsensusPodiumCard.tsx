import SocialCardFrame, { getTeamColor } from '../SocialCardFrame';

interface DriverPickStat {
  driverId: number;
  driverName: string;
  driverTeam: string;
  pickCount: number;
  percentage: number;
}

interface PositionStat {
  position: number;
  totalPicks: number;
  drivers: DriverPickStat[];
}

interface ConsensusPodiumCardProps {
  raceName: string;
  eventType: 'race' | 'sprint';
  positions: PositionStat[];
}

function PodiumSlot({
  position,
  driver,
  height,
  isCenter,
}: {
  position: number;
  driver: DriverPickStat | undefined;
  height: number;
  isCenter: boolean;
}) {
  if (!driver) return <div style={{ flex: 1 }} />;
  const teamColor = getTeamColor(driver.driverTeam);
  const lastName = driver.driverName.split(' ').slice(1).join(' ') || driver.driverName;

  return (
    <div className="flex flex-col items-center" style={{ flex: 1 }}>
      {/* Driver info above podium */}
      <div className="flex flex-col items-center mb-3" style={{ minHeight: 70 }}>
        <span
          style={{
            fontSize: isCenter ? 20 : 16,
            fontWeight: 800,
            color: '#ffffff',
            textAlign: 'center',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
          }}
        >
          {lastName}
        </span>
        <span
          style={{
            fontSize: 10,
            color: teamColor,
            fontWeight: 600,
            marginTop: 3,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          {driver.driverTeam.split(' ').slice(-1)[0]}
        </span>
        <span
          style={{
            fontSize: isCenter ? 14 : 12,
            color: '#94a3b8',
            fontWeight: 600,
            marginTop: 4,
          }}
        >
          {driver.percentage}% backed
        </span>
      </div>

      {/* Podium block */}
      <div
        style={{
          width: '100%',
          height,
          borderRadius: '8px 8px 0 0',
          background: `linear-gradient(180deg, ${teamColor}33 0%, ${teamColor}11 100%)`,
          border: `1px solid ${teamColor}44`,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          paddingTop: 12,
        }}
      >
        <span
          style={{
            fontSize: isCenter ? 28 : 22,
            fontWeight: 900,
            color: teamColor,
            opacity: 0.9,
          }}
        >
          P{position}
        </span>
      </div>
    </div>
  );
}

export default function ConsensusPodiumCard({
  raceName,
  eventType,
  positions,
}: ConsensusPodiumCardProps) {
  const p1 = positions.find(p => p.position === 1);
  const p2 = positions.find(p => p.position === 2);
  const p3 = positions.find(p => p.position === 3);

  const top1 = p1?.drivers[0];
  const top2 = p2?.drivers[0];
  const top3 = p3?.drivers[0];

  return (
    <SocialCardFrame
      raceName={raceName}
      cardTitle="Predicted Podium"
      cardSubtitle={`Community consensus${eventType === 'sprint' ? ' · Sprint' : ''}`}
    >
      {/* Podium layout: P2 | P1 | P3 */}
      <div className="flex items-end h-full gap-3" style={{ paddingBottom: 0 }}>
        <PodiumSlot position={2} driver={top2} height={130} isCenter={false} />
        <PodiumSlot position={1} driver={top1} height={175} isCenter={true} />
        <PodiumSlot position={3} driver={top3} height={95} isCenter={false} />
      </div>
    </SocialCardFrame>
  );
}
