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
import { MatSnackBar, MatDialog, MatDialogRef } from '@angular/material';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material';
import { map, startWith } from 'rxjs/operators';
import { Player } from 'src/app/models/player/player';
import { PlayerService } from 'src/app/services/player/player.service';
import { StatisticsService } from 'src/app/services/statistics/statistics.service';
import * as firebase from 'firebase/app';
import { AngularFirestore } from '@angular/fire/firestore';

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

  public goalsLocalCtrl = new FormControl();
  public filteredGoalsLocal: Observable<Player[]>;
  public playersGoalLocal: Player[] = [];
  public playersLocal: Player[];

  public goalsVisitCtrl = new FormControl();
  public filteredGoalsVisit: Observable<Player[]>;
  public playersGoalVisit: Player[] = [];
  public playersVisit: Player[];

  public cardYLocalCtrl = new FormControl();
  public filteredcardYLocal: Observable<Player[]>;
  public playerscardYLocal: Player[] = [];
  public playersYLocal: Player[];

  public cardYVisitCtrl = new FormControl();
  public filteredcardYVisit: Observable<Player[]>;
  public playerscardYVisit: Player[] = [];
  public playersYVisit: Player[];

  public cardRLocalCtrl = new FormControl();
  public filteredcardRLocal: Observable<Player[]>;
  public playerscardRLocal: Player[] = [];
  public playersRLocal: Player[];

  public cardRVisitCtrl = new FormControl();
  public filteredcardRVisit: Observable<Player[]>;
  public playerscardRVisit: Player[] = [];
  public playersRVisit: Player[];

  @ViewChild('fruitInput') fruitInput: ElementRef<HTMLInputElement>;
  @ViewChild('VisitInput') VisitInput: ElementRef<HTMLInputElement>;
  @ViewChild('YLocalInput') YLocalInput: ElementRef<HTMLInputElement>;
  @ViewChild('YVisitInput') YVisitInput: ElementRef<HTMLInputElement>;
  @ViewChild('RLocalInput') RLocalInput: ElementRef<HTMLInputElement>;
  @ViewChild('RVisitInput') RVisitInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;
  @ViewChild('autoVisit') matAutocompleteVisit: MatAutocomplete;
  @ViewChild('autoYLocal') matAutocompleteYLocal: MatAutocomplete;
  @ViewChild('autoYVisit') matAutocompleteYVisit: MatAutocomplete;
  @ViewChild('autoRLocal') matAutocompleteRLocal: MatAutocomplete;
  @ViewChild('autoRVisit') matAutocompleteRVisit: MatAutocomplete;

  constructor(private afs: AngularFirestore, private statisticsService: StatisticsService, private playerService: PlayerService, private route: ActivatedRoute, private teamService: TeamService, private tournamentService: TournamentService, private _formBuilder: FormBuilder, private fieldService: FieldService, private matchService: MatchService, private snackBar: MatSnackBar, private dialog: MatDialog) {
    this.playerService.getPlayers(this.route.snapshot.queryParamMap.get('local')).subscribe(players => {
      this.playersLocal = players.map((playerList: Player) => playerList);
      this.playersYLocal = players.map((playerList: Player) => playerList);
      this.playersRLocal = players.map((playerList: Player) => playerList);

      this.filteredGoalsLocal = this.goalsLocalCtrl.valueChanges.pipe(
        startWith<string | Player>(''),
        map(value => typeof value === 'string' ? value : value.Name),
        map(player => player ? this._filter(player, 1) : this.playersLocal.slice())
      );
      this.filteredcardYLocal = this.cardYLocalCtrl.valueChanges.pipe(
        startWith<string | Player>(''),
        map(value => typeof value === 'string' ? value : value.Name),
        map(player => player ? this._filter(player, 3) : this.playersYLocal.slice()));

      this.filteredcardRLocal = this.cardRLocalCtrl.valueChanges.pipe(
        startWith<string | Player>(''),
        map(value => typeof value === 'string' ? value : value.Name),
        map(player => player ? this._filter(player, 5) : this.playersRLocal.slice()));
    });
    this.playerService.getPlayers(this.route.snapshot.queryParamMap.get('visit')).subscribe(players => {
      this.playersVisit = players.map((playerList: Player) => playerList);
      this.playersYVisit = players.map((playerList: Player) => playerList);
      this.playersRVisit = players.map((playerList: Player) => playerList);

      this.filteredGoalsVisit = this.goalsVisitCtrl.valueChanges.pipe(
        startWith<string | Player>(''),
        map(value => typeof value === 'string' ? value : value.Name),
        map(player => player ? this._filter(player, 2) : this.playersVisit.slice()));

      this.filteredcardYVisit = this.cardYVisitCtrl.valueChanges.pipe(
        startWith<string | Player>(''),
        map(value => typeof value === 'string' ? value : value.Name),
        map(player => player ? this._filter(player, 4) : this.playersYVisit.slice()));

      this.filteredcardRVisit = this.cardRVisitCtrl.valueChanges.pipe(
        startWith<string | Player>(''),
        map(value => typeof value === 'string' ? value : value.Name),
        map(player => player ? this._filter(player, 6) : this.playersRVisit.slice()));
    });
  }

  async ngOnInit() {
    this.tournamentName = this.route.snapshot.queryParamMap.get('idTournament');
    this.matchweekName = this.route.snapshot.queryParamMap.get('idMatchweek');
    this.matchId = this.route.snapshot.queryParamMap.get('idMatch');
    this.teamLocal = <Observable<Team[]>>this.teamService.getTeam(this.route.snapshot.queryParamMap.get('local'));
    this.teamVisit = <Observable<Team[]>>this.teamService.getTeam(this.route.snapshot.queryParamMap.get('visit'));
    this.match = this.tournamentService.getMatch(this.tournamentName, this.matchweekName, this.matchId);
    this.match.subscribe(date => {
      if (date.hasOwnProperty('Date') && date.hasOwnProperty('Field')) {
        this.MatchCtrl.get('matchDateCtrl').setValue(date.Date.toDate());
        this.MatchCtrl.get('matchHourCtrl').setValue(date.Date.toDate().getHours());
        this.MatchCtrl.get('matchMinutesCtrl').setValue(date.Date.toDate().getMinutes());
        this.MatchCtrl.get('matchFieldCtrl').setValue(date.Field);
      }
      if (date.hasOwnProperty('Finished')) {
        this.finalFinished = date.Finished;
        this.expansionActive = date.Finished;
      }
    });
    this.fields = this.fieldService.get();
    this.matchService.getPlayersGoals(this.tournamentName, this.matchweekName, this.matchId).subscribe(goalsLocal => {
      if (goalsLocal.data().GoalsPlayersLocal != undefined)
        this.playersGoalLocal = goalsLocal.data().GoalsPlayersLocal;
    });
    this.matchService.getPlayersGoals(this.tournamentName, this.matchweekName, this.matchId).subscribe(goalsVisit => {
      if (goalsVisit.data().GoalsPlayersVisit != undefined)
        this.playersGoalVisit = goalsVisit.data().GoalsPlayersVisit;
    });
  }

  async setMatch() {
    if (this.MatchCtrl.valid) {
      this.openSnackbar("Guardando información...", "Espere");
      let date: Date = this.MatchCtrl.get('matchDateCtrl').value;
      date.setHours(this.MatchCtrl.get('matchHourCtrl').value);
      date.setMinutes(this.MatchCtrl.get('matchMinutesCtrl').value);
      await this.matchService.update({ Date: date, Field: this.MatchCtrl.get('matchFieldCtrl').value }, this.tournamentName, this.matchweekName, this.matchId);
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

  displayFn(player?: Player): string | undefined {
    return player ? (player.Name + ' ' + player.FirstName + ' ' + player.LastName) : undefined;
  }

  remove(player: string, caseType: number): void {
    switch (caseType) {
      case 1:
        this.playersGoalLocal.splice(this.playersGoalLocal.findIndex(v => v.Id === player), 1);
        break;
      case 2:
        this.playersGoalVisit.splice(this.playersGoalVisit.findIndex(v => v.Id === player), 1);
        break;
      case 3:
        this.playerscardYLocal.splice(this.playerscardYLocal.findIndex(v => v.Id === player), 1);
        break;
      case 4:
        this.playerscardYVisit.splice(this.playerscardYVisit.findIndex(v => v.Id === player), 1);
        break;
      case 5:
        this.playerscardRLocal.splice(this.playerscardRLocal.findIndex(v => v.Id === player), 1);
        break;
      case 6:
        this.playerscardRVisit.splice(this.playerscardRVisit.findIndex(v => v.Id === player), 1);
        break;
      default:
        break;
    }
  }

  selected(event: MatAutocompleteSelectedEvent, caseType: number): void {
    switch (caseType) {
      case 1:
        this.playersGoalLocal.push(event.option.value);
        break;
      case 2:
        this.playersGoalVisit.push(event.option.value);
        break;
      case 3:
        this.playerscardYLocal.push(event.option.value);
        break;
      case 4:
        this.playerscardYVisit.push(event.option.value);
        break;
      case 5:
        this.playerscardRLocal.push(event.option.value);
        break;
      case 6:
        this.playerscardRVisit.push(event.option.value);
        break;
      default:
        break;
    }
  }

  private _filter(value: string, caseType: number): Player[] {
    const filterValue = value.toLowerCase();
    switch (caseType) {
      case 1:
        return this.playersLocal.filter(player => player.Name.toLowerCase().indexOf(filterValue) === 0);
      case 2:
        return this.playersVisit.filter(player => player.Name.toLowerCase().indexOf(filterValue) === 0);
      case 3:
        return this.playersYLocal.filter(player => player.Name.toLowerCase().indexOf(filterValue) === 0);
      case 4:
        return this.playersYVisit.filter(player => player.Name.toLowerCase().indexOf(filterValue) === 0);
      case 5:
        return this.playersRLocal.filter(player => player.Name.toLowerCase().indexOf(filterValue) === 0);
      case 6:
        return this.playersRVisit.filter(player => player.Name.toLowerCase().indexOf(filterValue) === 0);
      default:
        break;
    }
  }

  async setResult() {
    await this.matchService.update({ GoalsPlayersLocal: this.playersGoalLocal, GoalsPlayersVisit: this.playersGoalVisit, Finished: true, GoalsLocal: this.playersGoalLocal.length, GoalsVisit: this.playersGoalVisit.length }, this.tournamentName, this.matchweekName, this.matchId);
    await this.setLeaderBoard();
  }

  async openFinishDefaultDialog() {
    const dialogRef = this.dialog.open(FinishDefaultDialog);
    dialogRef.afterClosed().subscribe(async (result: string) => {
      if (result != null) {
        if (!result.localeCompare('Local'))
          await this.afs.collection('tournaments').doc(this.tournamentName).collection('Jornadas').doc(this.matchweekName).collection('Partidos').doc(this.matchId).update({ Finished: true, GoalsLocal: 2, GoalsVisit: 0, GoalsPlayersLocal: firebase.firestore.FieldValue.delete(), GoalsPlayersVisit: firebase.firestore.FieldValue.delete() });
        if (!result.localeCompare('Visit'))
          await this.afs.collection('tournaments').doc(this.tournamentName).collection('Jornadas').doc(this.matchweekName).collection('Partidos').doc(this.matchId).update({ Finished: true, GoalsLocal: 0, GoalsVisit: 2, GoalsPlayersLocal: firebase.firestore.FieldValue.delete(), GoalsPlayersVisit: firebase.firestore.FieldValue.delete() });
        await this.setLeaderBoard();
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