export interface Room {
  player1: string;
  player2: string | null;
  createdAt: string;
  status: 'waiting' | 'active' | 'finished';
}
