import { Component, OnInit, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TeamService } from 'src/app/services/team/team.service';
import { PlayerService } from 'src/app/services/player/player.service';
import { MatDialog, MatSnackBar, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, Validators, FormControl } from '@angular/forms';
import { Player } from '../../../models/player/player';
import { Observable } from 'rxjs';
import { Team } from 'src/app/models/team/team';

@Component({
  selector: 'app-team-details',
  templateUrl: './team-details.component.html',
  styleUrls: ['./team-details.component.css']
})
export class TeamDetailsComponent implements OnInit {

  public teams: Observable<Team[]>;
  public players: Observable<Player[]>;

  constructor(private activatedRoute: ActivatedRoute, private teamService: TeamService, private playerService: PlayerService, private dialog: MatDialog, private snackBar: MatSnackBar) { }

  ngOnInit() {
    this.teams = <Observable<Team[]>>this.teamService.getTeam(this.activatedRoute.snapshot.params['id']);
    this.players = <Observable<Player[]>>this.playerService.getPlayers(this.activatedRoute.snapshot.params['id']);
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

  openEditDialog(player: Player) {
    const dialogRef = this.dialog.open(EditPlayerDialog, { data: player });
    dialogRef.afterClosed().subscribe(player => {
      if (player != null)
        this.playerService.edit(player.Id, player).then(() => this.openSnackbar("Jugador editado exitosamente."));
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

  public playerCtrl = this._formBuilder.group({
    curpCtrl: ['', [Validators.required, Validators.minLength(18)], this.ifPlayerExists.bind(this)],
    nameCtrl: ['', Validators.required],
    firstNameCtrl: ['', Validators.required],
    lastNameCtrl: ['', Validators.required],
    birthdateCtrl: ['', Validators.required]
  });
  public PhotoBuffer: ArrayBuffer | string;
  public PhotoFile: File;

  constructor(private teamService: TeamService, private _formBuilder: FormBuilder, private playerService: PlayerService, private dialogRef: MatDialogRef<AddPlayerDialog>, private snackBar: MatSnackBar, @Inject(MAT_DIALOG_DATA) private idTeam: string) { }

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
      reader.onload = e => this.PhotoBuffer = reader.result;
      reader.readAsDataURL(file);
      this.PhotoFile = file;
    }
  }

  async add() {
    if (this.playerCtrl.valid) {
      this.openSnackbar("Guardando información...");
      await this.teamService.getTeam(this.idTeam).subscribe(async team => {
        let folio = await this.playerService.generateFolio();
        await this.playerService.add({
          Id: this.playerCtrl.controls['curpCtrl'].value,
          Name: this.playerCtrl.controls['nameCtrl'].value,
          FirstName: this.playerCtrl.controls['firstNameCtrl'].value,
          LastName: this.playerCtrl.controls['lastNameCtrl'].value,
          BirthDate: this.playerCtrl.controls['birthdateCtrl'].value,
          Team: <Team>team[0],
          PhotoUrl: '',
          Folio: folio
        },
          this.PhotoFile
        );
      });
      this.dialogRef.close('Ok');
    }
  }

  async ifPlayerExists() {
    const res = await this.playerService.ifExists(this.playerCtrl.get('curpCtrl').value);
    if (res)
      return { exists: true };
  }

  private openSnackbar(message: string) {
    this.snackBar.open(message, "Espere");
  }
}

@Component({
  selector: 'drop-player-dialog',
  templateUrl: '../dialogs/drop-player-dialog.component.html'
})
export class DropPlayerDialog {

  constructor(private dialogRef: MatDialogRef<AddPlayerDialog>, @Inject(MAT_DIALOG_DATA) private data: Player) { }

  onNoClick(): void {
    this.dialogRef.close(null);
  }
}

@Component({
  selector: 'edit-player-dialog',
  templateUrl: '../dialogs/edit-player-dialog.component.html',
})
export class EditPlayerDialog {

  public playerCtrl = this._formBuilder.group({
    curpCtrl: ['', [Validators.required, Validators.minLength(18)], this.ifPlayerExists.bind(this)],
    nameCtrl: ['', Validators.required],
    firstNameCtrl: ['', Validators.required],
    lastNameCtrl: ['', Validators.required],
    birthdateCtrl: ['', Validators.required]
  });
  public LogoBuffer: ArrayBuffer | string;
  public LogoFile: File;

  constructor(private playerService: PlayerService, private _formBuilder: FormBuilder, private dialogRef: MatDialogRef<EditPlayerDialog>, @Inject(MAT_DIALOG_DATA) private data: Player, private snackBar: MatSnackBar) {
    this.playerCtrl.controls['curpCtrl'].setValue(data.Id);
    this.playerCtrl.controls['curpCtrl'].disable();
    this.playerCtrl.controls['nameCtrl'].setValue(data.Name);
    this.playerCtrl.controls['firstNameCtrl'].setValue(data.FirstName);
    this.playerCtrl.controls['lastNameCtrl'].setValue(data.LastName);
    let date: any = data.BirthDate;
    this.playerCtrl.controls['birthdateCtrl'].setValue(date.toDate());
  }

  private getErrorMessage() {
    return this.playerCtrl.get('curpCtrl').hasError('exists') ? 'Jugador ya registrado' :
      this.playerCtrl.get('curpCtrl').hasError('required') ? 'Debe introducir un valor' :
        this.playerCtrl.get('curpCtrl').hasError('minlength') ? 'Deben ser 18 caracteres' :
          '';
  }

  async edit() {
    if (this.playerCtrl.valid) {
      this.openSnackbar("Guardando información...");
      if (this.LogoFile != null) {
        await this.playerService.removePhoto(this.data);
        const setLogo = await this.playerService.setPhoto(this.LogoFile, this.data.Id);
        const photoUrl = await setLogo.task.snapshot.ref.getDownloadURL();
        this.dialogRef.close({
          Id: this.playerCtrl.controls['curpCtrl'].value,
          Name: this.playerCtrl.controls['nameCtrl'].value,
          FirstName: this.playerCtrl.controls['firstNameCtrl'].value,
          LastName: this.playerCtrl.controls['lastNameCtrl'].value,
          BirthDate: this.playerCtrl.controls['birthdateCtrl'].value,
          PhotoUrl: photoUrl
        });
      } else
        this.dialogRef.close({
          Id: this.playerCtrl.controls['curpCtrl'].value,
          Name: this.playerCtrl.controls['nameCtrl'].value,
          FirstName: this.playerCtrl.controls['firstNameCtrl'].value,
          LastName: this.playerCtrl.controls['lastNameCtrl'].value,
          BirthDate: this.playerCtrl.controls['birthdateCtrl'].value,
        });
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

  private openSnackbar(message: string) {
    this.snackBar.open(message, "Espere");
  }

  async ifPlayerExists() {
    const res = await this.playerService.ifExists(this.playerCtrl.get('curpCtrl').value);
    if (res)
      if (this.data.Id.localeCompare(this.playerCtrl.controls['curpCtrl'].value))
        return { exists: true };
  }
}