import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FirestoreService } from '../../services/firestore.service';
import { Router } from '@angular/router';
import { PlayerService } from '../../services/player.service';

@Component({
  selector: 'app-welcome',
  imports: [CommonModule, FormsModule],
  templateUrl: './welcome.component.html',
})
export class WelcomeComponent {
  playerName: string = '';

  private firestoreService = inject(FirestoreService);
  private playerService = inject(PlayerService);
  private router = inject(Router);

  async createRoom() {
    if (this.playerName) {
      this.playerService.setPlayerName(this.playerName);
      const roomId = await this.firestoreService.createRoom(this.playerName);
      this.router.navigate(['/game', roomId]);
    }
  }

  goToJoinRoom() {
    if (this.playerName) {
      this.playerService.setPlayerName(this.playerName);
      this.router.navigate(['/join-room']);
    }
  }
}
