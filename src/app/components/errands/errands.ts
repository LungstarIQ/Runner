import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ErrandService } from '../../services/errand.service';
import { Errand, ErrandCategory } from '../../models/errand.model';
import { CATEGORY_LABELS } from '../../constants/errand.constant';
 
type CategoryFilter = ErrandCategory | 'ALL';

@Component({
  selector: 'app-errands',
  standalone: true,
  imports: [RouterLink, DatePipe, DecimalPipe],
  templateUrl: './errands.html',
  styleUrl: './errands.scss',
})

export class Errands implements OnInit {
  private readonly errandService = inject(ErrandService);
 
  readonly categoryLabels = CATEGORY_LABELS;
  readonly categories = Object.keys(CATEGORY_LABELS) as ErrandCategory[];
 
  readonly selectedCategory = signal<CategoryFilter>('ALL');
  readonly errands = signal<Errand[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
 
  // ASSUMPTION: falls back to central Johannesburg if geolocation is
  // denied/unavailable, just so the feed still loads with *something*.
  // Swap for a real "set your address" flow once one exists -- this
  // isn't tied to the user's actual Address from the model.
  private lat = -26.2041;
  private lng = 28.0473;
 
  ngOnInit(): void {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          this.lat = pos.coords.latitude;
          this.lng = pos.coords.longitude;
          this.loadFeed();
        },
        () => this.loadFeed(), // permission denied -- fall back silently
      );
    } else {
      this.loadFeed();
    }
  }
 
  selectCategory(category: CategoryFilter): void {
    if (category === this.selectedCategory()) return;
    this.selectedCategory.set(category);
    this.loadFeed();
  }
 
  private async loadFeed(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const category = this.selectedCategory();
      const errands = await this.errandService.getFeed({
        lat: this.lat,
        lng: this.lng,
        category: category === 'ALL' ? undefined : category,
      });
      this.errands.set(errands);
    } catch {
      this.error.set('Could not load errands nearby. Pull to refresh.');
    } finally {
      this.loading.set(false);
    }
  }
}
