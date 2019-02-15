import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireStorage } from '@angular/fire/storage';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(public afAuth: AngularFireAuth, private router: Router, private fireStorage: AngularFireStorage) { }

  public login(email: string, password: string) {
    return this.afAuth.auth.signInWithEmailAndPassword(email, password).then(() => this.router.navigate(['dashboard']));
  }

  public logout() {
    this.afAuth.auth.signOut().then(() => this.router.navigate(['auth']));
  }

  public setImage(file: File) {
    return this.fireStorage.ref(this.afAuth.auth.currentUser.email + '/userImage/' + this.afAuth.auth.currentUser.uid).put(file);
  }

  public getImage() {
    return this.fireStorage.ref(this.afAuth.auth.currentUser.email + '/userImage/' + this.afAuth.auth.currentUser.uid).getDownloadURL();
  }
}
