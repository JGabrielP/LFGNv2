import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LayoutModule } from '@angular/cdk/layout';
import { MatToolbarModule, MatButtonModule, MatSidenavModule, MatIconModule, MatListModule, MatCardModule, MatFormFieldModule, MatInputModule, MatMenuModule, MatDividerModule, MatTooltipModule, MatSnackBarModule, MatDialogModule, MatStepperModule, MatNativeDateModule, MatSelectModule, MatTableModule, MatExpansionModule, MatSlideToggleModule, MatBadgeModule, MatChipsModule, MatAutocompleteModule } from '@angular/material';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSortModule } from '@angular/material/sort';

@NgModule({
    imports: [BrowserAnimationsModule, LayoutModule, MatToolbarModule, MatButtonModule, MatSidenavModule, MatIconModule, MatListModule, MatCardModule, MatFormFieldModule, MatInputModule, MatMenuModule, MatDividerModule, MatTooltipModule, MatSnackBarModule, MatDialogModule, MatStepperModule, MatDatepickerModule, MatNativeDateModule, MatSelectModule, MatTableModule, MatExpansionModule, MatSlideToggleModule, MatBadgeModule, MatChipsModule, MatAutocompleteModule, MatSortModule],
    exports: [BrowserAnimationsModule, LayoutModule, MatToolbarModule, MatButtonModule, MatSidenavModule, MatIconModule, MatListModule, MatCardModule, MatFormFieldModule, MatInputModule, MatMenuModule, MatDividerModule, MatTooltipModule, MatSnackBarModule, MatDialogModule, MatStepperModule, MatDatepickerModule, MatNativeDateModule, MatSelectModule, MatTableModule, MatExpansionModule, MatSlideToggleModule, MatBadgeModule, MatChipsModule, MatAutocompleteModule, MatSortModule],
})
export class MaterialModule { }