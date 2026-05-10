import SocialCardFrame from '../SocialCardFrame';

interface RaceCountdownCardProps {
  raceName: string;
  circuitName: string;
  country: string;
  raceDate: string;
  qualifyingDate?: string;
  lockTime?: string;
  hasSprint?: boolean;
  timeUntilLock: number; // ms
}

function formatCountdown(ms: number): { value: string; unit: string } {
  if (ms <= 0) return { value: 'LIVE', unit: '' };
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return { value: String(days), unit: days === 1 ? 'DAY TO GO' : 'DAYS TO GO' };
  return { value: String(hours), unit: hours === 1 ? 'HOUR TO GO' : 'HOURS TO GO' };
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  } catch { return dateStr; }
}

export default function RaceCountdownCard({
  raceName,
  circuitName,
  country,
  raceDate,
  qualifyingDate,
  lockTime,
  hasSprint,
  timeUntilLock,
}: RaceCountdownCardProps) {
  const { value, unit } = formatCountdown(timeUntilLock);
  const locked = timeUntilLock <= 0;

  return (
    <SocialCardFrame
      raceName={country}
      cardTitle={raceName}
      cardSubtitle={circuitName}
      accentColor="#e10600"
    >
      <div className="flex flex-col h-full justify-between">

        {/* Countdown hero */}
        <div className="flex flex-col items-center justify-center flex-1">
          {locked ? (
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: 64, fontWeight: 900, color: '#ef4444', letterSpacing: '-0.04em', lineHeight: 1 }}>
                LOCKED
              </span>
              <p style={{ fontSize: 14, color: '#64748b', marginTop: 8, fontWeight: 500 }}>
                Picks are in — race is live
              </p>
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: 100,
                fontWeight: 900,
                color: '#ffffff',
                letterSpacing: '-0.06em',
                lineHeight: 1,
                background: 'linear-gradient(135deg, #ffffff 0%, #94a3b8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                {value}
              </div>
              {unit && (
                <p style={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.2em', color: '#e10600', marginTop: 6 }}>
                  {unit}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Date details */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 8,
          marginBottom: 4,
        }}>
          {qualifyingDate && (
            <div style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.07)' }}>
              <p style={{ fontSize: 10, color: '#64748b', fontWeight: 700, letterSpacing: '0.1em', marginBottom: 3 }}>QUALIFYING</p>
              <p style={{ fontSize: 13, color: '#ffffff', fontWeight: 700 }}>{formatDate(qualifyingDate)}</p>
            </div>
          )}
          <div style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.07)' }}>
            <p style={{ fontSize: 10, color: '#64748b', fontWeight: 700, letterSpacing: '0.1em', marginBottom: 3 }}>RACE DAY</p>
            <p style={{ fontSize: 13, color: '#ffffff', fontWeight: 700 }}>{formatDate(raceDate)}</p>
          </div>
          <div style={{ padding: '10px 12px', background: 'rgba(225,6,0,0.08)', borderRadius: 10, border: '1px solid rgba(225,6,0,0.2)', gridColumn: qualifyingDate ? 'auto' : 'span 2' }}>
            <p style={{ fontSize: 10, color: '#64748b', fontWeight: 700, letterSpacing: '0.1em', marginBottom: 3 }}>PICKS LOCK</p>
            <p style={{ fontSize: 13, color: '#e10600', fontWeight: 700 }}>
              {hasSprint ? 'Sprint & Race qualifying' : 'At qualifying'}
            </p>
          </div>
        </div>

        <p style={{ fontSize: 12, color: '#334155', fontWeight: 600, textAlign: 'center' }}>
          Make your picks at finalpoint.app
        </p>
      </div>
    </SocialCardFrame>
  );
}
