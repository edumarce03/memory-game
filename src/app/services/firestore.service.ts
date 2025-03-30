import { inject, Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  Firestore,
  getDoc,
  updateDoc,
} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  private firestore = inject(Firestore);

  async createRoom(playerName: string): Promise<string> {
    const roomData = {
      player1: playerName,
      player2: null,
      createdAt: new Date().toISOString(),
      status: 'waiting',
    };
    const roomRef = await addDoc(collection(this.firestore, 'rooms'), roomData);
    return roomRef.id;
  }

  async joinRoom(roomId: string, playerName: string): Promise<boolean> {
    const roomRef = doc(this.firestore, 'rooms', roomId);
    const roomSnap = await getDoc(roomRef);
    if (roomSnap.exists() && !roomSnap.data()['player2']) {
      await updateDoc(roomRef, {
        player2: playerName,
        status: 'active',
      });
      return true;
    }
    return false;
  }

  async leaveRoom(roomId: string) {
    const roomRef = doc(this.firestore, 'rooms', roomId);
    await updateDoc(roomRef, { player2: null, status: 'waiting' });
  }

  async closeRoom(roomId: string) {
    const roomRef = doc(this.firestore, 'rooms', roomId);
    await deleteDoc(roomRef);
  }

  async setCategory(
    roomId: string,
    category: 'emotions' | 'food' | 'animals' | 'professions'
  ) {
    const roomRef = doc(this.firestore, 'rooms', roomId);
    const emojis = this.generateBoard(category);
    await updateDoc(roomRef, {
      category,
      board: emojis,
      status: 'playing',
      flipped: [],
      matched: [],
      matchedBy: [],
      currentTurn: null,
      player1Score: 0,
      player2Score: 0,
    });
  }

  async startGame(roomId: string, playerName: string) {
    const roomRef = doc(this.firestore, 'rooms', roomId);
    await updateDoc(roomRef, { currentTurn: playerName });
  }

  async flipCard(roomId: string, index: number, playerName: string) {
    const roomRef = doc(this.firestore, 'rooms', roomId);
    const roomSnap = await getDoc(roomRef);
    const data = roomSnap.data() as any;

    if (
      data.currentTurn !== playerName ||
      data.flipped.length >= 2 ||
      data.matched.includes(index)
    )
      return;

    const flipped = [...data.flipped, index];
    await updateDoc(roomRef, { flipped });

    if (flipped.length === 2) {
      const [firstIdx, secondIdx] = flipped;
      if (data.board[firstIdx] === data.board[secondIdx]) {
        const matched = [...data.matched, firstIdx, secondIdx];
        const matchedBy = [...(data.matchedBy || []), playerName, playerName];
        const newScore =
          playerName === data.player1
            ? data.player1Score + 1
            : data.player2Score + 1;
        const isFinished = matched.length === data.board.length;
        await updateDoc(roomRef, {
          matched,
          matchedBy,
          flipped: [],
          [playerName === data.player1 ? 'player1Score' : 'player2Score']:
            newScore,
          currentTurn: playerName, // Mantiene el turno si acierta
          status: isFinished ? 'finished' : 'playing',
        });
      } else {
        setTimeout(async () => {
          await updateDoc(roomRef, {
            flipped: [],
            currentTurn:
              playerName === data.player1 ? data.player2 : data.player1, // Cambia turno si falla
          });
        }, 1000);
      }
    }
  }

  private generateBoard(
    category: 'emotions' | 'food' | 'animals' | 'professions'
  ): string[] {
    const emojiSets = {
      emotions: [
        '😀',
        '😂',
        '😍',
        '😢',
        '😡',
        '😱',
        '😴',
        '🤓',
        '😎',
        '🥳',
        '😜',
        '🤔',
        '😇',
        '😈',
        '🤗',
        '😤',
      ],
      food: [
        '🍎',
        '🍌',
        '🍕',
        '🍔',
        '🍟',
        '🍣',
        '🍦',
        '🍓',
        '🍇',
        '🍉',
        '🍋',
        '🍒',
        '🍍',
        '🥐',
        '🥕',
        '🥑',
      ],
      animals: [
        '🐶',
        '🐱',
        '🐭',
        '🐰',
        '🦊',
        '🐻',
        '🐼',
        '🐸',
        '🐯',
        '🦁',
        '🐮',
        '🐷',
        '🐵',
        '🐘',
        '🦒',
        '🐙',
      ],
      professions: [
        '👨‍🚒',
        '👩‍🚒',
        '👨‍✈️',
        '👩‍✈️',
        '👨‍⚕️',
        '👩‍⚕️',
        '👨‍🍳',
        '👩‍🍳',
        '👨‍🏫',
        '👩‍🏫',
        '👨‍💻',
        '👩‍💻',
        '👨‍🔧',
        '👩‍🔧',
        '👨‍🔬',
        '👩‍🔬',
      ],
    };
    const selectedEmojis = emojiSets[category].slice(0, 8);
    const board = [...selectedEmojis, ...selectedEmojis];
    return this.shuffleArray(board);
  }

  private shuffleArray(array: string[]): string[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}
