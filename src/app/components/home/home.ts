import { Component, computed, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ErrandService } from '../../services/errand.service';
import { DevUserService } from '../../services/dev-user.service';
import { ERRAND_STATUS_LABELS, CATEGORY_LABELS } from '../../constants/errand.constant';
import { AppUser } from '../../models/customer.model';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-home',
  imports: [RouterLink, DatePipe],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  private readonly errandService = inject(ErrandService);
  private readonly devUser = inject(DevUserService);
  private readonly userService = inject(UserService);
 
  readonly today = new Date();
 
  // Feed cards + this dashboard both read the same signal, so claiming an
  // errand from the feed updates this card immediately -- no refetch here.
  readonly activeErrand = this.errandService.activeErrand;
 
  // Set by UserService.getById() in ngOnInit below; nav avatar / profile
  // screen can read this same signal instead of each fetching separately.
  readonly currentUser = this.userService.currentUser;
 
  readonly statusLabels = ERRAND_STATUS_LABELS;
  readonly categoryLabels = CATEGORY_LABELS;
 
  ngOnInit(): void {
    this.userService.getById(this.devUser.currentUserId());
 
    // TODO(api): there's no GET /errands/mine (or similar) yet, so on a
    // fresh page load activeErrand() will be null until the user claims/
    // creates/views an errand elsewhere in the app. Once that endpoint
    // exists, fetch it here too and set errandService.activeErrand.
  }
}
