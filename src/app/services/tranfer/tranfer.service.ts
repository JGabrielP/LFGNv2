import { Injectable } from '@angular/core';
import { Tranfer } from 'src/app/models/tranfer/tranfer';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class TranferService {

  public tranferCollection: AngularFirestoreCollection<Tranfer>;
  public tranfers: Observable<Tranfer[]>;

  constructor(private afs: AngularFirestore, private afAuth: AngularFireAuth) {
    this.getUser();
  }

  getUser() {
    this.tranferCollection = this.afs.collection(this.afAuth.auth.currentUser.email).doc(this.afAuth.auth.currentUser.uid).collection('tranfers');
    this.tranfers = this.tranferCollection.valueChanges();
  }

  get() {
    this.getUser();
    return this.tranfers;
  }

  set(tranfer: Tranfer) {
    this.getUser();
    return this.tranferCollection.add(tranfer);
  }
}
