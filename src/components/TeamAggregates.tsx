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

    // Field goals: use isFieldGoal flag when available. Count attempts and makes.
    const isFieldGoal = action.isFieldGoal === 1;
    if (isFieldGoal) {
      s.FGA += 1;
      if (action.shotResult === 'Made') s.FGM += 1;

      // Three pointers
      if (action.actionType === '3pt') {
        s['3PTA'] += 1;
        if (action.shotResult === 'Made') s['3PTM'] += 1;
      }

      // Add points for made field goals
      if (action.shotResult === 'Made') {
        if (action.actionType === '3pt') s.points += 3;
        else s.points += 2; // assume 2pt for non-3pt field goals
      }
    }

    // Free throws
    if (action.actionType === 'freethrow') {
      s.FTA += 1;
      if (action.shotResult === 'Made') {
        s.FTM += 1;
        s.points += 1; // free throw is 1 point
      }
    }

    // Assists: only count when there is an assist on a made field goal
    if (action.assistPersonId && action.shotResult === 'Made' && isFieldGoal) {
      s.AST += 1;
    }

    // Rebounds: actionType 'rebound' with subType 'offensive' or 'defensive'
    if (action.actionType === 'rebound') {
      const subtype = (action.subType || '').toLowerCase();
      if (subtype.includes('off')) s.OREB += 1;
      else if (subtype.includes('def')) s.DREB += 1;
    }
  });

  // Convert stats object to array for rendering
  const statRows = Object.entries(stats);

  return (
    <div className="mt-4 border rounded shadow p-2 overflow-auto max-h-[300px]">
      <h2 className="text-xl font-bold mb-2">Team Aggregates</h2>
      <table className="min-w-full table-auto">
        <thead className="bg-gray-200 sticky top-0">
          <tr>
            <th className="p-2 text-center">Team</th>
            <th className="p-2 text-center">FGM-FGA</th>
            <th className="p-2 text-center">3PTM-3PTA</th>
            <th className="p-2 text-center">FTM-FTA</th>
            <th className="p-2 text-center">OREB</th>
            <th className="p-2 text-center">DREB</th>
            <th className="p-2 text-center">AST</th>
            <th className="p-2 text-center">PTS</th>
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
