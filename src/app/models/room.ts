export interface Room {
  player1: string;
  player2: string | null;
  createdAt: string;
  status: 'waiting' | 'active' | 'finished';
  category?: 'emotions' | 'food' | 'animals' | 'professions' | null;
  board?: string[];
  flipped?: number[];
  matched?: number[];
  matchedBy?: string[];
  currentTurn?: string;
  player1Score?: number;
  player2Score?: number;
}
