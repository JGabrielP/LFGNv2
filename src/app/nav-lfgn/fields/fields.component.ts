import { Component, OnInit, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Field } from '../../models/field/field';
import { FieldService } from '../../services/field/field.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import { FormControl, Validators, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-fields',
  templateUrl: './fields.component.html',
  styleUrls: ['./fields.component.css']
})
export class FieldsComponent implements OnInit {

  public fields: Observable<Field[]>;

  constructor(private fieldService: FieldService, private dialog: MatDialog, private snackBar: MatSnackBar) { }

  ngOnInit() {
    this.fields = this.fieldService.get();
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(AddFieldDialog);
    dialogRef.afterClosed().subscribe(result => {
      if (result != null)
        this.fieldService.add(result).then(() => this.openSnackbar("Campo agregado correctamente."));
    });
  }

  openDeleteDialog(field: Field): void {
    const dialogRef = this.dialog.open(DeleteFieldDialog, { data: field });
    dialogRef.afterClosed().subscribe(result => {
      if (result != null) {
        this.openSnackbar("Eliminando...");
        this.fieldService.delete(result).then(() => this.openSnackbar("Campo eliminado correctamente."));
      }
    });
  }

  openEditDialog(field: Field): void {
    const dialogRef = this.dialog.open(EditFieldDialog, { data: field });
    dialogRef.afterClosed().subscribe(result => {
      if (result != null)
        this.fieldService.edit(result).then(() => this.openSnackbar("Campo editado correctamente."));
    });
  }

  private openSnackbar(message: string) {
    this.snackBar.open(message, "Hecho", {
      duration: 3000,
    });
  }
}

@Component({
  selector: 'add-field-dialog',
  templateUrl: './dialogs/add-field-dialog.component.html',
})
export class AddFieldDialog {

  public formAdd = new FormGroup({
    nameField: new FormControl('', [Validators.required], this.ifFieldExists.bind(this))
  });

  constructor(private dialogRef: MatDialogRef<AddFieldDialog>, private fieldService: FieldService, private snackBar: MatSnackBar) { }

  private getErrorMessage() {
    return this.formAdd.controls['nameField'].hasError('required') ? 'Debe introducir un valor' :
      this.formAdd.controls['nameField'].hasError('exists') ? 'Campo ya registrado' : ''
  }

  add() {
    if (this.formAdd.valid) {
      this.openSnackbar("Guardando información...");
      this.dialogRef.close({ Name: this.formAdd.controls['nameField'].value });
    }
  }

  onNoClick(): void {
    this.dialogRef.close(null);
  }

  async ifFieldExists() {
    const res = await this.fieldService.ifExists(this.formAdd.controls['nameField'].value);
    if (res)
      return { exists: true };
  }

  private openSnackbar(message: string) {
    this.snackBar.open(message, "Espere");
  }
}

@Component({
  selector: 'delete-field-dialog',
  templateUrl: './dialogs/delete-field-dialog.component.html',
})
export class DeleteFieldDialog {

  constructor(private dialogRef: MatDialogRef<DeleteFieldDialog>, @Inject(MAT_DIALOG_DATA) private data: Field) { }

  onNoClick(): void {
    this.dialogRef.close(null);
  }
}

@Component({
  selector: 'edit-field-dialog',
  templateUrl: './dialogs/edit-field-dialog.component.html',
})
export class EditFieldDialog {

  public formEdit = new FormGroup({
    nameField: new FormControl('', [Validators.required], this.ifFieldExists.bind(this))
  });

  constructor(private dialogRef: MatDialogRef<EditFieldDialog>, @Inject(MAT_DIALOG_DATA) private data: Field, private fieldService: FieldService, private snackBar: MatSnackBar) { }

  private getErrorMessage() {
    return this.formEdit.controls['nameField'].hasError('required') ? 'Debe introducir un valor' :
      this.formEdit.controls['nameField'].hasError('exists') ? 'Campo ya registrado' : ''
  }

  edit() {
    if (this.formEdit.valid) {
      this.openSnackbar("Guardando información...");
      this.data.Name = this.formEdit.controls['nameField'].value;
      this.dialogRef.close(this.data);
    }
  }

  onNoClick(): void {
    this.dialogRef.close(null);
  }

  async ifFieldExists() {
    const res = await this.fieldService.ifExists(this.formEdit.controls['nameField'].value);
    if (res)
      return { exists: true };
  }

  private openSnackbar(message: string) {
    this.snackBar.open(message, "Espere");
  }
}