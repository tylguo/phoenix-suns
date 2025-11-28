export interface PlayAction {
  actionNumber: number;
  clock: string;
  period: number;
  teamId: number | null;
  teamTricode: string | null;
  actionType: string;
  subType: string;
  descriptor: string;
  description: string;
  scoreHome: string;
  scoreAway: string;
  playerName: string | null;
  playerNameI?: string | null;
  shotResult?: string | null;
  shotDistance?: number | null;
  x?: number | null;
  y?: number | null;
  side?: string | null;
  possession?: number;
  isFieldGoal?: number;
  pointsTotal?: number;
  qualifiers?: string[];
  assistPlayerNameI?: string | null;
  assistPersonId?: number;
  // Jump ball specific
  jumpBallRecoveredNameInitial?: string | null;
  jumpBallRecoveredPersonId?: number;
  jumpBallWonPlayerNameI?: string | null;
  jumpBallWonPersonId?: number;
  jumpBallLostPlayerNameI?: string | null;
  jumpBallLostPersonId?: number;
}


export interface GameData {
  gameId: string;
  type: string;           // "playbyplay"
  actions: PlayAction[];
}
