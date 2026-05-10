import SocialCardFrame from '../SocialCardFrame';

interface Threshold {
  label: string;
  percentile: number;
  accuracy: number;
}

interface PlatformStandingsCardProps {
  seasonYear: number;
  totalPlayers: number;
  thresholds: Threshold[];
}

const TIER_COLORS = ['#f59e0b', '#94a3b8', '#cd7f32', '#2563eb', '#475569'];

export default function PlatformStandingsCard({
  seasonYear,
  totalPlayers,
  thresholds,
}: PlatformStandingsCardProps) {
  const maxAccuracy = thresholds[0]?.accuracy ?? 100;
  const displayThresholds = thresholds.slice(0, 5);

  return (
    <SocialCardFrame
      raceName={`${seasonYear} Season`}
      cardTitle="Platform Standings"
      cardSubtitle={`${totalPlayers.toLocaleString()} players competing`}
      accentColor="#f59e0b"
    >
      <div className="flex flex-col gap-4 h-full justify-around">
        {displayThresholds.map((threshold, idx) => {
          const color = TIER_COLORS[idx] ?? '#475569';
          const barWidth = maxAccuracy > 0 ? (threshold.accuracy / maxAccuracy) * 100 : 0;

          return (
            <div key={threshold.label}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      color,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      border: `1px solid ${color}44`,
                      borderRadius: 4,
                      padding: '1px 6px',
                    }}
                  >
                    {threshold.label}
                  </span>
                </div>
                <span style={{ fontSize: 18, fontWeight: 900, color, letterSpacing: '-0.02em' }}>
                  {threshold.accuracy}%
                </span>
              </div>

              <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 99 }}>
                <div
                  style={{
                    width: `${barWidth}%`,
                    height: '100%',
                    borderRadius: 99,
                    background: `linear-gradient(90deg, ${color}, ${color}99)`,
                  }}
                />
              </div>

              <p style={{ fontSize: 11, color: '#475569', marginTop: 3, fontWeight: 500 }}>
                accuracy needed to reach this tier
              </p>
            </div>
          );
        })}
      </div>
    </SocialCardFrame>
  );
}
