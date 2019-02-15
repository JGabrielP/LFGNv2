import { Injectable } from '@angular/core';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Finance } from 'src/app/models/finance/finance';
import { AngularFireAuth } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class FinancesService {

  public financesCollection: AngularFirestoreCollection<Finance>;
  public finances: Observable<Finance[]>;

  constructor(private afs: AngularFirestore, private afAuth: AngularFireAuth) {
    this.getUser();
  }

  getUser() {
    this.financesCollection = this.afs.collection(this.afAuth.auth.currentUser.email).doc(this.afAuth.auth.currentUser.uid).collection('finances');
    this.finances = this.financesCollection.valueChanges();
  }

  get() {
    this.financesCollection = this.afs.collection(this.afAuth.auth.currentUser.email).doc(this.afAuth.auth.currentUser.uid).collection('finances', ref => ref.orderBy('Date'));
    return this.financesCollection.valueChanges();
  }

  add(finance: Finance) {
    this.getUser();
    return this.financesCollection.add(finance);
  }

  delete(finance: Finance) {
    this.getUser();
    this.financesCollection.get().subscribe(function (querySnapshot) {
      querySnapshot.forEach(function (doc) {
        if (JSON.stringify(doc.data()) === JSON.stringify(finance)) {
          doc.ref.delete();
        }
      });
    });
  }
}
