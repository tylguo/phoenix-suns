import { useState, useMemo } from 'react';
import type { PlayAction } from '../types';

interface SubstitutionEvent {
  timeActual: string;
  playerOut: string;
  playerIn: string;
  teamId: number;
  teamTricode: string;
}

interface PlayerImpact {
  playerName: string;
  substitutions: number;
  avgPointsBefore: number;
  avgPointsAfter: number;
  avgReboundsBefore: number;
  avgReboundsAfter: number;
  avgAssistsBefore: number;
  avgAssistsAfter: number;
  impactScore: number; // Composite metric
}

interface Props {
  actions: PlayAction[];
}

export default function SubstitutionImpactAnalyzer({ actions }: Props) {
  const [selectedTeam, setSelectedTeam] = useState<string>('all');

  // Extract substitution events
  const substitutionEvents = useMemo(() => {
    const subs: SubstitutionEvent[] = [];
    const outPlayers = new Map<string, { time: string; player: string; teamId: number; teamTricode: string }>();

    actions.forEach(action => {
      if (action.actionType === 'substitution' && action.timeActual && action.playerName && action.teamId && action.teamTricode) {
        if (action.subType === 'out') {
          // stores player going out
          outPlayers.set(`${action.teamId}_${action.timeActual}`, {
            time: action.timeActual,
            player: action.playerName,
            teamId: action.teamId,
            teamTricode: action.teamTricode
          });
        } else if (action.subType === 'in') {
          // find corresponding player going out
          const outKey = `${action.teamId}_${action.timeActual}`;
          const outInfo = outPlayers.get(outKey);

          if (outInfo) {
            subs.push({
              timeActual: action.timeActual,
              playerOut: outInfo.player,
              playerIn: action.playerName,
              teamId: action.teamId,
              teamTricode: action.teamTricode
            });
            outPlayers.delete(outKey);
          }
        }
      }
    });

    return subs.sort((a, b) => new Date(a.timeActual).getTime() - new Date(b.timeActual).getTime());
  }, [actions]);

  // Calculate player impact metrics
  const playerImpacts = useMemo(() => {
    const impacts: Record<string, PlayerImpact> = {};

    substitutionEvents.forEach(sub => {
      if (selectedTeam !== 'all' && sub.teamTricode !== selectedTeam) return;

      // Initialize impact tracking for players
      [sub.playerOut, sub.playerIn].forEach(playerName => {
        if (!impacts[playerName]) {
          impacts[playerName] = {
            playerName,
            substitutions: 0,
            avgPointsBefore: 0,
            avgPointsAfter: 0,
            avgReboundsBefore: 0,
            avgReboundsAfter: 0,
            avgAssistsBefore: 0,
            avgAssistsAfter: 0,
            impactScore: 0
          };
        }
      });

      const subTime = new Date(sub.timeActual).getTime();
      const windowMs = 3 * 60 * 1000; // 3 minutes

      // actions before substitution for player going out
      const actionsBeforeOut = actions.filter(action => {
        if (!action.timeActual || action.playerName !== sub.playerOut) return false;
        const actionTime = new Date(action.timeActual).getTime();
        return actionTime >= subTime - windowMs && actionTime < subTime;
      });

      // actions after substitution for player coming in
      const actionsAfterIn = actions.filter(action => {
        if (!action.timeActual || action.playerName !== sub.playerIn) return false;
        const actionTime = new Date(action.timeActual).getTime();
        return actionTime > subTime && actionTime <= subTime + windowMs;
      });

      const statsBefore = calculatePlayerStats(actionsBeforeOut);
      const statsAfter = calculatePlayerStats(actionsAfterIn);

      const outImpact = impacts[sub.playerOut];
      const inImpact = impacts[sub.playerIn];

      outImpact.substitutions += 1;
      inImpact.substitutions += 1;

      outImpact.avgPointsBefore += statsBefore.points;
      outImpact.avgPointsAfter += 0; // Player out, so no after stats
      outImpact.avgReboundsBefore += statsBefore.rebounds;
      outImpact.avgReboundsAfter += 0;
      outImpact.avgAssistsBefore += statsBefore.assists;
      outImpact.avgAssistsAfter += 0;

      inImpact.avgPointsBefore += 0; // Player in, so no before stats
      inImpact.avgPointsAfter += statsAfter.points;
      inImpact.avgReboundsBefore += 0;
      inImpact.avgReboundsAfter += statsAfter.rebounds;
      inImpact.avgAssistsBefore += 0;
      inImpact.avgAssistsAfter += statsAfter.assists;
    });

    Object.values(impacts).forEach(impact => {
      if (impact.substitutions > 0) {
        impact.avgPointsBefore /= impact.substitutions;
        impact.avgPointsAfter /= impact.substitutions;
        impact.avgReboundsBefore /= impact.substitutions;
        impact.avgReboundsAfter /= impact.substitutions;
        impact.avgAssistsBefore /= impact.substitutions;
        impact.avgAssistsAfter /= impact.substitutions;

        const pointsImpact = impact.avgPointsAfter - impact.avgPointsBefore;
        const reboundImpact = impact.avgReboundsAfter - impact.avgReboundsBefore;
        const assistImpact = impact.avgAssistsAfter - impact.avgAssistsBefore;
        impact.impactScore = pointsImpact + reboundImpact + assistImpact;
      }
    });

    return Object.values(impacts)
      .filter(impact => impact.substitutions > 0)
      .sort((a, b) => Math.abs(b.impactScore) - Math.abs(a.impactScore));
  }, [substitutionEvents, actions, selectedTeam]);

  const teams = useMemo(() => {
    const teamSet = new Set<string>();
    substitutionEvents.forEach(sub => teamSet.add(sub.teamTricode));
    return Array.from(teamSet).sort();
  }, [substitutionEvents]);

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Substitution Impact Analyzer</h2>

      {/* Team Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Filter by Team:
        </label>
        <select
          value={selectedTeam}
          onChange={(e) => setSelectedTeam(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Teams</option>
          {teams.map(team => (
            <option key={team} value={team}>{team}</option>
          ))}
        </select>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800">Total Substitutions</h3>
          <p className="text-2xl font-bold text-blue-600">{substitutionEvents.length}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-green-800">Players Analyzed</h3>
          <p className="text-2xl font-bold text-green-600">{playerImpacts.length}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-purple-800">Avg Impact Score</h3>
          <p className="text-2xl font-bold text-purple-600">
            {playerImpacts.length > 0
              ? (playerImpacts.reduce((sum, p) => sum + Math.abs(p.impactScore), 0) / playerImpacts.length).toFixed(2)
              : '0.00'
            }
          </p>
        </div>
      </div>

      {/* Player Impact Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Player</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subs</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pts Before</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pts After</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reb Before</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reb After</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ast Before</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ast After</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Impact Score</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {playerImpacts.map((impact) => (
              <tr key={impact.playerName} className="hover:bg-gray-50">
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  {impact.playerName}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                  {impact.substitutions}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                  {impact.avgPointsBefore.toFixed(1)}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                  {impact.avgPointsAfter.toFixed(1)}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                  {impact.avgReboundsBefore.toFixed(1)}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                  {impact.avgReboundsAfter.toFixed(1)}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                  {impact.avgAssistsBefore.toFixed(1)}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                  {impact.avgAssistsAfter.toFixed(1)}
                </td>
                <td className={`px-4 py-2 whitespace-nowrap text-sm font-medium ${
                  impact.impactScore > 0 ? 'text-green-600' : impact.impactScore < 0 ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {impact.impactScore.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {playerImpacts.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No substitution data available for the selected team.
        </div>
      )}
    </div>
  );
}

// Helper function to calculate player stats from actions
function calculatePlayerStats(actions: PlayAction[]) {
  let points = 0;
  let rebounds = 0;
  let assists = 0;

  actions.forEach(action => {
    if (action.shotResult === 'Made') {
      if (action.actionType === '2pt') points += 2;
      else if (action.actionType === '3pt') points += 3;
      else if (action.actionType === 'freethrow') points += 1;
    }

    if (action.actionType === 'rebound') {
      rebounds += 1;
    }

    if (action.assistPersonId && action.assistPersonId !== 0) {
      assists += 1;
    }
  });

  return { points, rebounds, assists };
}