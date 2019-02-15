//NGANGULAR
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { MaterialModule } from './material.module';
import 'hammerjs';
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
import { FinancesService } from './services/finances/finances.service';
import { TournamentService } from './services/tournament/tournament.service';
import { MatchService } from './services/match/match.service';
import { StatisticsService } from './services/statistics/statistics.service';

//ROUTINGS
import { AppRoutingModule } from './app-routing.module';

//COMPONENTS
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { NavLFGNComponent } from './nav-lfgn/nav-lfgn/nav-lfgn.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { FieldsComponent, AddFieldDialog, DeleteFieldDialog, EditFieldDialog } from './nav-lfgn/fields/fields.component';
import { TeamsComponent, AddTeamDialog, DeleteTeamDialog, EditTeamDialog } from './nav-lfgn/teams/teams.component';
import { TeamDetailsComponent, AddPlayerDialog, DropPlayerDialog, EditPlayerDialog } from './nav-lfgn/teams/team-details/team-details.component';
import { TranfersComponent, AddTranferDialog } from './nav-lfgn/tranfers/tranfers.component';
import { FinancesComponent, AddConceptDialog } from './nav-lfgn/finances/finances.component';
import { TournamentsComponent, AddTournamentDialog, DeleteTournamentDialog } from './nav-lfgn/tournaments/tournaments.component';
import { TournamentsMatchDetailsComponent, FinishDefaultDialog } from './nav-lfgn/tournaments/tournaments-match-details/tournaments-match-details.component';
import { StatisticsComponent } from './nav-lfgn/statistics/statistics.component';
import { DashboardComponent } from './nav-lfgn/dashboard/dashboard.component';

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
    EditPlayerDialog,
    TranfersComponent,
    AddTranferDialog,
    FinancesComponent,
    AddConceptDialog,
    TournamentsComponent,
    AddTournamentDialog,
    DeleteTournamentDialog,
    TournamentsMatchDetailsComponent,
    FinishDefaultDialog,
    StatisticsComponent,
    DashboardComponent
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
  entryComponents: [AddFieldDialog, DeleteFieldDialog, EditFieldDialog, AddTeamDialog, DeleteTeamDialog, EditTeamDialog, AddPlayerDialog, DropPlayerDialog, EditPlayerDialog, AddTranferDialog, AddConceptDialog, AddTournamentDialog, DeleteTournamentDialog, FinishDefaultDialog],
  providers: [AuthService, AuthGuard, FieldService, TeamService, PlayerService, TranferService, FinancesService, TournamentService, MatchService, StatisticsService],
  bootstrap: [AppComponent]
})
export class AppModule { }
