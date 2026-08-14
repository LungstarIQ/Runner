import { Component, OnInit, PLATFORM_ID, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { ErrandService } from '../../services/errand.service';
import { CATEGORY_LABELS } from '../../constants/errand.constant';
import { Errand, ErrandCategory } from '../../models/errand.model';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './feed.html',
  styleUrl: './feed.scss',
})

export class Feed implements OnInit {
  private readonly errandService = inject(ErrandService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly categories = CATEGORY_LABELS;
  readonly activeCategory = signal<ErrandCategory | null>(null);
  readonly errands = signal<Errand[]>([]);
  readonly loading = signal(true);
  readonly locationError = signal<string | null>(null);

  async ngOnInit(): Promise<void> {
    if (!this.isBrowser) return;

    try {
      const { lat, lng } = await this.getBrowserLocation();
      await this.loadFeed(lat, lng);
    } catch {
      this.locationError.set('Turn on location to see errands near you.');
      this.loading.set(false);
    }
  }

  async setCategory(category: ErrandCategory | null ): Promise<void> {
    this.activeCategory.set(category);
    try {
      const { lat, lng } = await this.getBrowserLocation();
      await this.loadFeed(lat, lng, category ?? undefined);
    } catch {
      // location already known to have failed once; ignore silently on filter change
    }
  }

  private async loadFeed(lat: number, lng: number, category?: ErrandCategory): Promise<void> {
    this.loading.set(true);
    const results = await this.errandService.getFeed({ lat, lng, category });
    // Nearest-first by default — this is the whole answer to "does the
    // runner need a map", they just see distance-sorted cards.
    this.errands.set([...results].sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0)));
    this.loading.set(false);
  }

  private getBrowserLocation(): Promise<{ lat: number; lng: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation unsupported'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => reject(new Error('Location denied'))
      );
    });
  }
}
