import { Injectable } from '@angular/core';
import { Tranfer } from 'src/app/models/tranfer/tranfer';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TranferService {

  public tranferCollection: AngularFirestoreCollection<Tranfer>;
  public tranfers: Observable<Tranfer[]>;

  constructor(private afs: AngularFirestore) {
    this.tranferCollection = this.afs.collection('tranfers');
    this.tranfers = this.tranferCollection.valueChanges();
  }

  get() {
    return this.tranfers;
  }

  set(tranfer: Tranfer) {
    return this.tranferCollection.add(tranfer);
  }
}
