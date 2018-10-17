//NGANGULAR
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { MaterialModule } from './material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

//FIREBASE
import { AngularFireModule } from '@angular/fire';
import { environment } from '../environments/environment';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { AngularFirestoreModule } from '@angular/fire/firestore';

//SERVICES
import { AuthService } from './services/auth/auth.service';
import { AuthGuard } from './services/guard/auth.guard';
import { FieldService } from './services/field/field.service';

//ROUTINGS
import { AppRoutingModule } from './app-routing.module';

//COMPONENTS
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { NavLFGNComponent } from './nav-lfgn/nav-lfgn/nav-lfgn.component';
import { FirstPageComponent } from './nav-lfgn/first-page/first-page.component';
import { SecondPageComponent } from './nav-lfgn/second-page/second-page.component';
import { ThirdPageComponent } from './nav-lfgn/third-page/third-page.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { FieldsComponent, AddFieldDialog, DeleteFieldDialog, EditFieldDialog } from './nav-lfgn/fields/fields.component';
import { FieldResolveService } from './services/field/field-resolve.service';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    NavLFGNComponent,
    FirstPageComponent,
    SecondPageComponent,
    ThirdPageComponent,
    NotFoundComponent,
    FieldsComponent,
    AddFieldDialog,
    DeleteFieldDialog,
    EditFieldDialog
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    AngularFireStorageModule,
    AngularFirestoreModule,
    MaterialModule,
    AppRoutingModule
  ],
  entryComponents: [AddFieldDialog, DeleteFieldDialog, EditFieldDialog],
  providers: [AuthService, AuthGuard, FieldService, FieldResolveService],
  bootstrap: [AppComponent]
})
export class AppModule { }
