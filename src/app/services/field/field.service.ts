import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
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

  get() {
    return this.fields;
  }

  async ifExists(id: string) {
    const data = await this.fieldsCollection.ref.where('Name', '==', id).get();
    if (data.size == 1)
      return true;
  }
}
