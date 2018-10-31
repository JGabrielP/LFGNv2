import { NgModule } from '@angular/core';
import { RouterModule, Routes, ChildActivationEnd } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { NavLFGNComponent } from './nav-lfgn/nav-lfgn/nav-lfgn.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { FieldsComponent } from './nav-lfgn/fields/fields.component';
import { TeamsComponent } from './nav-lfgn/teams/teams.component';
import { TeamDetailsComponent } from './nav-lfgn/teams/team-details/team-details.component';
import { AuthGuard } from './services/guard/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: 'auth', pathMatch: 'full' },
  {
    path: 'dashboard', component: NavLFGNComponent, canActivate: [AuthGuard], children: [
      { path: '', redirectTo: 'fields', pathMatch: 'full', canActivate: [AuthGuard] },
      { path: 'fields', component: FieldsComponent, canActivateChild: [AuthGuard] },
      { path: 'teams', children: [
          { path: '', component: TeamsComponent, canActivateChild: [AuthGuard] },
          { path: ':id', component: TeamDetailsComponent, canActivateChild: [AuthGuard] }
        ]
      }
    ]
  },
  { path: 'auth', component: LoginComponent },
  { path: '**', component: NotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
