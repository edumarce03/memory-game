import { Component, inject } from '@angular/core';
import { FirestoreService } from '../../services/firestore.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlayerService } from '../../services/player.service';
import { AlertComponent } from '../alert/alert.component';

@Component({
  selector: 'app-join-room',
  imports: [FormsModule, AlertComponent, CommonModule],
  templateUrl: './join-room.component.html',
})
export class JoinRoomComponent {
  roomId: string = '';
  notification: { message: string; type: 'error' | 'success' | 'info' } | null =
    null;
  isNotificationExiting: boolean = false;

  private playerService = inject(PlayerService);
  private firestoreService = inject(FirestoreService);
  private router = inject(Router);

  constructor() {}

  async joinRoom() {
    if (!this.roomId.trim()) {
      this.notification = {
        message: 'El ID de la sala no puede estar vacío',
        type: 'error',
      };
      this.hideNotificationAfterDelay();
      return;
    }
    const playerName = this.playerService.getPlayerName();
    if (!playerName) {
      this.notification = {
        message: 'No hay un nombre de jugador definido',
        type: 'error',
      };
      this.hideNotificationAfterDelay();
      this.router.navigate(['/']);
      return;
    }
    this.firestoreService
      .joinRoom(this.roomId, playerName)
      .then((success) => {
        if (success) {
          this.notification = {
            message: 'Te has unido a la sala con éxito',
            type: 'success',
          };
          this.hideNotificationAfterDelay();
          setTimeout(() => {
            this.router.navigate(['/game', this.roomId]);
          }, 1000);
        } else {
          this.notification = {
            message:
              'No se pudo unir a la sala. Verifica el ID o si ya está llena.',
            type: 'error',
          };
          this.hideNotificationAfterDelay();
        }
      })
      .catch((error) => {
        this.notification = {
          message: 'Error al unirse a la sala: ' + error.message,
          type: 'error',
        };
        this.hideNotificationAfterDelay();
      });
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
}
