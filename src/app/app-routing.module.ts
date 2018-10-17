import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { NavLFGNComponent } from './nav-lfgn/nav-lfgn/nav-lfgn.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { FieldsComponent } from './nav-lfgn/fields/fields.component';
import { FirstPageComponent } from './nav-lfgn/first-page/first-page.component';
import { SecondPageComponent } from './nav-lfgn/second-page/second-page.component';
import { ThirdPageComponent } from './nav-lfgn/third-page/third-page.component';
import { AuthGuard } from './services/guard/auth.guard';
import { FieldResolveService } from './services/field/field-resolve.service';

const routes: Routes = [
  { path: '', redirectTo: 'auth', pathMatch: 'full' },
  {
    path: 'dashboard', component: NavLFGNComponent, canActivate: [AuthGuard], children: [
      { path: '', redirectTo: 'uno', pathMatch: 'full', canActivate: [AuthGuard] },
      {
        path: 'fields', component: FieldsComponent, resolve: { campos: FieldResolveService }, canActivateChild: [AuthGuard]
      },
      { path: 'uno', component: FirstPageComponent, canActivateChild: [AuthGuard] },
      { path: 'dos', component: SecondPageComponent, canActivateChild: [AuthGuard] },
      { path: 'tres', component: ThirdPageComponent, canActivateChild: [AuthGuard] },
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
