import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { map } from 'rxjs/operators';
import { AuthService } from '../../services/auth/auth.service';
import { Router, NavigationStart, NavigationEnd, Event, RouterEvent } from '@angular/router';

@Component({
  selector: 'app-nav-lfgn',
  templateUrl: './nav-lfgn.component.html',
  styleUrls: ['./nav-lfgn.component.css']
})
export class NavLFGNComponent {

  private imageUrl: Observable<string | null>;
  private uploadPercent: Observable<number>;
  private email: string;
  show: boolean = true;

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset).pipe(map(result => result.matches));

  constructor(private breakpointObserver: BreakpointObserver, private authService: AuthService, private router: Router) {
    this.email = this.authService.afAuth.auth.currentUser.email;
    this.router.events.subscribe((routerEvent: Event) => {
      if (routerEvent instanceof NavigationStart) {
        this.show = true;
        console.log("Show true");
      }
      if (routerEvent instanceof NavigationEnd){
        this.show = false;
        console.log("Show false");
      }
    });
  }

  ngOnInit() {
    this.imageUrl = this.authService.getImage();
  }

  private logout() {
    this.authService.logout();
  }

  private uploadImage(event) {
    this.authService.setImage(event.target.files[0]).snapshotChanges().pipe(
      finalize(() => this.imageUrl = this.authService.getImage())
    ).subscribe();
  }

}
