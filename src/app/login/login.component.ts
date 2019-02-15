import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { FormControl, Validators } from '@angular/forms';
import { AuthService } from '../services/auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  public email = new FormControl('', [Validators.required, Validators.email]);
  public password = new FormControl('', [Validators.required]);
  public hide = true;

  constructor(public snackBar: MatSnackBar, private authService: AuthService, private router: Router) { }

  ngOnInit() {
    if (this.authService.afAuth.user)
      this.router.navigate(['dashboard']);
  }

  getErrorMessage() {
    return this.email.hasError('required') ? 'Debe introducir un valor' :
      this.email.hasError('email') ? 'Correo electrónico inválido' :
        this.password.hasError('required') ? 'Debe introducir un valor' :
          '';
  }

  login() {
    this.authService.login(this.email.value, this.password.value).catch(() => {
      this.snackBar.open("Los datos son incorrectos. Verifique la información.", "Error", {
        duration: 3000,
      });
    });
  }
}
