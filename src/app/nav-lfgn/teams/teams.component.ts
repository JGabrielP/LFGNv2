import { Component, OnInit, Inject } from '@angular/core';
import { FormControl, Validators, FormBuilder } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatSnackBar, throwMatDialogContentAlreadyAttachedError } from '@angular/material';
import { TeamService } from '../../services/team/team.service';
import { Observable } from 'rxjs';
import { Team } from '../../models/team/team';
import { Player } from '../../models/player/player';
import { AngularFirestore } from '@angular/fire/firestore';
import { PlayerService } from 'src/app/services/player/player.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-teams',
  templateUrl: './teams.component.html',
  styleUrls: ['./teams.component.css']
})
export class TeamsComponent implements OnInit {

  teams: Observable<Team[]>;

  constructor(public teamService: TeamService, public playerService: PlayerService, private dialog: MatDialog, public snackBar: MatSnackBar, public router: Router) { }

  ngOnInit() {
    this.teams = this.teamService.get();
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(AddTeamDialog, { width: '80%' });
    dialogRef.afterClosed().subscribe(result => {
      if (result != null)
        this.teamService.add(result).then(() => this.openSnackbar("Equipo agregado correctamente."));
    });
  }

  async openDeleteDialog(team: Team) {
    const dialogRef = await this.dialog.open(DeleteTeamDialog, { data: team });
    dialogRef.afterClosed().subscribe(result => {
      if (result != null) {
        const players = this.playerService.getPlayers(result.Id);
        players.subscribe(Listplayers => {
          Listplayers.forEach(async player => {
            await this.playerService.edit(player.Id, { Team: 'Libre' });
          });
        });
        this.teamService.delete(result).then(() => this.openSnackbar("Equipo eliminado correctamente."));
      }
    });
  }

  openEditDialog(team: Team): void {
    const dialogRef = this.dialog.open(EditTeamDialog, { data: team });
    dialogRef.afterClosed().subscribe(result => {
      if (result != null)
        this.teamService.edit(result).then(() => this.openSnackbar("Equipo editado correctamente."));
    });
  }

  private openSnackbar(message: string) {
    this.snackBar.open(message, "Hecho", {
      duration: 3000,
    });
  }

  onInformation(team: Team) {
    this.router.navigate(['dashboard/teams', team.Id]);
  }
}

@Component({
  selector: 'add-team-dialog',
  templateUrl: './dialogs/add-team-dialog.component.html',
  styleUrls: ['./dialogs/add-team-dialog.component.css']
})
export class AddTeamDialog {

  teamCtrl = new FormControl('', [Validators.required], this.ifTeamExists.bind(this));
  playerCtrl = this._formBuilder.group({
    curpCtrl: ['', [Validators.required, Validators.minLength(18)], this.ifPlayerExists.bind(this)],
    nameCtrl: ['', Validators.required],
    firstNameCtrl: ['', Validators.required],
    lastNameCtrl: ['', Validators.required],
    birthdateCtrl: ['', Validators.required]
  });
  LogoUrlBuffer: ArrayBuffer | string;
  PhotoUrlBuffer: ArrayBuffer | string;
  LogoUrl: File;
  PhotoUrl: File;
  players: any[] = [];

  constructor(public dialogRef: MatDialogRef<AddTeamDialog>, private afs: AngularFirestore, private teamService: TeamService, public playerService: PlayerService, private _formBuilder: FormBuilder, public snackBar: MatSnackBar) { }

  private getErrorMessage() {
    return this.teamCtrl.hasError('required') ? 'Debe introducir un valor' :
      this.teamCtrl.hasError('exists') ? 'Nombre de equipo ya registrado' :
        this.playerCtrl.get('curpCtrl').hasError('exists') ? 'Jugador ya registrado' :
          this.playerCtrl.get('curpCtrl').hasError('required') ? 'Debe introducir un valor' :
            this.playerCtrl.get('curpCtrl').hasError('minlength') ? 'Deben ser 18 caracteres' :
              '';
  }

  private openSnackbar(message: string) {
    this.snackBar.open(message, "Espere");
  }

  async add() {
    this.openSnackbar("Guardando información...");
    const id: string = this.afs.createId();
    await this.addPlayers(id);
    if (this.LogoUrl == null) {
      this.dialogRef.close({ Id: id, Name: this.teamCtrl.value });
    } else {
      this.teamService.setLogo(this.LogoUrl, id).
        then(downloadURL => downloadURL.task.snapshot.ref.getDownloadURL().
          then(logoUrl => this.dialogRef.close({ Id: id, Name: this.teamCtrl.value, LogoUrl: logoUrl })
          )
        );
    }
    this.players = [];
  }

  async addPlayers(id: string) {
    this.players.forEach(async player => {
      if (player.hasOwnProperty('photoFile')) {
        const photoUrl = await this.playerService.setPhoto(player.photoFile, player.Id);
        photoUrl.task.snapshot.ref.getDownloadURL().then(photo => {
          this.playerService.add({ Id: player.Id, Name: player.Name, LastName: player.LastName, FirstName: player.FirstName, BirthDate: player.BirthDate, PhotoUrl: photo, Team: id });
        });
      } else
        this.playerService.add({ Id: player.Id, Name: player.Name, LastName: player.LastName, FirstName: player.FirstName, BirthDate: player.BirthDate, Team: id });
    });
  }

  addPlayerList() {
    if (!this.playerCtrl.get('curpCtrl').hasError('required') && !this.playerCtrl.get('nameCtrl').hasError('required') && !this.playerCtrl.get('firstNameCtrl').hasError('required') && !this.playerCtrl.get('lastNameCtrl').hasError('required') && !this.playerCtrl.get('birthdateCtrl').hasError('required') && !this.playerCtrl.get('curpCtrl').hasError('minlength') && !this.playerCtrl.get('curpCtrl').hasError('exists')) {
      if (this.PhotoUrl == null)
        this.players.push({ Id: this.playerCtrl.get('curpCtrl').value, Name: this.playerCtrl.get('nameCtrl').value, LastName: this.playerCtrl.get('lastNameCtrl').value, FirstName: this.playerCtrl.get('firstNameCtrl').value, BirthDate: this.playerCtrl.get('birthdateCtrl').value.toLocaleDateString() });
      else
        this.players.push({ Id: this.playerCtrl.get('curpCtrl').value, Name: this.playerCtrl.get('nameCtrl').value, LastName: this.playerCtrl.get('lastNameCtrl').value, FirstName: this.playerCtrl.get('firstNameCtrl').value, BirthDate: this.playerCtrl.get('birthdateCtrl').value.toLocaleDateString(), PhotoUrl: this.PhotoUrlBuffer, photoFile: this.PhotoUrl });
      this.playerCtrl.get('curpCtrl').setValue('');
      this.playerCtrl.get('nameCtrl').setValue('');
      this.playerCtrl.get('lastNameCtrl').setValue('');
      this.playerCtrl.get('firstNameCtrl').setValue('');
      this.playerCtrl.get('birthdateCtrl').setValue('');
      this.PhotoUrlBuffer = "";
      this.PhotoUrl = null;
    }
  }

  removePlayer(player: Player) {
    this.players.splice(this.players.indexOf(player), 1);
  }

  onNoClick(): void {
    this.players = [];
    this.dialogRef.close(null);
  }

  setLogo(event) {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = e => this.LogoUrlBuffer = reader.result;
      reader.readAsDataURL(file);
      this.LogoUrl = file;
    }
  }

  setPhoto(event) {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = e => this.PhotoUrlBuffer = reader.result;
      reader.readAsDataURL(file);
      this.PhotoUrl = file;
    }
  }

  async ifTeamExists() {
    const res = await this.teamService.ifExists(this.teamCtrl.value);
    if (res)
      return { exists: true };
  }

  async ifPlayerExists() {
    const res = await this.playerService.ifExists(this.playerCtrl.get('curpCtrl').value);
    if (res || this.players.some(player => player.Id === this.playerCtrl.get('curpCtrl').value))
      return { exists: true };
  }
}

@Component({
  selector: 'delete-team-dialog',
  templateUrl: './dialogs/delete-team-dialog.component.html',
})
export class DeleteTeamDialog {

  constructor(public dialogRef: MatDialogRef<DeleteTeamDialog>, @Inject(MAT_DIALOG_DATA) public data: Team) { }

  onNoClick(): void {
    this.dialogRef.close(null);
  }
}

@Component({
  selector: 'edit-team-dialog',
  templateUrl: './dialogs/edit-team-dialog.component.html',
})
export class EditTeamDialog {

  LogoBuffer: ArrayBuffer | string;
  LogoFile: File;
  nameTeam = new FormControl('', [Validators.required], this.ifTeamExists.bind(this));

  constructor(public dialogRef: MatDialogRef<EditTeamDialog>, @Inject(MAT_DIALOG_DATA) public data: Team, public teamService: TeamService) {
    this.nameTeam.setValue(data.Name);
  }

  private getErrorMessage() {
    return this.nameTeam.hasError('required') ? 'Debe introducir un valor' :
      this.nameTeam.hasError('exists') ? 'Nombre de equipo ya registrado' : ''
  }

  async edit() {
    if (!this.nameTeam.hasError('required') && !this.nameTeam.hasError('exists')) {
      if (this.LogoFile != null) {
        await this.teamService.removeLogo(this.data);
        const setLogo = await this.teamService.setLogo(this.LogoFile, this.data.Id);
        const logoUrl = await setLogo.task.snapshot.ref.getDownloadURL();
        this.dialogRef.close({ Id: this.data.Id, Name: this.nameTeam.value, LogoUrl: logoUrl });
      } else
        this.dialogRef.close({ Id: this.data.Id, Name: this.nameTeam.value });
    }
  }

  setLogo(event) {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = e => this.LogoBuffer = reader.result;
      reader.readAsDataURL(file);
      this.LogoFile = file;
    }
  }

  onNoClick(): void {
    this.dialogRef.close(null);
  }

  async ifTeamExists() {
    const res = await this.teamService.ifExists(this.nameTeam.value);
    if (res) {
      if (this.data.Name.localeCompare(this.nameTeam.value))
        return { exists: true };
    }
  }
}