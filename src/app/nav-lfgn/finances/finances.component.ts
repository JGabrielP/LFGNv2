import { Component, OnInit } from '@angular/core';
import { Finance } from 'src/app/models/finance/finance';
import { FinancesService } from 'src/app/services/finances/finances.service';
import { MatDialogRef, MatDialog, MatSnackBar } from '@angular/material';
import { FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-finances',
  templateUrl: './finances.component.html',
  styleUrls: ['./finances.component.css']
})
export class FinancesComponent implements OnInit {

  public finances: Observable<Finance[]>;
  public total: number;
  public displayedColumns: string[] = ['select', 'date', 'description', 'amount'];

  constructor(private financeService: FinancesService, private dialog: MatDialog, private snackBar: MatSnackBar) { }

  ngOnInit() {
    this.finances = this.financeService.get();
    this.financeService.get().subscribe((results) => {
      this.total = results.map(t => t.Amount).reduce((acc, value) => acc + value, 0);
    });
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(AddConceptDialog);
    dialogRef.afterClosed().subscribe(result => {
      if (result != null)
        this.openSnackbar("Concepto agregado correctamente.")
    });
  }

  private openSnackbar(message: string) {
    this.snackBar.open(message, "Hecho", {
      duration: 3000,
    });
  }

  delete(finance: Finance) {
    this.financeService.delete(finance);
  }
}

@Component({
  selector: 'add-concept-dialog',
  templateUrl: 'dialogs/add-concept-dialog.html',
})
export class AddConceptDialog {

  public types: {} = [
    { value: 'black', viewValue: 'Ingreso (+)' },
    { value: 'red', viewValue: 'Egreso (-)' }
  ];
  public financeCtrl = this._formBuilder.group({
    dateCtrl: ['', Validators.required],
    descriptionCtrl: ['', Validators.required],
    amountCtrl: ['', Validators.required],
    typeCtrl: ['', Validators.required]
  });

  constructor(private dialogRef: MatDialogRef<AddConceptDialog>, private financeService: FinancesService, private _formBuilder: FormBuilder) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

  async addConcept() {
    if (this.financeCtrl.valid) {
      let amount: number = this.financeCtrl.controls['amountCtrl'].value;
      if (!this.financeCtrl.controls['typeCtrl'].value.localeCompare('red'))
        amount = -Math.abs(this.financeCtrl.controls['amountCtrl'].value);
      await this.financeService.add({ Date: this.financeCtrl.controls['dateCtrl'].value, Description: this.financeCtrl.controls['descriptionCtrl'].value, Amount: amount, Type: this.financeCtrl.controls['typeCtrl'].value });
      this.dialogRef.close('Ok');
    }
  }
}