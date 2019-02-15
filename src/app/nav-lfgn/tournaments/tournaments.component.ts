import { Component, OnInit, Inject } from '@angular/core';
import { TournamentService } from 'src/app/services/tournament/tournament.service';
import { MatDialogRef, MatDialog, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, Validators } from '@angular/forms';
import { FieldService } from 'src/app/services/field/field.service';
import { Observable, of } from 'rxjs';
import { Field } from 'src/app/models/field/field';
import { Router } from '@angular/router';
import { Team } from 'src/app/models/team/team';
import { TeamService } from 'src/app/services/team/team.service';

@Component({
  selector: 'app-tournaments',
  templateUrl: './tournaments.component.html',
  styleUrls: ['./tournaments.component.css']
})
export class TournamentsComponent implements OnInit {
  public tournaments;
  public jornadas: Observable<any[]>;
  public currentTournament;
  public fields: Observable<Field[]>;
  public liguillaCuartos: Observable<any[]>;
  public liguillaSemifinales: Observable<any[]>;
  public liguillaFinal: Observable<any[]>;
  public champion: Observable<any[]>;

  constructor(private tournamentService: TournamentService, private dialog: MatDialog, private snackBar: MatSnackBar, private fieldService: FieldService, private router: Router) { }

  async ngOnInit() {
    this.tournaments = await this.tournamentService.getTournaments();
    this.tournaments.subscribe(r => {
      if (r.length > 0) {
        this.currentTournament = r[0].Name;
        this.getTournament(this.currentTournament);
      }
    });
    this.fields = this.fieldService.get();
  }

  getLiguilla(tournamentName: string) {
    this.liguillaCuartos = this.tournamentService.getLiguillaCuartos(tournamentName);
    this.liguillaSemifinales = this.tournamentService.getLiguillaSemifinales(tournamentName);
    this.liguillaFinal = this.tournamentService.getLiguillaFinal(tournamentName);
    this.champion = this.tournamentService.getChampion(tournamentName);
  }

  async getTournament(tournamentName: string) {
    this.getLiguilla(this.currentTournament);
    this.jornadas = of([]);
    this.jornadas = await this.tournamentService.get(tournamentName);
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(AddTournamentDialog);
    dialogRef.afterClosed().subscribe(result => {
      if (result == 'Ok') {
        this.openSnackbar('Generando torneo...', 'Espere').afterDismissed().subscribe(x => {
          this.openSnackbar('Torneo generado exitosamente.', 'Hecho');
        });
      } else if (result == 'error') {
        this.openSnackbar('Torneo no creado. Verifique la cantidad de equipos registrados.', 'Error');
      }
    });
  }

  private openSnackbar(message: string, msg2: string) {
    return this.snackBar.open(message, msg2, {
      duration: 6000,
    });
  }

  private openSnackbar2(message: string) {
    this.snackBar.open(message, "Espere");
  }

  onInformation(IdMatchweek: string, IdMatch: string, local: Team, visit: Team, id: number) {
    this.router.navigate(['dashboard/tournaments/matchDetail'], {
      queryParams: {
        idTournament: this.currentTournament,
        idMatchweek: IdMatchweek,
        idMatch: IdMatch,
        local: local.Id,
        visit: visit.Id,
        idTOL: id
      }
    });
  }

  openDeleteDialog(tournament: string) {
    if (this.currentTournament != undefined) {
      const dialogRef = this.dialog.open(DeleteTournamentDialog, { data: tournament });
      dialogRef.afterClosed().subscribe(async result => {
        if (result != null) {
          this.openSnackbar2("Eliminando torneo...");
          this.jornadas = of([]);
          this.liguillaCuartos = of([]);
          this.liguillaSemifinales = of([]);
          this.liguillaFinal = of([]);
          this.champion = of([]);
          await this.tournamentService.delete(result);
          this.openSnackbar("Torneo eliminado correctamente.", 'Hecho');
          this.currentTournament = undefined;
        }
      });
    }
  }
}

@Component({
  selector: 'dialogs/add-tournament-dialog',
  templateUrl: 'dialogs/add-tournament-dialog.html',
  styleUrls: ['dialogs/add-tournament-dialog.css']
})
export class AddTournamentDialog {

  public tournamentCtrl = this._formBuilder.group({
    nameCtrl: ['', Validators.required],
    nVueltasCtrl: ['', Validators.required],
    nTeamsCtrl: ['', Validators.required],
    nCardsCtrl: ['', Validators.required],
    nTimesLiguillaCtrl: ['', Validators.required]
  });

  constructor(private teamsService: TeamService, private dialogRef: MatDialogRef<AddTournamentDialog>, private _formBuilder: FormBuilder, private tournamentService: TournamentService) { }

  async add() {
    if (this.tournamentCtrl.valid) {
      this.teamsService.getOnly().subscribe(async teams => {
        if (teams.size > 0) {
          await this.tournamentService.set(
            this.tournamentCtrl.get('nVueltasCtrl').value,
            this.tournamentCtrl.get('nTeamsCtrl').value,
            this.tournamentCtrl.get('nCardsCtrl').value,
            this.tournamentCtrl.get('nameCtrl').value,
            this.tournamentCtrl.get('nTimesLiguillaCtrl').value
          );
          return this.dialogRef.close('Ok');
        } else {
          return this.dialogRef.close('error');
        }
      });
    }
  }

  onNoClick(): void {
    this.dialogRef.close(null);
  }
}

@Component({
  selector: 'dialogs/delete-tournament-dialog',
  templateUrl: 'dialogs/delete-tournament-dialog.component.html'
})
export class DeleteTournamentDialog {

  constructor(private dialogRef: MatDialogRef<DeleteTournamentDialog>, @Inject(MAT_DIALOG_DATA) public data: Field) { }

  onNoClick(): void {
    this.dialogRef.close(null);
  }
}