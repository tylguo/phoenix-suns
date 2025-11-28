import type { PlayAction } from '../types';

interface Props {
  actions: PlayAction[];
}

export default function PlayByPlayFeed({ actions }: Props) {
  return (
    <div className="overflow-auto max-h-[500px] border rounded shadow">
      <table className="min-w-full table-auto">
        <thead className="bg-gray-200 sticky top-0">
          <tr>
            <th className="p-2 text-left">Clock</th>
            <th className="p-2 text-left">Period</th>
            <th className="p-2 text-left">Player</th>
            <th className="p-2 text-left">Description</th>
            <th className="p-2 text-left">Score</th>
          </tr>
        </thead>
        <tbody>
          {actions.map(action => (
            <tr key={action.actionNumber} className="border-b hover:bg-gray-100">
              <td className="p-2">{action.clock}</td>
              <td className="p-2">{action.period}</td>
              <td className="p-2">{action.playerName || '-'}</td>
              <td className="p-2">{action.description}</td>
              <td className="p-2">{action.scoreHome}-{action.scoreAway}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
