import { Component, OnInit, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { TranferService } from 'src/app/services/tranfer/tranfer.service';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog, MatSnackBar } from '@angular/material';
import { Team } from 'src/app/models/team/team';
import { TeamService } from 'src/app/services/team/team.service';
import { PlayerService } from 'src/app/services/player/player.service';
import { FormControl, Validators } from '@angular/forms';
import { Player } from 'src/app/models/player/player';

@Component({
  selector: 'app-tranfers',
  templateUrl: './tranfers.component.html',
  styleUrls: ['./tranfers.component.css']
})
export class TranfersComponent implements OnInit {

  tranfers = [];

  constructor(public tranferService: TranferService, public dialog: MatDialog, public teamService: TeamService, public snackBar: MatSnackBar, public playerService: PlayerService) { }

  ngOnInit() {
    //this.tranfers = this.tranferService.get();    
    this.tranferService.get().subscribe((results) => {
      for (let i = 0; i < results.docs.length; i++) {
        const element = results.docs[i];
        this.tranfers.push(element.data());
        this.teamService.getTeam(element.data().TeamSource).subscribe(h => {
          if (element.data().TeamSource.localeCompare(''))
            this.tranfers[i].TeamSource = h[0];
          else
            this.tranfers[i].TeamSource = { Name: 'Libre' };
          this.playerService.getPlayer(element.data().Player).subscribe(g => {
            this.tranfers[i].Player = g[0];
            this.teamService.getTeam(element.data().TeamDestin).subscribe(p => {
              this.tranfers[i].TeamDestin = p[0];
            });
          });
        });
      }
    });
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

  playerCurpCtrl = new FormControl('', [Validators.required, Validators.minLength(18)], this.ifPlayerExists.bind(this));
  teamDestinCtrl = new FormControl('', [Validators.required]);
  player: Observable<Player[]>;
  play: Player;
  teamsDestin: Observable<Team[]>;
  teamSource: Team = { Id: '', Name: '' };
  show: boolean = true;

  constructor(public dialogRef: MatDialogRef<AddTranferDialog>, @Inject(MAT_DIALOG_DATA) public data: Observable<Team[]>, public playerService: PlayerService, public teamService: TeamService, public tranferService: TranferService) {
    this.teamsDestin = this.teamService.get();
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  async tranfer() {
    if (!this.teamDestinCtrl.invalid) {
      await this.tranferService.set({ Player: this.play.Id, TeamSource: this.teamSource.Id, TeamDestin: this.teamDestinCtrl.value.Id, Date: new Date().toLocaleDateString() });
      await this.playerService.edit(this.play.Id, { Team: this.teamDestinCtrl.value.Id });
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
    if (!this.playerCurpCtrl.invalid) {
      this.player = await this.playerService.getPlayer(this.playerCurpCtrl.value);
      this.player.subscribe(player => {
        this.play = player[0];
        if (player[0].Team.localeCompare("Libre")) {
          this.teamService.getTeam(player[0].Team).subscribe(team => {
            this.teamSource = team[0];
          });
        } else
          this.teamSource.Name = 'Libre';
      });
      this.show = false;
    }
  }

  async ifPlayerExists() {
    const res = await this.playerService.ifExists(this.playerCurpCtrl.value);
    if (!res)
      return { exists: true };
  }
}