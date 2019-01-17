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
  public players: Observable<Player[]>;

  constructor(public afs: AngularFirestore, private fireStorage: AngularFireStorage) {
    this.playersCollection = this.afs.collection('players');
    this.players = this.playersCollection.valueChanges();
  }

  async add(player: Player, photoFile: File) {
    if (photoFile != null) {
      const uploadPhoto = await this.setPhoto(photoFile, player.Id);
      await uploadPhoto.task.snapshot.ref.getDownloadURL().then(async photoUrl => {
        player.PhotoUrl = photoUrl;
        await this.playersCollection.doc(player.Id).set(player);
      });
    }
    else
      await this.playersCollection.doc(player.Id).set(player);
    return;
  }

  edit(idPlayer: string, field: any) {
    return this.playersCollection.doc(idPlayer).update(field);
  }

  drop(player: Player) {
    return this.playersCollection.doc(player.Id).update({ Team: { Id: 'Libre', Name: 'Libre', LogoUrl: '' } });
  }

  get() {
    return this.players;
  }

  getPlayers(idTeam: string) {
    return this.afs.collection('players', ref => ref.where('Team.Id', '==', idTeam)).valueChanges();
  }

  getPlayer(idPlayer: string) {
    return this.afs.collection('players', ref => ref.where('Id', '==', idPlayer)).valueChanges();
  }

  async ifExists(id: string) {
    if (await this.playersCollection.doc(id).valueChanges().pipe(first()).toPromise()) return true;
  }

  setPhoto(photoFile: File, idPlayer: string) {
    return this.fireStorage.ref('players/' + idPlayer).put(photoFile);
  }

  removePhoto(player: Player) {
    if (player.PhotoUrl.localeCompare(''))
      return this.fireStorage.ref('players/' + player.Id).delete();
  }

  async generateFolio() {
    var folio: number;
    while (true) {
      folio = Math.floor(1000 + Math.random() * 9000);
      const data = await this.afs.collection('players').ref.where('Folio', '==', 3381).get();
      if (data.size == 0)
        return folio;
    }
  }
}
