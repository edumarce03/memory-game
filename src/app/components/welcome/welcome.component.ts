import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FirestoreService } from '../../services/firestore.service';
import { Router } from '@angular/router';
import { PlayerService } from '../../services/player.service';
import { AlertComponent } from '../alert/alert.component';

@Component({
  selector: 'app-welcome',
  imports: [CommonModule, FormsModule, AlertComponent],
  templateUrl: './welcome.component.html',
})
export class WelcomeComponent {
  playerName: string = '';
  errorMessage: string = '';
  isErrorExiting: boolean = false;
  notification: { message: string; type: 'error' | 'success' } | null = null;
  isNotificationExiting: boolean = false;
  isLoading: 'create' | null = null;

  private firestoreService = inject(FirestoreService);
  private playerService = inject(PlayerService);
  private router = inject(Router);

  validateName(): boolean {
    this.errorMessage = '';
    this.isErrorExiting = false;
    this.notification = null;
    this.isNotificationExiting = false;

    const trimmedName = this.playerName.trim();

    if (!trimmedName) {
      this.errorMessage = 'El nombre no puede estar vacío';
      this.hideErrorAfterDelay();
      return false;
    }

    if (trimmedName.includes(' ')) {
      this.errorMessage = 'Solo un nombre, sin espacios';
      this.hideErrorAfterDelay();
      return false;
    }

    const words = trimmedName.split(/\s+/).filter(Boolean);
    if (words.length > 1) {
      this.errorMessage = 'Solo un nombre, sin apellidos';
      this.hideErrorAfterDelay();
      return false;
    }

    return true;
  }

  hideErrorAfterDelay() {
    setTimeout(() => {
      this.isErrorExiting = true;
      setTimeout(() => {
        this.errorMessage = '';
        this.isErrorExiting = false;
      }, 300);
    }, 3000);
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

  async createRoom() {
    if (!this.validateName()) {
      this.notification = {
        message:
          'No se puede crear la sala sin haber ingresado el nombre correctamente',
        type: 'error',
      };
      this.hideNotificationAfterDelay();
      return;
    }
    this.isLoading = 'create';
    try {
      this.playerService.setPlayerName(this.playerName);
      const roomId = await this.firestoreService.createRoom(this.playerName);
      this.notification = {
        message: 'Sala creada con éxito',
        type: 'success',
      };
      this.hideNotificationAfterDelay();
      setTimeout(() => {
        this.router.navigate(['/game', roomId]);
      }, 1000);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido';
      this.notification = {
        message: 'Error al crear la sala: ' + errorMessage,
        type: 'error',
      };
      this.hideNotificationAfterDelay();
    } finally {
      this.isLoading = null;
    }
  }

  goToJoinRoom() {
    if (!this.validateName()) {
      this.notification = {
        message:
          'No se puede unir a una sala sin haber ingresado el nombre correctamente',
        type: 'error',
      };
      this.hideNotificationAfterDelay();
      return;
    }
    try {
      this.playerService.setPlayerName(this.playerName);
      this.notification = {
        message: 'Nombre registrado, puedes unirte a una sala',
        type: 'success',
      };
      this.hideNotificationAfterDelay();
      this.router.navigate(['/join-room']);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido';
      this.notification = {
        message: 'Error al procesar la acción: ' + errorMessage,
        type: 'error',
      };
      this.hideNotificationAfterDelay();
    }
  }
}
