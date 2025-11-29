import type { PlayAction } from '../types';

interface Props {
  actions: PlayAction[];
}
// Helper: format various clock representations to MM:SS for easy scanning.
function formatClock(clock?: string | number | null): string {
  if (clock === null || clock === undefined || clock === '') return '-';

  // If already mm:ss-like, normalize padding
  if (typeof clock === 'string' && /^\d+:\d{1,2}$/.test(clock)) {
    const [m, s] = clock.split(':');
    return `${String(Number(m))}:${s.padStart(2, '0')}`;
  }

  // Handle ISO-like duration strings from vendor, e.g. PT12M00.00S or PT0M05.00S
  if (typeof clock === 'string' && clock.startsWith('PT')) {
    // Matches hours/minutes/seconds parts (we only need minutes and seconds here)
    const re = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?/i;
    const m = clock.match(re);
    if (m) {
      const minutes = Number(m[2] ?? 0);
      // seconds may be decimal like 00.00; floor to integer seconds
      const seconds = Math.floor(Number(m[3] ?? 0));
      return `${minutes}:${String(seconds).padStart(2, '0')}`;
    }
  }

  // If numeric seconds provided (string or number), convert to mm:ss
  const secs = Number(clock);
  if (!Number.isNaN(secs)) {
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  }

  // Fallback to string representation
  return String(clock);
}

export default function PlayByPlayFeed({ actions }: Props) {
  return (
    <div className="overflow-auto max-h-[500px] border rounded shadow">
      <table className="min-w-full table-auto">
        <thead className="bg-gray-200 sticky top-0">
          <tr>
            <th className="p-2 text-center">Clock</th>
            <th className="p-2 text-center">Period</th>
            <th className="p-2 text-center">Player</th>
            <th className="p-2 text-center">Description</th>
            <th className="p-2 text-center">Score</th>
          </tr>
        </thead>
        <tbody>
          {actions.map((action, idx) => (
            <tr key={action.orderNumber ?? action.actionNumber ?? idx} className="border-b hover:bg-gray-100" style={{ backgroundColor: idx % 2 === 0 ? '#f3f4f6' : undefined }}>
              <td className="p-2">{formatClock(action.clock)}</td>
              <td className="p-2">{action.period}</td>
              <td className="p-2">{action.playerName || '-'}</td>
              <td className="p-2">{action.description ?? '-'}</td>
              <td className="p-2">{(action.scoreHome ?? '-') + '-' + (action.scoreAway ?? '-')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
