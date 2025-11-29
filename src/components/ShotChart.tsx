import { useState } from "react";
import type { PlayAction } from "../types";

interface Props {
    actions: PlayAction[];
}

export default function ShotChart({ actions }: Props) {
  const [selectedTeam, setSelectedTeam] = useState<string>('all'); // 'all' means show all teams

  // Filter for field goal attempts and optionally by team
  const shots = actions.filter(action => {
    const isShot = Number(action.isFieldGoal) === 1 && action.x !== undefined && action.y !== undefined;
    const matchesTeam = selectedTeam === 'all' || action.teamTricode === selectedTeam;
    return isShot && matchesTeam;
  });

  // Map coordinates: assume x/y are 0-100 (court scale), convert to SVG pixels
  const shotDots = shots.map(action => {
    const svgX = 10 + (Number(action.x) / 100) * 380; // Scale x to court width (380px)
    const svgY = 10 + (Number(action.y) / 100) * 180; // Scale y to court height (180px)
    const isMade = action.shotResult === 'Made';
    return { x: svgX, y: svgY, made: isMade };
  });

  // Get unique teams from actions
  const teams = Array.from(new Set(actions.map(a => a.teamTricode).filter(Boolean))) as string[];

  return (
    <div className="mt-4 border rounded shadow p-4">
      <h3 className="text-lg font-bold mb-2">Shot Chart</h3>
      <div className="mb-2">
        <label htmlFor="team-select" className="mr-2">Filter by Team:</label>
        <select
          id="team-select"
          value={selectedTeam}
          onChange={(e) => setSelectedTeam(e.target.value)}
          className="border rounded p-1"
        >
          <option value="all">All Teams</option>
          {teams.map(team => (
            <option key={team} value={team}>{team}</option>
          ))}
        </select>
      </div>
      <svg width="400" height="200" viewBox="0 0 400 200" className="border">
        {/* Court background */}
        <rect width="400" height="200" fill="#f0f0f0" />
        
        {/* Court outline */}
        <rect x="10" y="10" width="380" height="180" fill="none" stroke="black" strokeWidth="2" />
        
        {/* Hoop (center of court) */}
        <circle cx="200" cy="30" r="5" fill="orange" />
        
        {/* Three-point line (simplified arc) */}
        <path d="M 50 10 A 150 150 0 0 1 350 10" fill="none" stroke="black" strokeWidth="2" />
        
        {/* Free-throw line */}
        <line x1="170" y1="10" x2="230" y2="10" stroke="black" strokeWidth="2" />
        
        {/* Half-court line */}
        <line x1="200" y1="10" x2="200" y2="190" stroke="black" strokeWidth="2" />
        
        {/* Shot dots */}
        {shotDots.map((dot, idx) => (
          <circle
            key={idx}
            cx={dot.x}
            cy={dot.y}
            r="4"
            fill={dot.made ? 'green' : 'red'}
            opacity="0.7"
          />
        ))}
      </svg>
    </div>
  );
}