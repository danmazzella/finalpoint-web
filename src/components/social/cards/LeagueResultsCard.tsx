import { getTeamColor } from '../SocialCardFrame';
import LeagueCardFrame from './LeagueCardFrame';

interface ActualResult {
  position: number;
  driverName: string | null;
  driverTeam: string | null;
}

export interface PickDetail {
  position: number;
  driverName: string | null;
  isCorrect: boolean;
  positionDifference: number | null;
}

export interface LeaderboardRow {
  rank: number;
  name: string;
  points: number;
  correct: number;
  picksMade: number;
  totalPositions: number;
  picks: PickDetail[];
}

interface LeagueResultsCardProps {
  leagueName: string;
  raceName: string;
  eventType: 'race' | 'sprint';
  weekNumber: number;
  actualResults: ActualResult[];
  hasScoredResults: boolean;
  rows: LeaderboardRow[];
  detailed?: boolean;
}

const RANK_COLORS = ['#f59e0b', '#94a3b8', '#cd7f32'];

export default function LeagueResultsCard({
  leagueName,
  raceName,
  eventType,
  weekNumber,
  actualResults,
  hasScoredResults,
  rows,
  detailed = false,
}: LeagueResultsCardProps) {
  return (
    <LeagueCardFrame
      eyebrow={`${leagueName} · Week ${weekNumber}`}
      title={raceName}
      subtitle={`${eventType === 'sprint' ? 'Sprint' : 'Race'} Results${hasScoredResults ? '' : ' · Not scored yet'}`}
      accentColor="#2563eb"
    >
      {hasScoredResults && actualResults.length > 0 && (
        <div className="mb-4">
          <p style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
            Actual Results
          </p>
          <div className="flex flex-wrap gap-2">
            {actualResults.map((r) => (
              <div
                key={r.position}
                className="flex items-center gap-2"
                style={{
                  padding: '6px 10px',
                  borderRadius: 10,
                  background: 'rgba(255,255,255,0.04)',
                  border: `1px solid ${r.driverTeam ? getTeamColor(r.driverTeam) : '#334155'}33`,
                }}
              >
                <span style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8' }}>P{r.position}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>
                  {r.driverName ?? '—'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <p style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
        {hasScoredResults ? 'Leaderboard' : 'Picks Made'}
      </p>
      <div className="flex flex-col gap-1.5">
        {rows.map((row) => {
          const rankColor = RANK_COLORS[row.rank - 1] ?? '#2563eb';
          return (
            <div
              key={row.rank}
              style={{
                padding: '9px 12px',
                borderRadius: 10,
                background: row.rank <= 3 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
              }}
            >
              <div className="flex items-center gap-3">
              <div
                className="flex items-center justify-center flex-shrink-0"
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 999,
                  background: row.rank <= 3 ? rankColor : 'rgba(255,255,255,0.08)',
                  color: row.rank <= 3 ? '#0b1120' : '#94a3b8',
                  fontSize: 11,
                  fontWeight: 800,
                }}
              >
                {row.rank}
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#ffffff', flex: 1 }}>{row.name}</span>
              {hasScoredResults ? (
                <>
                  <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>{row.correct} correct</span>
                  <span style={{ fontSize: 15, color: '#2563eb', fontWeight: 800, minWidth: 44, textAlign: 'right' }}>
                    {row.points} pts
                  </span>
                </>
              ) : (
                <span style={{ fontSize: 12, color: row.picksMade === row.totalPositions ? '#22c55e' : '#f59e0b', fontWeight: 700 }}>
                  {row.picksMade}/{row.totalPositions} picks
                </span>
              )}
              </div>
              {detailed && hasScoredResults && (
                <div className="flex flex-wrap gap-1.5" style={{ marginTop: 8, paddingLeft: 36 }}>
                  {row.picks.map((p) => {
                    const color = p.isCorrect ? '#22c55e' : p.driverName ? '#f59e0b' : '#475569';
                    return (
                      <span
                        key={p.position}
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: '#cbd5e1',
                          padding: '2px 8px',
                          borderRadius: 6,
                          border: `1px solid ${color}55`,
                          background: `${color}14`,
                        }}
                      >
                        P{p.position} {p.driverName ?? 'No pick'}
                        <span style={{ color, fontWeight: 800, marginLeft: 6 }}>
                          {!p.driverName ? '' : p.isCorrect ? 'exact' : p.positionDifference != null ? `off by ${p.positionDifference}` : ''}
                        </span>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </LeagueCardFrame>
  );
}
