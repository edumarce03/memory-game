import { Routes } from '@angular/router';
import { WelcomeComponent } from './components/welcome/welcome.component';

export const routes: Routes = [
  {
    path: '',
    component: WelcomeComponent,
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];
