import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FirestoreService } from '../../services/firestore.service';
import { PlayerService } from '../../services/player.service';
import { doc, onSnapshot } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';
import { AlertComponent } from '../alert/alert.component';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule, AlertComponent],
  templateUrl: './game.component.html',
})
export class GameComponent implements OnInit, OnDestroy {
  roomId: string | null = null;
  playerName: string = '';
  isPlayer1: boolean = false;
  roomData: any = null;
  categories = [
    'emotions',
    'food',
    'animals',
    'professions',
    'sports',
    'travel',
  ];
  showAllCards: boolean = false;
  notification: { message: string; type: 'error' | 'success' | 'info' } | null =
    null;
  isNotificationExiting: boolean = false;
  showModal: boolean = false;
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
          if (this.roomData.notification) {
            const { event, data } = this.roomData.notification;
            switch (event) {
              case 'category_selected':
                const categoryName = this.getCategoryName(data.category);
                this.showNotification(
                  this.isPlayer1
                    ? `Categoría seleccionada: ${categoryName}`
                    : `${this.roomData.player1} seleccionó: ${categoryName}`,
                  'success'
                );
                break;
            }
            if (this.isPlayer1) {
              setTimeout(() => {
                this.firestoreService.clearNotification(this.roomId!);
              }, 3000);
            }
          }
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
          this.showModal = this.roomData.status === 'finished';
        } else {
          this.roomData = null;
          this.showNotification('La sala ya no existe', 'error');
          setTimeout(() => this.router.navigate(['/']), 2000);
        }
      });
    }
  }

  async selectCategory(category: string) {
    if (this.roomId && this.isPlayer1) {
      await this.firestoreService.setCategory(this.roomId, category as any);
      await this.firestoreService.sendNotification(
        this.roomId,
        'category_selected',
        { category }
      );
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

  copyRoomId() {
    if (this.roomId) {
      navigator.clipboard
        .writeText(this.roomId)
        .then(() => {
          this.showNotification('ID copiado al portapapeles', 'success');
        })
        .catch((err) => {
          this.showNotification('Error al copiar el ID', 'error');
          console.error('Error al copiar el ID de sala:', err);
        });
    }
  }

  showNotification(message: string, type: 'error' | 'success' | 'info') {
    this.notification = { message, type };
    this.hideNotificationAfterDelay();
  }

  hideNotificationAfterDelay() {
    setTimeout(() => {
      this.isNotificationExiting = true;
      setTimeout(() => {
        this.notification = null;
        this.isNotificationExiting = false;
      }, 300);
    }, 3000);
  }

  getCategoryName(category: string): string {
    return category === 'emotions'
      ? 'Emociones'
      : category === 'food'
      ? 'Comida'
      : category === 'animals'
      ? 'Animales'
      : category === 'professions'
      ? 'Profesiones'
      : category === 'sports'
      ? 'Deportes'
      : 'Viajes';
  }

  ngOnDestroy() {
    if (this.unsubscribe) this.unsubscribe();
  }

  closeModal() {
    this.showModal = false;
  }

  async restartGame() {
    if (this.roomId && this.isPlayer1) {
      await this.firestoreService.updateRoomStatus(this.roomId, 'active');
      await this.firestoreService.clearBoard(this.roomId);
      this.showModal = false;
    }
  }
}
