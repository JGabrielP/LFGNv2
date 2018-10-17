import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Field } from '../../models/field/field';

@Injectable({
  providedIn: 'root'
})
export class FieldService {

  public fieldsCollection: AngularFirestoreCollection<Field>;
  public fields: Observable<Field[]>;

  constructor(private afs: AngularFirestore) {
    this.fieldsCollection = this.afs.collection('fields');
    this.fields = this.fieldsCollection.valueChanges();
  }

  add(field: Field) {
    const id = this.afs.createId();
    field.Id = id;
    return this.fieldsCollection.doc(id).set(field);
  }

  edit(field: Field) {
    return this.fieldsCollection.doc(field.Id).update(field);
  }

  delete(field: Field) {
    return this.fieldsCollection.doc(field.Id).delete();
  }

  get(): any {
    return of(this.fields).pipe(delay(2000));
  }
}
