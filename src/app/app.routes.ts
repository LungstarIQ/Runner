import { Routes } from '@angular/router';
import { DevSetup } from './components/user/dev-setup/dev-setup';
import { TicketTracker } from './components/ticket-tracker/ticket-tracker';
import { PostErrand } from './components/post-errand/post-errand';
import { BrowseErrands } from './components/browse-errands/browse-errands';
import { Home } from './components/home/home';
import { Tab } from './components/tab/tab';

export const routes: Routes = [
  {
    path: '',
    component: Tab,
    children: [
      { path: '', component: Home },
      { path: 'errands', component: BrowseErrands },
      { path: 'errands/new', component: PostErrand },
      { path: 'errand', component: TicketTracker },
      { path: 'dev-setup', component: DevSetup},
    ],
  },
];
