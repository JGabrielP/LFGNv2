import { Injectable } from '@angular/core';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Finance } from 'src/app/models/finance/finance';

@Injectable({
  providedIn: 'root'
})
export class FinancesService {

  public financesCollection: AngularFirestoreCollection<Finance>;
  public finances: Observable<Finance[]>;

  constructor(private afs: AngularFirestore) {
    this.financesCollection = this.afs.collection('finances');
    this.finances = this.financesCollection.valueChanges();
  }

  get() {
    this.financesCollection = this.afs.collection('finances', ref => ref.orderBy('Date'));
    return this.financesCollection.valueChanges();
  }

  add(finance: Finance) {
    return this.financesCollection.add(finance);
  }

  delete(finance: Finance) {
    this.financesCollection.get().subscribe(function (querySnapshot) {
      querySnapshot.forEach(function (doc) {
        if (JSON.stringify(doc.data()) === JSON.stringify(finance)) {
          doc.ref.delete();
        }
      });
    });
  }
}
