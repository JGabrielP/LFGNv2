import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Field } from '../../models/field/field';
import { AngularFireAuth } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class FieldService {

  public fieldsCollection: AngularFirestoreCollection<Field>;
  public fields: Observable<Field[]>;

  constructor(private afs: AngularFirestore, private afAuth: AngularFireAuth) {
    this.setUser();
  }

  setUser() {
    this.fieldsCollection = this.afs.collection(this.afAuth.auth.currentUser.email).doc(this.afAuth.auth.currentUser.uid).collection('fields');
    this.fields = this.fieldsCollection.valueChanges();
  }

  add(field: Field) {
    this.setUser();
    const id = this.afs.createId();
    field.Id = id;
    return this.fieldsCollection.doc(id).set(field);
  }

  edit(field: Field) {
    this.setUser();
    this.updateAllFields(field);
    return this.fieldsCollection.doc(field.Id).update(field);
  }

  updateAllFields(field: Field): any {
    const batch = this.afs.firestore.batch();
    const batch2 = this.afs.firestore.batch();
    this.afs.collection(this.afAuth.auth.currentUser.email).doc(this.afAuth.auth.currentUser.uid).collection('tournaments', ref => ref.orderBy('DateAdded', 'desc')).get().subscribe(async q => {
      if (q.size > 0) {
        const r = this.afs.collection(this.afAuth.auth.currentUser.email).doc(this.afAuth.auth.currentUser.uid).collection('tournaments').doc(q.docs[0].data().Name).collection('Jornadas');
        r.get().subscribe(async x => {
          for (let i = 1; i <= x.size; i++) {
            const y = await r.doc('Jornada' + i).collection('Partidos').ref.where('Field.Id', '==', field.Id).get();
            y.forEach(z => {
              batch.update(z.ref, { Field: { Id: field.Id, Name: field.Name } });
            });
          }
          batch.commit();
        });
        let roundName: string;
        for (let i = 0; i < 3; i++) {
          switch (i) {
            case 0:
              roundName = 'Cuartos de final';
              break;
            case 1:
              roundName = 'Semifinal';
              break;
            case 2:
              roundName = 'Final';
              break;
            default:
              break;
          }
          const yyyyy = await this.afs.collection(this.afAuth.auth.currentUser.email).doc(this.afAuth.auth.currentUser.uid).collection('liguillas').doc(q.docs[0].data().Name).collection(roundName).ref.where('Field.Id', '==', field.Id).get();
          yyyyy.forEach(z => {
            batch2.update(z.ref, { Field: { Id: field.Id, Name: field.Name } });
          });
        }
        batch2.commit();
      }
    });
  }

  delete(field: Field) {
    this.setUser();
    return this.fieldsCollection.doc(field.Id).delete();
  }

  get() {
    this.setUser();
    return this.fields;
  }

  async ifExists(id: string) {
    this.setUser();
    const data = await this.fieldsCollection.ref.where('Name', '==', id).get();
    if (data.size == 1)
      return true;
  }
}
