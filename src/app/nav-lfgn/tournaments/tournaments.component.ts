import { Component, OnInit } from '@angular/core';
import { TournamentService } from 'src/app/services/tournament/tournament.service';
import { MatDialogRef, MatDialog, MatSnackBar } from '@angular/material';
import { FormBuilder, Validators } from '@angular/forms';
import { FieldService } from 'src/app/services/field/field.service';
import { Observable } from 'rxjs';
import { Field } from 'src/app/models/field/field';
import { Router } from '@angular/router';
import { Team } from 'src/app/models/team/team';

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

  async getTournament(tournamentName: string) {
    this.jornadas = await this.tournamentService.get(tournamentName);
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(AddTournamentDialog);
    dialogRef.afterClosed().subscribe(result => {
      if (result != null)
        this.openSnackbar('Torneo generado exitosamente.');
    });
  }

  private openSnackbar(message: string) {
    this.snackBar.open(message, "Hecho", {
      duration: 3000,
    });
  }

  onInformation(IdMatchweek: string, IdMatch: string, local: Team, visit: Team) {
    this.router.navigate(['dashboard/tournaments/matchDetail'], {
      queryParams: {
        idTournament: this.currentTournament,
        idMatchweek: IdMatchweek,
        idMatch: IdMatch,
        local: local.Id,
        visit: visit.Id
      }
    });
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
    nCardsCtrl: ['', Validators.required]
  });

  constructor(private dialogRef: MatDialogRef<AddTournamentDialog>, private _formBuilder: FormBuilder, private tournamentService: TournamentService) { }

  async add() {
    if (this.tournamentCtrl.valid) {
      await this.tournamentService.set(
        this.tournamentCtrl.get('nVueltasCtrl').value,
        this.tournamentCtrl.get('nTeamsCtrl').value,
        this.tournamentCtrl.get('nCardsCtrl').value,
        this.tournamentCtrl.get('nameCtrl').value
      );
      return this.dialogRef.close('Ok');
    }
  }

  onNoClick(): void {
    this.dialogRef.close(null);
  }
}