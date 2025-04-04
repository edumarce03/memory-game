import { Routes } from '@angular/router';
import { GameComponent } from './components/game/game.component';
import { JoinRoomComponent } from './components/join-room/join-room.component';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/welcome/welcome.component').then(
        (m) => m.WelcomeComponent
      ),
  },
  {
    path: 'game/:roomId',
    loadComponent: () =>
      import('./components/game/game.component').then((m) => m.GameComponent),
  },
  {
    path: 'join-room',
    loadComponent: () =>
      import('./components/join-room/join-room.component').then(
        (m) => m.JoinRoomComponent
      ),
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];
