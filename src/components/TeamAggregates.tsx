import type { PlayAction } from '../types';

interface Props {
  actions: PlayAction[];
}

interface TeamStats {
  FGM: number;
  FGA: number;
  '3PTM': number;
  '3PTA': number;
  FTM: number;
  FTA: number;
  OREB: number;
  DREB: number;
  AST: number;
  points: number;
}

export default function TeamAggregates({ actions }: Props) {
  // Initialize stats for each team
  const stats: Record<string, TeamStats> = {};

  actions.forEach(action => {
    const team = action.teamTricode;
    if (!team) return;

    if (!stats[team]) {
      stats[team] = {
        FGM: 0,
        FGA: 0,
        '3PTM': 0,
        '3PTA': 0,
        FTM: 0,
        FTA: 0,
        OREB: 0,
        DREB: 0,
        AST: 0,
        points: 0,
      };
    }

    const s = stats[team];

    // Field goals
    if (action.actionType === '2pt' || action.actionType === '3pt') {
      s.FGA += 1;
      if (action.shotResult === 'Made') s.FGM += 1;
    }

    // 3-pointers
    if (action.actionType === '3pt') {
      s['3PTA'] += 1;
      if (action.shotResult === 'Made') s['3PTM'] += 1;
    }

    // Free throws
    if (action.actionType === 'freethrow') {
      s.FTA += 1;
      if (action.shotResult === 'Made') s.FTM += 1;
    }

    // Assists
    if (action.assistPersonId) {
      s.AST += 1;
    }

    // Points
    if (action.pointsTotal) {
      s.points += action.pointsTotal;
    }

    // TODO: Rebounds can be added if actionType includes OREB/DREB
  });

  // Convert stats object to array for rendering
  const statRows = Object.entries(stats);

  return (
    <div className="mt-4 border rounded shadow p-2 overflow-auto max-h-[300px]">
      <h2 className="text-xl font-bold mb-2">Team Aggregates</h2>
      <table className="min-w-full table-auto">
        <thead className="bg-gray-200 sticky top-0">
          <tr>
            <th className="p-2 text-left">Team</th>
            <th className="p-2 text-left">FGM-FGA</th>
            <th className="p-2 text-left">3PTM-3PTA</th>
            <th className="p-2 text-left">FTM-FTA</th>
            <th className="p-2 text-left">OREB</th>
            <th className="p-2 text-left">DREB</th>
            <th className="p-2 text-left">AST</th>
            <th className="p-2 text-left">PTS</th>
          </tr>
        </thead>
        <tbody>
          {statRows.map(([team, s]) => (
            <tr key={team} className="border-b hover:bg-gray-100">
              <td className="p-2">{team}</td>
              <td className="p-2">{s.FGM}-{s.FGA}</td>
              <td className="p-2">{s['3PTM']}-{s['3PTA']}</td>
              <td className="p-2">{s.FTM}-{s.FTA}</td>
              <td className="p-2">{s.OREB}</td>
              <td className="p-2">{s.DREB}</td>
              <td className="p-2">{s.AST}</td>
              <td className="p-2">{s.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
