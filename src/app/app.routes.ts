import { Routes } from '@angular/router';

export const routes: Routes = [
    
    {
        path: '',
        loadComponent: () => import('./components/home/home').then((m) => m.Home)
    },
    {
        path: 'errands',
        loadComponent: () => import('./components/errands/errands').then((m) => m.Errands)
    },
    {
        path: 'post-errand',
        loadComponent: () => import('./components/create/errand/errand').then((m) => m.Errand)
    }
];
