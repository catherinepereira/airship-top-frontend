export interface DataPoint {
  timestamp: Date;
  players: number;
}

export interface Game {
  name: string;
  gameId: string;
  icon: string;

  players: number;
  game24hrPeak: number;
  record: number;
  recordDate: Date;

  playerCounts: DataPoint[];
}
