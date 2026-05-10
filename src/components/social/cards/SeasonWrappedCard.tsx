import SocialCardFrame from '../SocialCardFrame';

interface SeasonWrappedCardProps {
  seasonYear: number;
  userName: string;
  accuracy: number;
  totalPicks: number;
  correctPicks: number;
  totalPoints: number;
  perfectPicksRate?: number;
  userPercentile?: number | null;
}

function getAccuracyTier(accuracy: number): { label: string; color: string } {
  if (accuracy >= 70) return { label: 'Elite Predictor', color: '#f59e0b' };
  if (accuracy >= 50) return { label: 'Sharp Eye', color: '#22c55e' };
  if (accuracy >= 35) return { label: 'Solid Caller', color: '#3b82f6' };
  if (accuracy >= 20) return { label: 'Learning the Grid', color: '#8b5cf6' };
  return { label: 'Chaos Agent', color: '#ef4444' };
}

export default function SeasonWrappedCard({
  seasonYear,
  userName,
  accuracy = 0,
  totalPicks = 0,
  correctPicks = 0,
  totalPoints = 0,
  perfectPicksRate,
  userPercentile,
}: SeasonWrappedCardProps) {
  const { label, color } = getAccuracyTier(accuracy);

  return (
    <SocialCardFrame
      raceName={`${seasonYear} Season`}
      cardTitle="Season Wrapped"
      cardSubtitle={userName}
      accentColor={color}
    >
      <div className="flex flex-col h-full justify-around">

        {/* Tier badge */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{
            padding: '8px 20px',
            background: `${color}18`,
            border: `1px solid ${color}44`,
            borderRadius: 99,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
            <span style={{ fontSize: 14, fontWeight: 800, color, letterSpacing: '0.05em' }}>{label}</span>
          </div>
        </div>

        {/* Big accuracy stat */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: 88,
            fontWeight: 900,
            color,
            letterSpacing: '-0.05em',
            lineHeight: 1,
          }}>
            {accuracy}%
          </div>
          <p style={{ fontSize: 13, color: '#64748b', fontWeight: 600, marginTop: 4, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Prediction accuracy
          </p>
        </div>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[
            { label: 'Picks made', value: totalPicks.toLocaleString() },
            { label: 'Correct picks', value: correctPicks.toLocaleString() },
            { label: 'Total points', value: totalPoints.toLocaleString() },
            perfectPicksRate != null
              ? { label: 'Perfect pick rate', value: `${perfectPicksRate}%` }
              : userPercentile != null
              ? { label: 'Platform rank', value: `Top ${userPercentile}%` }
              : { label: 'Season', value: String(seasonYear) },
          ].map(({ label, value }) => (
            <div key={label} style={{
              padding: '10px 14px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 10,
            }}>
              <p style={{ fontSize: 20, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.01em' }}>{value}</p>
              <p style={{ fontSize: 10, color: '#475569', fontWeight: 600, marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</p>
            </div>
          ))}
        </div>
      </div>
    </SocialCardFrame>
  );
}
