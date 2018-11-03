import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LayoutModule } from '@angular/cdk/layout';
import { MatToolbarModule, MatButtonModule, MatSidenavModule, MatIconModule, MatListModule, MatCardModule, MatFormFieldModule, MatInputModule, MatMenuModule, MatDividerModule, MatTooltipModule, MatSnackBarModule, MatDialogModule, MatStepperModule, MatNativeDateModule, MatSelectModule } from '@angular/material';
import { MatDatepickerModule } from '@angular/material/datepicker';

@NgModule({
    imports: [BrowserAnimationsModule, LayoutModule, MatToolbarModule, MatButtonModule, MatSidenavModule, MatIconModule, MatListModule, MatCardModule, MatFormFieldModule, MatInputModule, MatMenuModule, MatDividerModule, MatTooltipModule, MatSnackBarModule, MatDialogModule, MatStepperModule, MatDatepickerModule, MatNativeDateModule, MatSelectModule],
    exports: [BrowserAnimationsModule, LayoutModule, MatToolbarModule, MatButtonModule, MatSidenavModule, MatIconModule, MatListModule, MatCardModule, MatFormFieldModule, MatInputModule, MatMenuModule, MatDividerModule, MatTooltipModule, MatSnackBarModule, MatDialogModule, MatStepperModule, MatDatepickerModule, MatNativeDateModule, MatSelectModule],
})
export class MaterialModule { }