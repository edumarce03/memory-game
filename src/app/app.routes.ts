import { Routes } from '@angular/router';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { GameComponent } from './components/game/game.component';
import { JoinRoomComponent } from './components/join-room/join-room.component';

export const routes: Routes = [
  {
    path: '',
    component: WelcomeComponent,
  },
  {
    path: 'game/:roomId',
    component: GameComponent,
  },
  {
    path: 'join-room',
    component: JoinRoomComponent,
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];
