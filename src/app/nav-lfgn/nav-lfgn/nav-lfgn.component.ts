import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { map } from 'rxjs/operators';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-nav-lfgn',
  templateUrl: './nav-lfgn.component.html',
  styleUrls: ['./nav-lfgn.component.css']
})
export class NavLFGNComponent {

  imageUrl: Observable<string | null>;
  uploadPercent: Observable<number>;
  email: string;
  show: boolean = true;

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset).pipe(map(result => result.matches));

  constructor(private breakpointObserver: BreakpointObserver, private authService: AuthService) {
    this.email = this.authService.afAuth.auth.currentUser.email;
  }

  ngOnInit() {
    this.imageUrl = this.authService.getImage();
  }

  logout() {
    this.authService.logout();
  }

  uploadImage(event) {
    this.authService.setImage(event.target.files[0]).snapshotChanges().pipe(
      finalize(() => this.imageUrl = this.authService.getImage())
    ).subscribe();
  }
}
