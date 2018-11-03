import { Component, OnInit, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TeamService } from 'src/app/services/team/team.service';
import { PlayerService } from 'src/app/services/player/player.service';
import { MatDialog, MatSnackBar, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, Validators } from '@angular/forms';
import { Player } from '../../../models/player/player';

@Component({
  selector: 'app-team-details',
  templateUrl: './team-details.component.html',
  styleUrls: ['./team-details.component.css']
})
export class TeamDetailsComponent implements OnInit {

  teams: any;
  players: any;

  constructor(public activatedRoute: ActivatedRoute, public teamService: TeamService, public playerService: PlayerService, private dialog: MatDialog, public snackBar: MatSnackBar) {
  }

  ngOnInit() {
    this.teams = this.teamService.getTeam(this.activatedRoute.snapshot.params['id']);
    this.players = this.playerService.getPlayers(this.activatedRoute.snapshot.params['id']);
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(AddPlayerDialog, { data: this.activatedRoute.snapshot.params['id'] });
    dialogRef.afterClosed().subscribe(result => {
      if (result != null)
        this.openSnackbar("Jugador registrado correctamente.");
    });
  }

  openDropDialog(player: Player) {
    const dialogRef = this.dialog.open(DropPlayerDialog, { data: player });
    dialogRef.afterClosed().subscribe(player => {
      if (player != null)
        this.playerService.drop(player).then(() => this.openSnackbar("Jugador dado de baja exitosamente."));
    });
  }

  private openSnackbar(message: string) {
    this.snackBar.open(message, "Hecho", {
      duration: 3000,
    });
  }
}

@Component({
  selector: 'add-player-dialog',
  templateUrl: '../dialogs/add-player-dialog.component.html',
  styleUrls: ['../dialogs/add-team-dialog.component.css']
})
export class AddPlayerDialog {

  playerCtrl = this._formBuilder.group({
    curpCtrl: ['', [Validators.required, Validators.minLength(18)], this.ifPlayerExists.bind(this)],
    nameCtrl: ['', Validators.required],
    firstNameCtrl: ['', Validators.required],
    lastNameCtrl: ['', Validators.required],
    birthdateCtrl: ['', Validators.required]
  });
  PhotoUrlBuffer: ArrayBuffer | string;
  PhotoFile: File;

  constructor(private _formBuilder: FormBuilder, public playerService: PlayerService, public dialogRef: MatDialogRef<AddPlayerDialog>, public snackBar: MatSnackBar, @Inject(MAT_DIALOG_DATA) public data: any) { }

  private getErrorMessage() {
    return this.playerCtrl.get('curpCtrl').hasError('exists') ? 'Jugador ya registrado' :
      this.playerCtrl.get('curpCtrl').hasError('required') ? 'Debe introducir un valor' :
        this.playerCtrl.get('curpCtrl').hasError('minlength') ? 'Deben ser 18 caracteres' :
          '';
  }
  
  onNoClick(): void {
    this.dialogRef.close(null);
  }

  setPhoto(event) {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = e => this.PhotoUrlBuffer = reader.result;
      reader.readAsDataURL(file);
      this.PhotoFile = file;
    }
  }

  async add() {
    if (!this.playerCtrl.get('curpCtrl').hasError('required') && !this.playerCtrl.get('nameCtrl').hasError('required') && !this.playerCtrl.get('firstNameCtrl').hasError('required') && !this.playerCtrl.get('lastNameCtrl').hasError('required') && !this.playerCtrl.get('birthdateCtrl').hasError('required') && !this.playerCtrl.get('curpCtrl').hasError('minlength') && !this.playerCtrl.get('curpCtrl').hasError('exists')) {
      if (this.PhotoFile == null)
        this.playerService.add({ Id: this.playerCtrl.get('curpCtrl').value, Name: this.playerCtrl.get('nameCtrl').value, LastName: this.playerCtrl.get('lastNameCtrl').value, FirstName: this.playerCtrl.get('firstNameCtrl').value, BirthDate: this.playerCtrl.get('birthdateCtrl').value.toLocaleDateString(), Team: this.data });
      else {
        const photoUrl = await this.playerService.setPhoto(this.PhotoFile, this.data);
        photoUrl.task.snapshot.ref.getDownloadURL().then(photoUrl => {
          this.playerService.add({ Id: this.playerCtrl.get('curpCtrl').value, Name: this.playerCtrl.get('nameCtrl').value, LastName: this.playerCtrl.get('lastNameCtrl').value, FirstName: this.playerCtrl.get('firstNameCtrl').value, BirthDate: this.playerCtrl.get('birthdateCtrl').value.toLocaleDateString(), PhotoUrl: photoUrl, Team: this.data });
        });
      }
      this.dialogRef.close('ok');
    }
  }

  async ifPlayerExists() {
    const res = await this.playerService.ifExists(this.playerCtrl.get('curpCtrl').value);
    if (res)
      return { exists: true };
  }
}

@Component({
  selector: 'drop-player-dialog',
  templateUrl: '../dialogs/drop-player-dialog.component.html'
})
export class DropPlayerDialog {

  constructor(public dialogRef: MatDialogRef<AddPlayerDialog>, public snackBar: MatSnackBar, @Inject(MAT_DIALOG_DATA) public data: any) { }

  onNoClick(): void {
    this.dialogRef.close(null);
  }
}