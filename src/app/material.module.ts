import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LayoutModule } from '@angular/cdk/layout';
import { MatToolbarModule, MatButtonModule, MatSidenavModule, MatIconModule, MatListModule, MatCardModule, MatFormFieldModule, MatInputModule, MatMenuModule, MatDividerModule, MatTooltipModule, MatSnackBarModule, MatDialogModule, MatStepperModule, MatNativeDateModule, MatSelectModule, MatTableModule } from '@angular/material';
import { MatDatepickerModule } from '@angular/material/datepicker';

@NgModule({
    imports: [BrowserAnimationsModule, LayoutModule, MatToolbarModule, MatButtonModule, MatSidenavModule, MatIconModule, MatListModule, MatCardModule, MatFormFieldModule, MatInputModule, MatMenuModule, MatDividerModule, MatTooltipModule, MatSnackBarModule, MatDialogModule, MatStepperModule, MatDatepickerModule, MatNativeDateModule, MatSelectModule, MatTableModule],
    exports: [BrowserAnimationsModule, LayoutModule, MatToolbarModule, MatButtonModule, MatSidenavModule, MatIconModule, MatListModule, MatCardModule, MatFormFieldModule, MatInputModule, MatMenuModule, MatDividerModule, MatTooltipModule, MatSnackBarModule, MatDialogModule, MatStepperModule, MatDatepickerModule, MatNativeDateModule, MatSelectModule, MatTableModule],
})
export class MaterialModule { }