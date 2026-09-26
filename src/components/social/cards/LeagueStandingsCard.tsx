import LeagueCardFrame from './LeagueCardFrame';

export interface StandingsRow {
  rank: number;
  name: string;
  points: number;
  accuracy: number;
  races: number;
  isOwner?: boolean;
  correctPicks: number;
  totalPicks: number;
  gap: number | null;
  avgDistance: number;
}

interface LeagueStandingsCardProps {
  leagueName: string;
  seasonYear: number;
  rows: StandingsRow[];
  detailed?: boolean;
}

const RANK_COLORS = ['#f59e0b', '#94a3b8', '#cd7f32'];

export default function LeagueStandingsCard({ leagueName, seasonYear, rows, detailed = false }: LeagueStandingsCardProps) {
  return (
    <LeagueCardFrame
      eyebrow={`${seasonYear} Season`}
      title={leagueName}
      subtitle={`Standings · ${rows.length} member${rows.length !== 1 ? 's' : ''}`}
      accentColor="#f59e0b"
    >
      <div className="flex flex-col gap-1.5">
        {rows.map((row) => {
          const rankColor = RANK_COLORS[row.rank - 1] ?? '#2563eb';
          return (
            <div
              key={row.rank}
              className="flex items-center gap-3"
              style={{
                padding: '10px 12px',
                borderRadius: 10,
                background: row.rank <= 3 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
              }}
            >
              <div
                className="flex items-center justify-center flex-shrink-0"
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 999,
                  background: row.rank <= 3 ? rankColor : 'rgba(255,255,255,0.08)',
                  color: row.rank <= 3 ? '#0b1120' : '#94a3b8',
                  fontSize: 12,
                  fontWeight: 800,
                }}
              >
                {row.rank}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#ffffff' }}>{row.name}</span>
                  {row.isOwner && (
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 800,
                        color: '#a78bfa',
                        border: '1px solid #a78bfa44',
                        borderRadius: 4,
                        padding: '1px 5px',
                        textTransform: 'uppercase',
                      }}
                    >
                      Owner
                    </span>
                  )}
                </div>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>
                  {detailed
                    ? `${row.correctPicks}/${row.totalPicks} correct · avg ${row.avgDistance} off · ${row.races} races`
                    : `${row.races} races · ${row.accuracy}% accuracy`}
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 16, color: '#f59e0b', fontWeight: 800 }}>{row.points} pts</div>
                {detailed && (
                  <div style={{ fontSize: 11, fontWeight: 700, color: row.gap == null ? '#22c55e' : '#64748b' }}>
                    {row.gap == null ? 'Leader' : `-${row.gap} to next`}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </LeagueCardFrame>
  );
}
