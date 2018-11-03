import { Injectable } from '@angular/core';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Player } from 'src/app/models/player/player';
import { first } from 'rxjs/operators';
import { AngularFireStorage } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {

  public playersCollection: AngularFirestoreCollection<Player>;
  public playersCollectionQuery: AngularFirestoreCollection<Player>;
  public players: Observable<Player[]>;

  constructor(public afs: AngularFirestore, private fireStorage: AngularFireStorage) {
    this.playersCollection = this.afs.collection('players');
    this.players = this.playersCollection.valueChanges();
  }

  add(player: Player) {
    this.playersCollection.doc(player.Id).set(player);
  }

  edit(id: string, field: any) {
    return this.playersCollection.doc(id).update(field);
  }

  delete(player: Player) {
    return this.playersCollection.doc(player.Id).delete();
  }

  drop(player: Player) {
    return this.playersCollection.doc(player.Id).update({ Team: "Libre" });
  }

  get() {
    return this.players;
  }

  getPlayers(idTeam: string): Observable<Player[]> {
    this.playersCollectionQuery = this.afs.collection('players', ref => ref.where('Team', '==', idTeam));
    return this.playersCollectionQuery.valueChanges();
  }

  getPlayer(id: string) {
    this.playersCollectionQuery = this.afs.collection('players', ref => ref.where('Id', '==', id));
    return this.playersCollectionQuery.valueChanges();
  }

  async ifExists(id: string) {
    if (await this.playersCollection.doc(id).valueChanges().pipe(first()).toPromise()) return true;
  }

  setPhoto(file: File, id: string) {
    return this.fireStorage.ref('players/' + id).put(file);
  }
}
