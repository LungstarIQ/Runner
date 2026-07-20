import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./components/feed/feed').then((m) => m.Feed),
    },
];
