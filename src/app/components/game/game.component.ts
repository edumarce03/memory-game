import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FirestoreService } from '../../services/firestore.service';
import { PlayerService } from '../../services/player.service';
import { doc, onSnapshot } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-game',
  imports: [CommonModule],
  templateUrl: './game.component.html',
})
export class GameComponent implements OnInit, OnDestroy {
  roomId: string | null = null;
  playerName: string = '';
  isPlayer1: boolean = false;
  roomData: any = null;
  categories = ['emotions', 'food', 'animals', 'professions'];
  showAllCards: boolean = false;
  private unsubscribe: (() => void) | null = null;

  private playerService = inject(PlayerService);
  private firestoreService = inject(FirestoreService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  ngOnInit() {
    this.roomId = this.route.snapshot.paramMap.get('roomId');
    this.playerName = this.playerService.getPlayerName();
    if (this.roomId) {
      const roomRef = doc(
        this.firestoreService['firestore'],
        'rooms',
        this.roomId
      );
      this.unsubscribe = onSnapshot(roomRef, (snapshot) => {
        if (snapshot.exists()) {
          this.roomData = snapshot.data();
          this.isPlayer1 = this.roomData.player1 === this.playerName;
          if (
            this.roomData.status === 'playing' &&
            !this.roomData.currentTurn &&
            !this.showAllCards
          ) {
            this.showAllCards = true;
            setTimeout(() => {
              this.showAllCards = false;
              if (this.isPlayer1) {
                this.firestoreService.startGame(
                  this.roomId!,
                  this.roomData.player1
                );
              }
            }, 2000);
          }
        } else {
          this.roomData = null;
          setTimeout(() => this.router.navigate(['/']), 2000);
        }
      });
    }
  }

  async selectCategory(category: string) {
    if (this.roomId && this.isPlayer1) {
      await this.firestoreService.setCategory(this.roomId, category as any);
    }
  }

  async flipCard(index: number) {
    if (this.roomId && this.roomData.currentTurn === this.playerName) {
      await this.firestoreService.flipCard(this.roomId, index, this.playerName);
    }
  }

  async leaveRoom() {
    if (this.roomId && !this.isPlayer1) {
      await this.firestoreService.leaveRoom(this.roomId);
      this.router.navigate(['/']);
    }
  }

  async closeRoom() {
    if (this.roomId && this.isPlayer1) {
      await this.firestoreService.closeRoom(this.roomId);
      this.router.navigate(['/']);
    }
  }

  // Función para copiar el ID de la sala al portapapeles
  copyRoomId() {
    if (this.roomId) {
      navigator.clipboard
        .writeText(this.roomId)
        .then(() => {
          // Opcional: Puedes añadir alguna notificación de copiado exitoso
          console.log('ID de sala copiado al portapapeles');
        })
        .catch((err) => {
          console.error('Error al copiar el ID de sala:', err);
        });
    }
  }

  ngOnDestroy() {
    if (this.unsubscribe) this.unsubscribe();
  }
}
