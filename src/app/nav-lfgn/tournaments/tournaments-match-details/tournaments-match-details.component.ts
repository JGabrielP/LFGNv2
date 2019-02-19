import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TeamService } from 'src/app/services/team/team.service';
import { Observable } from 'rxjs';
import { Team } from 'src/app/models/team/team';
import { TournamentService } from 'src/app/services/tournament/tournament.service';
import { Match } from 'src/app/models/match/match';
import { Validators, FormBuilder, FormControl } from '@angular/forms';
import { Field } from 'src/app/models/field/field';
import { FieldService } from 'src/app/services/field/field.service';
import { MatchService } from 'src/app/services/match/match.service';
import { MatSnackBar, MatDialog, MatDialogRef, MatChipInputEvent } from '@angular/material';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material';
import { map, startWith } from 'rxjs/operators';
import { Player } from 'src/app/models/player/player';
import { PlayerService } from 'src/app/services/player/player.service';
import { StatisticsService } from 'src/app/services/statistics/statistics.service';
import * as firebase from 'firebase/app';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';

@Component({
  selector: 'app-tournaments-match-details',
  templateUrl: './tournaments-match-details.component.html',
  styleUrls: ['./tournaments-match-details.component.css']
})
export class TournamentsMatchDetailsComponent implements OnInit {

  public teamLocal: Observable<Team[]>;
  public teamVisit: Observable<Team[]>;
  public tournamentName: string;
  public matchweekName: string;
  public matchId: string;
  public match: Observable<Match>;
  public fields: Observable<Field[]>;
  public finalFinished: boolean = false;
  public expansionActive: boolean = false;
  public toggleCtrl = new FormControl();
  public buttonDisabled: boolean = false;

  public MatchCtrl = this._formBuilder.group({
    matchDateCtrl: ['', Validators.required],
    matchHourCtrl: ['', Validators.required],
    matchMinutesCtrl: ['00', Validators.required],
    matchFieldCtrl: ['', Validators.required]
  });

  public visible = true;
  public selectable = true;
  public removable = true;
  public addOnBlur = true;
  public separatorKeysCodes: number[] = [ENTER, COMMA];

  @ViewChild('playersGoalLocalInput') playersGoalLocalInput: ElementRef<HTMLInputElement>;
  public goalsLocalCtrl = new FormControl();
  public filteredGoalsLocal: Observable<Player[]>;
  public playersGoalLocal: Player[] = [];
  public allPlayersLocal: Player[];

  @ViewChild('playersGoalVisitInput') playersGoalVisitInput: ElementRef<HTMLInputElement>;
  public goalsVisitCtrl = new FormControl();
  public filteredGoalsVisit: Observable<Player[]>;
  public playersGoalVisit: Player[] = [];
  public allPlayersVisit: Player[];

  @ViewChild('playersYLocalInput') playersYLocalInput: ElementRef<HTMLInputElement>;
  public YLocalCtrl = new FormControl();
  public filteredYLocal: Observable<Player[]>;
  public playersYLocal: Player[] = [];
  public allPlayersYLocal: Player[];

  @ViewChild('playersYVisitInput') playersYVisitInput: ElementRef<HTMLInputElement>;
  public YVisitCtrl = new FormControl();
  public filteredYVisit: Observable<Player[]>;
  public playersYVisit: Player[] = [];
  public allPlayersYVisit: Player[];

  @ViewChild('playersRLocalInput') playersRLocalInput: ElementRef<HTMLInputElement>;
  public RLocalCtrl = new FormControl();
  public filteredRLocal: Observable<Player[]>;
  public playersRLocal: Player[] = [];
  public allPlayersRLocal: Player[];

  @ViewChild('playersRVisitInput') playersRVisitInput: ElementRef<HTMLInputElement>;
  public RVisitCtrl = new FormControl();
  public filteredRVisit: Observable<Player[]>;
  public playersRVisit: Player[] = [];
  public allPlayersRVisit: Player[];

  constructor(private afs: AngularFirestore, private afAuth: AngularFireAuth, private statisticsService: StatisticsService, private playerService: PlayerService, private route: ActivatedRoute, private teamService: TeamService, private tournamentService: TournamentService, private _formBuilder: FormBuilder, private fieldService: FieldService, private matchService: MatchService, private snackBar: MatSnackBar, private dialog: MatDialog) {
    this.playerService.getPlayers(this.route.snapshot.queryParamMap.get('local')).subscribe(players => {
      this.allPlayersLocal = players.map((playerList: Player) => playerList);
      this.allPlayersYLocal = players.map((playerList: Player) => playerList);
      this.allPlayersRLocal = players.map((playerList: Player) => playerList);
      this.filteredGoalsLocal = this.goalsLocalCtrl.valueChanges.pipe(
        startWith(null),
        map((player: string | null) => player ? this._filter(player, 1) : this.allPlayersLocal.slice()));
      this.filteredYLocal = this.YLocalCtrl.valueChanges.pipe(
        startWith(null),
        map((player: string | null) => player ? this._filter(player, 3) : this.allPlayersYLocal.slice()));
      this.filteredRLocal = this.RLocalCtrl.valueChanges.pipe(
        startWith(null),
        map((player: string | null) => player ? this._filter(player, 5) : this.allPlayersRLocal.slice()));
    });
    this.playerService.getPlayers(this.route.snapshot.queryParamMap.get('visit')).subscribe(players => {
      this.allPlayersVisit = players.map((playerList: Player) => playerList);
      this.allPlayersYVisit = players.map((playerList: Player) => playerList);
      this.allPlayersRVisit = players.map((playerList: Player) => playerList);
      this.filteredGoalsVisit = this.goalsVisitCtrl.valueChanges.pipe(
        startWith(null),
        map((player: string | null) => player ? this._filter(player, 2) : this.allPlayersVisit.slice()));
      this.filteredYVisit = this.YVisitCtrl.valueChanges.pipe(
        startWith(null),
        map((player: string | null) => player ? this._filter(player, 4) : this.allPlayersYVisit.slice()));
      this.filteredRVisit = this.RVisitCtrl.valueChanges.pipe(
        startWith(null),
        map((player: string | null) => player ? this._filter(player, 6) : this.allPlayersRVisit.slice()));
    });
  }

  async ngOnInit() {
    this.tournamentName = this.route.snapshot.queryParamMap.get('idTournament');
    this.matchweekName = this.route.snapshot.queryParamMap.get('idMatchweek');
    this.matchId = this.route.snapshot.queryParamMap.get('idMatch');
    this.teamLocal = <Observable<Team[]>>this.teamService.getTeam(this.route.snapshot.queryParamMap.get('local'));
    this.teamVisit = <Observable<Team[]>>this.teamService.getTeam(this.route.snapshot.queryParamMap.get('visit'));
    if (Number(this.route.snapshot.queryParamMap.get('idTOL')) == 1)
      this.match = this.tournamentService.getMatch(this.tournamentName, this.matchweekName, this.matchId);
    else
      this.match = this.tournamentService.getMatchLiguilla(this.tournamentName, this.matchweekName, this.matchId);
    this.match.subscribe(match => {
      if (match != undefined) {
        if (match.hasOwnProperty('Date') && match.hasOwnProperty('Field')) {
          this.MatchCtrl.get('matchDateCtrl').setValue(match.Date.toDate());
          this.MatchCtrl.get('matchHourCtrl').setValue(match.Date.toDate().getHours());
          this.MatchCtrl.get('matchMinutesCtrl').setValue(match.Date.toDate().getMinutes());
          this.MatchCtrl.get('matchFieldCtrl').setValue(match.Field);
        }
        if (match.hasOwnProperty('Finished')) {
          this.finalFinished = match.Finished;
          this.expansionActive = match.Finished;
          if (match.Finished) {
            this.playersGoalLocal = match.GoalsPlayersLocal == undefined ? [] : match.GoalsPlayersLocal;
            this.playersGoalVisit = match.GoalsPlayersVisit == undefined ? [] : match.GoalsPlayersVisit;
            this.playersYLocal = match.YCardsLocal == undefined ? [] : match.YCardsLocal;
            this.playersYVisit = match.YCardsVisit == undefined ? [] : match.YCardsVisit;
            this.playersRLocal = match.RCardsLocal == undefined ? [] : match.RCardsLocal;
            this.playersRVisit = match.RCardsVisit == undefined ? [] : match.RCardsVisit;
          }
        }
      }
    });
    this.fields = this.fieldService.get();
  }

  async setMatch() {
    if (this.MatchCtrl.valid) {
      this.openSnackbar("Guardando información...", "Espere");
      let date: Date = this.MatchCtrl.get('matchDateCtrl').value;
      date.setHours(this.MatchCtrl.get('matchHourCtrl').value);
      date.setMinutes(this.MatchCtrl.get('matchMinutesCtrl').value);
      if (Number(this.route.snapshot.queryParamMap.get('idTOL')) == 1)
        await this.matchService.update({ Date: date, Field: this.MatchCtrl.get('matchFieldCtrl').value }, this.tournamentName, this.matchweekName, this.matchId);
      else
        await this.matchService.updateMatchLiguilla({ Date: date, Field: this.MatchCtrl.get('matchFieldCtrl').value }, this.tournamentName, this.matchweekName, this.matchId);
      this.openSnackbar("Guardado", "Hecho");
    }
  }

  private openSnackbar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 3000,
    });
  }

  private openSnackbarSave(message: string, action: string) {
    this.snackBar.open(message, action);
  }

  onChange() {
    this.expansionActive = this.toggleCtrl.value;
  }

  add(event: MatChipInputEvent, caseType: number, team: Team): void {
    let input = event.input;
    let value = event.value;
    switch (caseType) {
      case 1:
        if ((value || '').trim()) {
          this.playersGoalLocal.push({
            Id: Math.random().toString(),
            Name: value.trim(),
            FirstName: '',
            LastName: '',
            BirthDate: new Date,
            Team: { Name: team.Name, Id: team.Id, LogoUrl: team.LogoUrl },
            Folio: 0
          });
        }
        if (input) input.value = '';
        this.goalsLocalCtrl.setValue(null);
        break;
      case 2:
        if ((value || '').trim()) {
          this.playersGoalVisit.push({
            Id: Math.random().toString(),
            Name: value.trim(),
            FirstName: '',
            LastName: '',
            BirthDate: new Date,
            Team: { Name: team.Name, Id: team.Id, LogoUrl: team.LogoUrl },
            Folio: 0
          });
        }
        if (input) input.value = '';
        this.goalsVisitCtrl.setValue(null);
        break;
      default:
        break;
    }

  }

  remove(index: number, caseType: number): void {
    switch (caseType) {
      case 1:
        this.playersGoalLocal.splice(index, 1);
        break;
      case 2:
        this.playersGoalVisit.splice(index, 1);
        break;
      case 3:
        this.playersYLocal.splice(index, 1);
        break;
      case 4:
        this.playersYVisit.splice(index, 1);
        break;
      case 5:
        this.playersRLocal.splice(index, 1);
        break;
      case 6:
        this.playersRVisit.splice(index, 1);
        break;
      default:
        break;
    }
  }

  selected(event: MatAutocompleteSelectedEvent, caseType: number): void {
    switch (caseType) {
      case 1:
        this.playersGoalLocal.push(event.option.value);
        this.playersGoalLocalInput.nativeElement.value = '';
        this.goalsLocalCtrl.setValue(null);
        break;
      case 2:
        this.playersGoalVisit.push(event.option.value);
        this.playersGoalVisitInput.nativeElement.value = '';
        this.goalsVisitCtrl.setValue(null);
        break;
      case 3:
        this.playersYLocal.push(event.option.value);
        this.playersYLocalInput.nativeElement.value = '';
        this.YLocalCtrl.setValue(null);
        break;
      case 4:
        this.playersYVisit.push(event.option.value);
        this.playersYVisitInput.nativeElement.value = '';
        this.YVisitCtrl.setValue(null);
        break;
      case 5:
        this.playersRLocal.push(event.option.value);
        this.playersRLocalInput.nativeElement.value = '';
        this.RLocalCtrl.setValue(null);
        break;
      case 6:
        this.playersRVisit.push(event.option.value);
        this.playersRVisitInput.nativeElement.value = '';
        this.RVisitCtrl.setValue(null);
        break;
      default:
        break;
    }
  }

  private _filter(value: any, caseType: number): Player[] {
    switch (caseType) {
      case 1:
        return this.allPlayersLocal.filter(player => player.Name.toLowerCase().includes(value));
      case 2:
        return this.allPlayersVisit.filter(player => player.Name.toLowerCase().includes(value));
      case 3:
        return this.allPlayersYLocal.filter(player => player.Name.toLowerCase().includes(value));
      case 4:
        return this.allPlayersYVisit.filter(player => player.Name.toLowerCase().includes(value));
      case 5:
        return this.allPlayersRLocal.filter(player => player.Name.toLowerCase().includes(value));
      case 6:
        return this.allPlayersRVisit.filter(player => player.Name.toLowerCase().includes(value));
      default:
        break;
    }
  }

  async setResult() {
    this.buttonDisabled = true;
    if (Number(this.route.snapshot.queryParamMap.get('idTOL')) == 1) {
      await this.matchService.update({ RCardsLocal: this.playersRLocal, RCardsVisit: this.playersRVisit, YCardsLocal: this.playersYLocal, YCardsVisit: this.playersYVisit, GoalsPlayersLocal: this.playersGoalLocal, GoalsPlayersVisit: this.playersGoalVisit, Finished: true, GoalsLocal: this.playersGoalLocal.length, GoalsVisit: this.playersGoalVisit.length }, this.tournamentName, this.matchweekName, this.matchId);
      await this.setLeaderBoard();
    } else {
      this.openSnackbarSave("Guardando información...", "Espere");
      await this.matchService.updateMatchLiguilla({ RCardsLocal: this.playersRLocal, RCardsVisit: this.playersRVisit, YCardsLocal: this.playersYLocal, YCardsVisit: this.playersYVisit, GoalsPlayersLocal: this.playersGoalLocal, GoalsPlayersVisit: this.playersGoalVisit, Finished: true, GoalsLocal: this.playersGoalLocal.length, GoalsVisit: this.playersGoalVisit.length }, this.tournamentName, this.matchweekName, this.matchId);
      await this.tournamentService.setLiguilla(this.tournamentName, this.matchweekName);
      this.openSnackbar("Partido finalizado.", "Hecho");
    }
    this.buttonDisabled = false;
  }

  async openFinishDefaultDialog() {
    const dialogRef = this.dialog.open(FinishDefaultDialog);
    dialogRef.afterClosed().subscribe(async (result: string) => {
      if (result != null) {
        if (Number(this.route.snapshot.queryParamMap.get('idTOL')) == 1) {
          if (!result.localeCompare('Local'))
            await this.afs.collection(this.afAuth.auth.currentUser.email).doc(this.afAuth.auth.currentUser.uid).collection('tournaments').doc(this.tournamentName).collection('Jornadas').doc(this.matchweekName).collection('Partidos').doc(this.matchId).update({ Finished: true, GoalsLocal: 3, GoalsVisit: 0, YCardsLocal: firebase.firestore.FieldValue.delete(), YCardsVisit: firebase.firestore.FieldValue.delete(), RCardsLocal: firebase.firestore.FieldValue.delete(), RCardsVisit: firebase.firestore.FieldValue.delete(), GoalsPlayersLocal: firebase.firestore.FieldValue.delete(), GoalsPlayersVisit: firebase.firestore.FieldValue.delete() });
          if (!result.localeCompare('Visit'))
            await this.afs.collection(this.afAuth.auth.currentUser.email).doc(this.afAuth.auth.currentUser.uid).collection('tournaments').doc(this.tournamentName).collection('Jornadas').doc(this.matchweekName).collection('Partidos').doc(this.matchId).update({ Finished: true, GoalsLocal: 0, GoalsVisit: 3, YCardsLocal: firebase.firestore.FieldValue.delete(), YCardsVisit: firebase.firestore.FieldValue.delete(), RCardsLocal: firebase.firestore.FieldValue.delete(), RCardsVisit: firebase.firestore.FieldValue.delete(), GoalsPlayersLocal: firebase.firestore.FieldValue.delete(), GoalsPlayersVisit: firebase.firestore.FieldValue.delete() });
          await this.setLeaderBoard();
        } else {
          if (!result.localeCompare('Local')) {
            this.openSnackbarSave("Guardando información...", "Espere");
            await this.afs.collection(this.afAuth.auth.currentUser.email).doc(this.afAuth.auth.currentUser.uid).collection('liguillas').doc(this.tournamentName).collection(this.matchweekName).doc(this.matchId).update({ Finished: true, GoalsLocal: 3, GoalsVisit: 0, YCardsLocal: firebase.firestore.FieldValue.delete(), YCardsVisit: firebase.firestore.FieldValue.delete(), RCardsLocal: firebase.firestore.FieldValue.delete(), RCardsVisit: firebase.firestore.FieldValue.delete(), GoalsPlayersLocal: firebase.firestore.FieldValue.delete(), GoalsPlayersVisit: firebase.firestore.FieldValue.delete() });
            await this.tournamentService.setLiguilla(this.tournamentName, this.matchweekName);
            this.openSnackbar("Partido finalizado.", "Hecho");
          }
          if (!result.localeCompare('Visit')) {
            this.openSnackbarSave("Guardando información...", "Espere");
            await this.afs.collection(this.afAuth.auth.currentUser.email).doc(this.afAuth.auth.currentUser.uid).collection('liguillas').doc(this.tournamentName).collection(this.matchweekName).doc(this.matchId).update({ Finished: true, GoalsLocal: 0, GoalsVisit: 3, YCardsLocal: firebase.firestore.FieldValue.delete(), YCardsVisit: firebase.firestore.FieldValue.delete(), RCardsLocal: firebase.firestore.FieldValue.delete(), RCardsVisit: firebase.firestore.FieldValue.delete(), GoalsPlayersLocal: firebase.firestore.FieldValue.delete(), GoalsPlayersVisit: firebase.firestore.FieldValue.delete() });
            await this.tournamentService.setLiguilla(this.tournamentName, this.matchweekName);
            this.openSnackbar("Partido finalizado.", "Hecho");
          }
        }
      }
    });
  }

  async setLeaderBoard() {
    this.openSnackbarSave("Guardando información...", "Espere");
    await this.statisticsService.setLeaderboard(this.tournamentName);
    return this.openSnackbar("Partido finalizado.", "Hecho");
  }
}

@Component({
  selector: 'finish-default-dialog',
  templateUrl: '../dialogs/finish-default-dialog.html'
})
export class FinishDefaultDialog {

  constructor(private dialogRef: MatDialogRef<FinishDefaultDialog>) { }

  clickLocal(): void {
    this.dialogRef.close('Local');
  }

  clickVisit(): void {
    this.dialogRef.close('Visit');
  }

  onNoClick(): void {
    this.dialogRef.close(null);
  }
}