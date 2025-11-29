export interface PlayAction {
  actionNumber: number;
  orderNumber?: number;

  clock: string;
  timeActual?: string;
  period: number;
  teamId: number | null;
  teamTricode: string | null;

  actionType: string;
  subType: string;
  descriptor: string;
  description: string;

  // assuming scores can be strings or numbers ( but depends on vendor's API)
  scoreHome?: string | number | null;
  scoreAway?: string | number | null;

  playerName: string | null;
  playerNameI?: string | null;
  shotResult?: string | null;
  shotDistance?: number | null;
  x?: number | null;
  y?: number | null;
  side?: string | null;
  possession?: number | null;

  // Flags may come as numbers or strings
  isFieldGoal?: number | string | boolean | null;

  pointsTotal?: number | null;
  qualifiers?: string[] | null;

  assistPlayerNameI?: string | null;
  assistPersonId?: number | string | null;

  //Jump ball / rebound related fields that appear in some feeds
  jumpBallRecoveredNameInitial?: string | null;
  jumpBallRecoveredPersonId?: number | string | null;
  jumpBallWonPlayerNameI?: string | null;
  jumpBallWonPersonId?: number | string | null;
  jumpBallLostPlayerNameI?: string | null;
  jumpBallLostPersonId?: number | string | null;

  reboundOffensiveTotal?: number | string | null;
  reboundDefensiveTotal?: number | string | null;

  // Allow any other vendor extras without breaking TS
  [key: string]: any;
}

export interface GameData {
  gameId: string;
  type: string;
  actions: PlayAction[];
}
