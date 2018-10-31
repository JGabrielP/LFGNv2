import { Component, OnInit, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Field } from '../../models/field/field';
import { FieldService } from '../../services/field/field.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-fields',
  templateUrl: './fields.component.html',
  styleUrls: ['./fields.component.css']
})
export class FieldsComponent implements OnInit {

  fields: Observable<Field[]>;

  constructor(private fieldService: FieldService, private dialog: MatDialog, public snackBar: MatSnackBar) {
  }

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
      if (result != null)
        this.fieldService.delete(result).then(() => this.openSnackbar("Campo eliminado correctamente."));
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

  nameField = new FormControl('', [Validators.required]);

  constructor(public dialogRef: MatDialogRef<AddFieldDialog>) { }

  private getErrorMessage() {
    return this.nameField.hasError('required') ? 'Debe introducir un valor' : ''
  }

  add() {
    if (!this.nameField.hasError('required'))
      this.dialogRef.close({ Name: this.nameField.value })
  }

  onNoClick(): void {
    this.dialogRef.close(null);
  }
}

@Component({
  selector: 'delete-field-dialog',
  templateUrl: './dialogs/delete-field-dialog.component.html',
})
export class DeleteFieldDialog {

  constructor(public dialogRef: MatDialogRef<DeleteFieldDialog>, @Inject(MAT_DIALOG_DATA) public data: Field) { }

  onNoClick(): void {
    this.dialogRef.close(null);
  }
}

@Component({
  selector: 'edit-field-dialog',
  templateUrl: './dialogs/edit-field-dialog.component.html',
})
export class EditFieldDialog {

  nameField = new FormControl('', [Validators.required]);

  constructor(public dialogRef: MatDialogRef<EditFieldDialog>, @Inject(MAT_DIALOG_DATA) public data: Field) { }

  private getErrorMessage() {
    return this.nameField.hasError('required') ? 'Debe introducir un valor' : ''
  }

  edit() {
    if (!this.nameField.hasError('required'))
      this.dialogRef.close({ Id: this.data.Id, Name: this.nameField.value })
  }

  onNoClick(): void {
    this.dialogRef.close(null);
  }
}