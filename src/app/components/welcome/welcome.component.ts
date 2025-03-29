import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-welcome',
  imports: [CommonModule, FormsModule],
  templateUrl: './welcome.component.html',
})
export class WelcomeComponent {
  playerName: string = '';
}
