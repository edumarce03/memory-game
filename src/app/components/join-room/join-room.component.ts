import { Component, inject } from '@angular/core';
import { FirestoreService } from '../../services/firestore.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlayerService } from '../../services/player.service';

@Component({
  selector: 'app-join-room',
  imports: [FormsModule],
  templateUrl: './join-room.component.html',
})
export class JoinRoomComponent {
  roomId: string = '';
  playerName: string = '';

  private playerService = inject(PlayerService);
  private firestoreService = inject(FirestoreService);
  private router = inject(Router);

  constructor() {
    this.playerName = this.playerService.getPlayerName() || '';
  }

  async joinRoom() {
    if (this.roomId && this.playerName) {
      const success = await this.firestoreService.joinRoom(
        this.roomId,
        this.playerName
      );
      if (success) {
        this.router.navigate(['/game', this.roomId]);
      } else {
        alert('El ID de la sala no existe o ya está llena.');
      }
    }
  }
}
