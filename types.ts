
export interface Player {
  id: string;
  name: string;
  school: string;
}

export type MatchResult = 1 | 0.5 | 0 | 'bye' | '';

export interface Match {
  pair: number;
  whitePlayerId: string | null;
  blackPlayerId: string | null;
  whiteResult: MatchResult;
  blackResult: MatchResult;
}

export interface Round {
  roundNumber: number;
  matches: Match[];
}

export interface Ranking {
  position: number;
  playerId: string;
  name: string;
  school: string;
  score: number;
  wins: number;
  draws: number;
  de: number;
  buchholz: number;
  sbgr: number;
}

export type View = 'players' | 'matches' | 'ranking';

export type BuchholzMethod = 'cut-1' | 'full';
