import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { TranferService } from 'src/app/services/tranfer/tranfer.service';
import { MatDialogRef, MatDialog, MatSnackBar } from '@angular/material';
import { Team } from 'src/app/models/team/team';
import { TeamService } from 'src/app/services/team/team.service';
import { PlayerService } from 'src/app/services/player/player.service';
import { FormControl, Validators } from '@angular/forms';
import { Player } from 'src/app/models/player/player';
import { Tranfer } from 'src/app/models/tranfer/tranfer';

@Component({
  selector: 'app-tranfers',
  templateUrl: './tranfers.component.html',
  styleUrls: ['./tranfers.component.css']
})
export class TranfersComponent implements OnInit {

  public tranfers: Observable<Tranfer[]>;

  constructor(private tranferService: TranferService, private dialog: MatDialog, private teamService: TeamService, private snackBar: MatSnackBar, private playerService: PlayerService) { }

  ngOnInit() {
    this.tranfers = this.tranferService.get();
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(AddTranferDialog, { width: '500px' });
    dialogRef.afterClosed().subscribe(result => {
      if (result != null)
        this.openSnackbar("Transferencia realizada correctamente.");
    });
  }

  private openSnackbar(message: string) {
    this.snackBar.open(message, "Hecho", {
      duration: 3000,
    });
  }
}

@Component({
  selector: 'add-tranfer-dialog',
  templateUrl: 'dialogs/add-tranfers-dialog.html',
  styleUrls: ['dialogs/add-tranfers-dialog.css']

})
export class AddTranferDialog {

  public playerCurpCtrl = new FormControl('', [Validators.required, Validators.minLength(18)], this.ifPlayerExists.bind(this));
  public teamDestinCtrl = new FormControl('', [Validators.required]);
  public player: Player[];
  public teamsDestin: Observable<Team[]>;
  public teamSource: Team = { Id: '', Name: '' };
  public show: boolean = true;

  constructor(private dialogRef: MatDialogRef<AddTranferDialog>, private playerService: PlayerService, private teamService: TeamService, private tranferService: TranferService, private snackBar: MatSnackBar) { }

  onNoClick(): void {
    this.dialogRef.close(null);
  }

  async tranfer() {
    if (this.teamDestinCtrl.valid) {
      this.openSnackbar("Transfiriendo...");
      await this.tranferService.set({ Player: this.player[0], TeamSource: this.teamSource, TeamDestin: this.teamDestinCtrl.value, Date: new Date() });
      await this.playerService.edit(this.player[0].Id, { Team: this.teamDestinCtrl.value });
      this.dialogRef.close('Ok');
    }
  }

  private getErrorMessage() {
    return this.playerCurpCtrl.hasError('required') ? 'Debe introducir un valor' :
      this.playerCurpCtrl.hasError('minlength') ? 'Deben ser 18 caracteres' :
        this.playerCurpCtrl.hasError('exists') ? 'Jugador no existente' :
          '';
  }

  async searchPlayer() {
    if (this.playerCurpCtrl.valid) {
      await this.playerService.getPlayer(this.playerCurpCtrl.value).subscribe((player: Player[]) => {
        this.player = player;
        this.teamSource = player[0].Team;
        this.teamsDestin = this.teamService.get();
        this.show = false;
      });
    }
  }

  async ifPlayerExists() {
    const res = await this.playerService.ifExists(this.playerCurpCtrl.value);
    if (!res)
      return { exists: true };
  }

  private openSnackbar(message: string) {
    this.snackBar.open(message, "Espere");
  }
}