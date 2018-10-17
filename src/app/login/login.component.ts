import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { FormControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  private email = new FormControl('', [Validators.required, Validators.email]);
  private password = new FormControl('', [Validators.required]);
  private hide = true;
  private imageUrl: Observable<string | null>;

  constructor(public snackBar: MatSnackBar, private authService: AuthService, private router: Router) { }

  ngOnInit() {
    if (this.authService.afAuth.user)
      this.router.navigate(['dashboard']);
    this.imageUrl = this.authService.getImage();
  }

  private getErrorMessage() {
    return this.email.hasError('required') ? 'Debe introducir un valor' :
      this.email.hasError('email') ? 'Correo electrónico inválido' :
        this.password.hasError('required') ? 'Debe introducir un valor' :
          '';
  }

  private login() {
    this.authService.login(this.email.value, this.password.value).catch(() => {
      this.snackBar.open("Los datos son incorrectos. Verifique la información.", "Error", {
        duration: 3000,
      });
    });
  }
}
