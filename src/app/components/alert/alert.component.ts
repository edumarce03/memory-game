import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-alert',
  imports: [CommonModule],
  templateUrl: './alert.component.html',
})
export class AlertComponent {
  @Input() message: string = '';
  @Input() type: 'error' | 'success' | 'info' = 'error';
  @Input() animationClass: string = 'animate-fade-in';
}
