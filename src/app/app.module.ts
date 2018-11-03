//NGANGULAR
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { MaterialModule } from './material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

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
import { TeamService } from './services/team/team.service';
import { PlayerService } from './services/player/player.service';
import { TranferService } from './services/tranfer/tranfer.service';

//ROUTINGS
import { AppRoutingModule } from './app-routing.module';

//COMPONENTS
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { NavLFGNComponent } from './nav-lfgn/nav-lfgn/nav-lfgn.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { FieldsComponent, AddFieldDialog, DeleteFieldDialog, EditFieldDialog } from './nav-lfgn/fields/fields.component';
import { TeamsComponent, AddTeamDialog, DeleteTeamDialog, EditTeamDialog } from './nav-lfgn/teams/teams.component';
import { TeamDetailsComponent, AddPlayerDialog, DropPlayerDialog } from './nav-lfgn/teams/team-details/team-details.component';
import { TranfersComponent, AddTranferDialog } from './nav-lfgn/tranfers/tranfers.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    NavLFGNComponent,
    NotFoundComponent,
    FieldsComponent,
    AddFieldDialog,
    DeleteFieldDialog,
    EditFieldDialog,
    TeamsComponent,
    AddTeamDialog,
    DeleteTeamDialog,
    EditTeamDialog,
    TeamDetailsComponent,
    AddPlayerDialog,
    DropPlayerDialog,
    TranfersComponent,
    AddTranferDialog
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
  entryComponents: [AddFieldDialog, DeleteFieldDialog, EditFieldDialog, AddTeamDialog, DeleteTeamDialog, EditTeamDialog, AddPlayerDialog, DropPlayerDialog, AddTranferDialog],
  providers: [AuthService, AuthGuard, FieldService, TeamService, PlayerService, TranferService],
  bootstrap: [AppComponent]
})
export class AppModule { }
