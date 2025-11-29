import React from 'react';
import type { PlayAction } from '../types';

interface PlayerStats {
  name: string;
  FGM: number;
  FGA: number;
  '3PTM': number;
  '3PTA': number;
  FTM: number;
  FTA: number;
  OREB: number;
  DREB: number;
  AST: number;
  PTS: number;
  FG_PCT: number;
  '3PT_PCT': number;
  FT_PCT: number;
}

interface Props {
  actions: PlayAction[];
}

export default function PlayerComparison({ actions }: Props) {
  // Aggregate stats per player
  const playerStats: Record<string, PlayerStats> = {};

  actions.forEach(action => {
    const player = action.playerName;
    if (!player) return;

    if (!playerStats[player]) {
      playerStats[player] = {
        name: player,
        FGM: 0,
        FGA: 0,
        '3PTM': 0,
        '3PTA': 0,
        FTM: 0,
        FTA: 0,
        OREB: 0,
        DREB: 0,
        AST: 0,
        PTS: 0,
        FG_PCT: 0,
        '3PT_PCT': 0,
        FT_PCT: 0,
      };
    }

    const s = playerStats[player];

    // Field goals
    const isFieldGoal = Number(action.isFieldGoal) === 1;
    if (isFieldGoal) {
      s.FGA += 1;
      if (action.shotResult === 'Made') s.FGM += 1;

      // Three pointers
      const actionType = (action.actionType || '').toLowerCase();
      if (actionType.includes('3pt')) {
        s['3PTA'] += 1;
        if (action.shotResult === 'Made') s['3PTM'] += 1;
      }

      if (action.shotResult === 'Made') {
        s.PTS += actionType.includes('3pt') ? 3 : 2;
      }
    }

    // Free throws
    if ((action.actionType || '').toLowerCase().includes('free')) {
      s.FTA += 1;
      if (action.shotResult === 'Made') {
        s.FTM += 1;
        s.PTS += 1;
      }
    }

    // Assists
    if (Number(action.assistPersonId) > 0 && action.shotResult === 'Made' && isFieldGoal) {
      s.AST += 1;
    }

    // Rebounds
    if (action.actionType === 'rebound') {
      const subtype = (action.subType || '').toLowerCase();
      if (subtype.includes('off')) s.OREB += 1;
      else if (subtype.includes('def')) s.DREB += 1;
    }
  });

  // Calculate percentages
  Object.values(playerStats).forEach(s => {
    s.FG_PCT = s.FGA > 0 ? (s.FGM / s.FGA) * 100 : 0;
    s['3PT_PCT'] = s['3PTA'] > 0 ? (s['3PTM'] / s['3PTA']) * 100 : 0;
    s.FT_PCT = s.FTA > 0 ? (s.FTM / s.FTA) * 100 : 0;
  });

  const players = Object.keys(playerStats).sort();

  // State for selected players
  const [player1, setPlayer1] = React.useState<string>('');
  const [player2, setPlayer2] = React.useState<string>('');

  const stats1 = playerStats[player1];
  const stats2 = playerStats[player2];

  return (
    <div className="mt-8 border rounded-lg shadow p-4 bg-gray-50">
      <h2 className="text-2xl font-bold mb-4 text-purple-800">Player Performance Comparison</h2>
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-2">Select Player 1</label>
          <select
            value={player1}
            onChange={(e) => setPlayer1(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">Choose a player</option>
            {players.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-2">Select Player 2</label>
          <select
            value={player2}
            onChange={(e) => setPlayer2(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">Choose a player</option>
            {players.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>
      {stats1 && stats2 && (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border">
            <thead className="bg-purple-600 text-white">
              <tr>
                <th className="p-3 text-left">Stat</th>
                <th className="p-3 text-center">{stats1.name}</th>
                <th className="p-3 text-center">{stats2.name}</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-3 font-semibold">PTS</td>
                <td className="p-3 text-center">{stats1.PTS}</td>
                <td className="p-3 text-center">{stats2.PTS}</td>
              </tr>
              <tr className="border-b bg-gray-50">
                <td className="p-3 font-semibold">FGM-FGA</td>
                <td className="p-3 text-center">{stats1.FGM}-{stats1.FGA}</td>
                <td className="p-3 text-center">{stats2.FGM}-{stats2.FGA}</td>
              </tr>
              <tr className="border-b bg-gray-50">
                <td className="p-3 font-semibold">3PTM-3PTA</td>
                <td className="p-3 text-center">{stats1['3PTM']}-{stats1['3PTA']}</td>
                <td className="p-3 text-center">{stats2['3PTM']}-{stats2['3PTA']}</td>
              </tr>
              <tr className="border-b">
                <td className="p-3 font-semibold">3PT%</td>
                <td className="p-3 text-center">{stats1['3PT_PCT'].toFixed(1)}%</td>
                <td className="p-3 text-center">{stats2['3PT_PCT'].toFixed(1)}%</td>
              </tr>
              <tr className="border-b bg-gray-50">
                <td className="p-3 font-semibold">FTM-FTA</td>
                <td className="p-3 text-center">{stats1.FTM}-{stats1.FTA}</td>
                <td className="p-3 text-center">{stats2.FTM}-{stats2.FTA}</td>
              </tr>
              <tr className="border-b">
                <td className="p-3 font-semibold">FT%</td>
                <td className="p-3 text-center">{stats1.FT_PCT.toFixed(1)}%</td>
                <td className="p-3 text-center">{stats2.FT_PCT.toFixed(1)}%</td>
              </tr>
              <tr className="border-b bg-gray-50">
                <td className="p-3 font-semibold">OREB</td>
                <td className="p-3 text-center">{stats1.OREB}</td>
                <td className="p-3 text-center">{stats2.OREB}</td>
              </tr>
              <tr className="border-b">
                <td className="p-3 font-semibold">DREB</td>
                <td className="p-3 text-center">{stats1.DREB}</td>
                <td className="p-3 text-center">{stats2.DREB}</td>
              </tr>
              <tr className="border-b bg-gray-50">
                <td className="p-3 font-semibold">AST</td>
                <td className="p-3 text-center">{stats1.AST}</td>
                <td className="p-3 text-center">{stats2.AST}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}