import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ErrandModel } from '../../models/errand.model';
import { ERRAND_CATEGORIES } from '../../constants/errand.constant';

type CategoryFilter = string | 'ALL';

// NOTE: this component has nothing real to call yet -- the v4 backend doc
// lists no GET /errands (feed/list) endpoint, only GET /errands/{id}. Left
// in place with a hardcoded empty result so the route/layout exists, but
// there's no ErrandService method wired up here on purpose (getFeed() was
// removed when ErrandService was rewritten, rather than pointed at a 404).
// Wire loadFeed() up to a real call once that endpoint exists.

@Component({
  selector: 'app-browse-errands',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './browse-errands.html',
  styleUrl: './browse-errands.scss',
})
export class BrowseErrands {

  readonly categories = ERRAND_CATEGORIES;
 
  readonly selectedCategory = signal<CategoryFilter>('ALL');
  readonly errands = signal<ErrandModel[]>([]);
  readonly loading = signal(false);
  readonly blocked = signal(true);
 
  selectCategory(category: CategoryFilter): void {
    this.selectedCategory.set(category);
  }
  
}
