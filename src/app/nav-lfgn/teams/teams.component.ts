import { Component, OnInit, Inject } from '@angular/core';
import { FormControl, Validators, FormBuilder } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import { TeamService } from '../../services/team/team.service';
import { Observable } from 'rxjs';
import { Team } from '../../models/team/team';
import { Player } from '../../models/player/player';
import { PlayerService } from 'src/app/services/player/player.service';
import { Router } from '@angular/router';
import * as jspdf from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-teams',
  templateUrl: './teams.component.html',
  styleUrls: ['./teams.component.css']
})
export class TeamsComponent implements OnInit {

  public teams: Observable<Team[]>;

  constructor(private teamService: TeamService, private playerService: PlayerService, private dialog: MatDialog, private snackBar: MatSnackBar, private router: Router) { }

  ngOnInit() {
    this.teams = this.teamService.get();
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(AddTeamDialog, { width: '80%' });
    dialogRef.afterClosed().subscribe(result => {
      if (result != null)
        this.openSnackbar("Equipo agregado correctamente.");
    });
  }

  async openDeleteDialog(team: Team) {
    const dialogRef = await this.dialog.open(DeleteTeamDialog, { data: team });
    dialogRef.afterClosed().subscribe(result => {
      if (result != null) {
        this.openSnackbar('Eliminando...');
        const players = this.playerService.getPlayers(result.Id);
        players.subscribe(Listplayers => {
          Listplayers.forEach(async (player: Player) => {
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

  generateReport() {
    var data = document.getElementById('Rteams');
    html2canvas(data).then(canvas => {
      var imgWidth = 190;
      var imgHeight = canvas.height * imgWidth / canvas.width;
      const contentDataURL = canvas.toDataURL('image/png')
      let pdf = new jspdf();
      pdf.text('Reporte de equipos', 10, 20)
      pdf.addImage(contentDataURL, 'PNG', 10, 30, imgWidth, imgHeight)
      pdf.save('ReporteEquipos.pdf');
    });
  }
}

@Component({
  selector: 'add-team-dialog',
  templateUrl: './dialogs/add-team-dialog.component.html',
  styleUrls: ['./dialogs/add-team-dialog.component.css']
})
export class AddTeamDialog {

  public teamCtrl = new FormControl('', [Validators.required], this.ifTeamExists.bind(this));
  public playerCtrl = this._formBuilder.group({
    curpCtrl: ['', [Validators.required, Validators.minLength(18)], this.ifPlayerExists.bind(this)],
    nameCtrl: ['', Validators.required],
    firstNameCtrl: ['', Validators.required],
    lastNameCtrl: ['', Validators.required],
    birthdateCtrl: ['', Validators.required]
  });
  public LogoBuffer: ArrayBuffer | string;
  public PhotoBuffer: ArrayBuffer | string;
  public LogoUrl: File;
  public PhotoFile: File;
  public players: any[] = [];
  public buttonDisable: boolean = false;

  constructor(private dialogRef: MatDialogRef<AddTeamDialog>, private teamService: TeamService, private playerService: PlayerService, private _formBuilder: FormBuilder, private snackBar: MatSnackBar) { }

  async add() {
    this.buttonDisable = true;
    this.openSnackbar("Guardando información...");
    const idTeam = await this.teamService.add({ Id: '', Name: this.teamCtrl.value, LogoUrl: '' }, this.LogoUrl);
    this.players.forEach(async player => {
      await this.teamService.getTeam(idTeam).subscribe(async team => {
        let folio = await this.playerService.generateFolio();
        await this.playerService.add({ Id: player.Id, Name: player.Name, FirstName: player.FirstName, LastName: player.LastName, BirthDate: player.BirthDate, PhotoUrl: '', Team: <Team>team[0], Folio: folio }, player.photoFile);
      });
    });
    this.dialogRef.close('Ok');
  }

  addPlayerList() {
    if (this.playerCtrl.valid) {
      this.players.push({ Id: this.playerCtrl.get('curpCtrl').value, Name: this.playerCtrl.get('nameCtrl').value, LastName: this.playerCtrl.get('lastNameCtrl').value, FirstName: this.playerCtrl.get('firstNameCtrl').value, BirthDate: this.playerCtrl.get('birthdateCtrl').value, PhotoUrl: this.PhotoBuffer, photoFile: this.PhotoFile });
      this.playerCtrl.get('curpCtrl').setValue('');
      this.playerCtrl.get('nameCtrl').setValue('');
      this.playerCtrl.get('lastNameCtrl').setValue('');
      this.playerCtrl.get('firstNameCtrl').setValue('');
      this.playerCtrl.get('birthdateCtrl').setValue('');
      this.PhotoBuffer = "";
      this.PhotoFile = null;
    }
  }

  removePlayer(player: Player) {
    this.players.splice(this.players.indexOf(player), 1);
  }

  onNoClick(): void {
    this.dialogRef.close(null);
  }

  setLogo(event) {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = e => this.LogoBuffer = reader.result;
      reader.readAsDataURL(file);
      this.LogoUrl = file;
    }
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
}

@Component({
  selector: 'delete-team-dialog',
  templateUrl: './dialogs/delete-team-dialog.component.html',
})
export class DeleteTeamDialog {

  constructor(private dialogRef: MatDialogRef<DeleteTeamDialog>, @Inject(MAT_DIALOG_DATA) public data: Team) { }

  onNoClick(): void {
    this.dialogRef.close(null);
  }
}

@Component({
  selector: 'edit-team-dialog',
  templateUrl: './dialogs/edit-team-dialog.component.html',
})
export class EditTeamDialog {

  public LogoBuffer: ArrayBuffer | string;
  public LogoFile: File;
  public nameTeam = new FormControl('', [Validators.required], this.ifTeamExists.bind(this));

  constructor(private dialogRef: MatDialogRef<EditTeamDialog>, @Inject(MAT_DIALOG_DATA) public data: Team, private teamService: TeamService, private snackBar: MatSnackBar) {
    this.nameTeam.setValue(data.Name);
  }

  private getErrorMessage() {
    return this.nameTeam.hasError('required') ? 'Debe introducir un valor' :
      this.nameTeam.hasError('exists') ? 'Nombre de equipo ya registrado' : ''
  }

  async edit() {
    if (this.nameTeam.valid) {
      this.openSnackbar("Guardando información...");
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

  private openSnackbar(message: string) {
    this.snackBar.open(message, "Espere");
  }
}