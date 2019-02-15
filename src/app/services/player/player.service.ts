import { Injectable } from '@angular/core';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Player } from 'src/app/models/player/player';
import { first } from 'rxjs/operators';
import { AngularFireStorage } from '@angular/fire/storage';
import { AngularFireAuth } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {

  public playersCollection: AngularFirestoreCollection<Player>;
  public players: Observable<Player[]>;

  constructor(public afs: AngularFirestore, private fireStorage: AngularFireStorage, private afAuth: AngularFireAuth) {
    this.getUser();
  }

  getUser() {
    this.playersCollection = this.afs.collection(this.afAuth.auth.currentUser.email).doc(this.afAuth.auth.currentUser.uid).collection('players');
    this.players = this.playersCollection.valueChanges();
  }

  async add(player: Player, photoFile: File) {
    this.getUser();
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
    this.getUser();
    this.updateAllPlayers(field);
    return this.playersCollection.doc(idPlayer).update(field);
  }

  updateAllPlayers(playerData: any) {
    const batch = this.afs.firestore.batch();
    const batch2 = this.afs.firestore.batch();
    const batch3 = this.afs.firestore.batch();

    this.afs.collection(this.afAuth.auth.currentUser.email).doc(this.afAuth.auth.currentUser.uid).collection('tournaments', ref => ref.orderBy('DateAdded', 'desc')).get().subscribe(async q => {
      const y = await this.afs.collection(this.afAuth.auth.currentUser.email).doc(this.afAuth.auth.currentUser.uid).collection('leaderYCards').doc(q.docs[0].data().Name).collection('table').ref.where('Player.Id', '==', playerData.Id).get();
      y.forEach(z => {
        batch.update(z.ref, "Player.Name", playerData.Name, "Player.FirstName", playerData.FirstName, "Player.LastName", playerData.LastName, "Player.BirthDate", playerData.BirthDate, "Player.PhotoUrl", playerData.PhotoUrl == undefined ? z.data().Player.PhotoUrl : playerData.PhotoUrl);
      });

      const yy = await this.afs.collection(this.afAuth.auth.currentUser.email).doc(this.afAuth.auth.currentUser.uid).collection('leadergoal').doc(q.docs[0].data().Name).collection('table').ref.where('Player.Id', '==', playerData.Id).get();
      yy.forEach(z => {
        batch.update(z.ref, "Player.Name", playerData.Name, "Player.FirstName", playerData.FirstName, "Player.LastName", playerData.LastName, "Player.BirthDate", playerData.BirthDate, "Player.PhotoUrl", playerData.PhotoUrl == undefined ? z.data().Player.PhotoUrl : playerData.PhotoUrl);
      });

      let array1: Player[]; let array2: Player[]; let array3: Player[]; let array4: Player[]; let array5: Player[]; let array6: Player[];
      const r = this.afs.collection(this.afAuth.auth.currentUser.email).doc(this.afAuth.auth.currentUser.uid).collection('tournaments').doc(q.docs[0].data().Name).collection('Jornadas');
      r.get().subscribe(async x => {
        for (let i = 1; i <= x.size; i++) {
          const y = await r.doc('Jornada' + i).collection('Partidos').ref.where('Finished', '==', true).get();
          y.forEach(z => {
            if (z.data().GoalsPlayersLocal != undefined) {
              array1 = [];
              z.data().GoalsPlayersLocal.forEach((player: Player) => {
                array1.push(player);
                if (player.Id == playerData.Id) {
                  array1.pop();
                  array1.push({ BirthDate: playerData.BirthDate, FirstName: playerData.FirstName, Folio: player.Folio, Id: player.Id, LastName: playerData.LastName, Name: playerData.Name, Team: player.Team, PhotoUrl: playerData.PhotoUrl == undefined ? player.PhotoUrl : playerData.PhotoUrl });
                }
              });
              batch2.update(z.ref, 'GoalsPlayersLocal', array1);
            }
            if (z.data().GoalsPlayersVisit != undefined) {
              array2 = [];
              z.data().GoalsPlayersVisit.forEach((player: Player) => {
                array2.push(player);
                if (player.Id == playerData.Id) {
                  array2.pop();
                  array2.push({ BirthDate: playerData.BirthDate, FirstName: playerData.FirstName, Folio: player.Folio, Id: player.Id, LastName: playerData.LastName, Name: playerData.Name, Team: player.Team, PhotoUrl: playerData.PhotoUrl == undefined ? player.PhotoUrl : playerData.PhotoUrl });
                }
              });
              batch2.update(z.ref, 'GoalsPlayersVisit', array2);
            }
            if (z.data().YCardsLocal != undefined) {
              array3 = [];
              z.data().YCardsLocal.forEach((player: Player) => {
                array3.push(player);
                if (player.Id == playerData.Id) {
                  array3.pop();
                  array3.push({ BirthDate: playerData.BirthDate, FirstName: playerData.FirstName, Folio: player.Folio, Id: player.Id, LastName: playerData.LastName, Name: playerData.Name, Team: player.Team, PhotoUrl: playerData.PhotoUrl == undefined ? player.PhotoUrl : playerData.PhotoUrl });
                }
              });
              batch2.update(z.ref, 'YCardsLocal', array3);
            }
            if (z.data().YCardsVisit != undefined) {
              array4 = [];
              z.data().YCardsVisit.forEach((player: Player) => {
                array4.push(player);
                if (player.Id == playerData.Id) {
                  array4.pop();
                  array4.push({ BirthDate: playerData.BirthDate, FirstName: playerData.FirstName, Folio: player.Folio, Id: player.Id, LastName: playerData.LastName, Name: playerData.Name, Team: player.Team, PhotoUrl: playerData.PhotoUrl == undefined ? player.PhotoUrl : playerData.PhotoUrl });
                }
              });
              batch2.update(z.ref, 'YCardsVisit', array4);
            }
            if (z.data().RCardsLocal != undefined) {
              array5 = [];
              z.data().RCardsLocal.forEach((player: Player) => {
                array5.push(player);
                if (player.Id == playerData.Id) {
                  array5.pop();
                  array5.push({ BirthDate: playerData.BirthDate, FirstName: playerData.FirstName, Folio: player.Folio, Id: player.Id, LastName: playerData.LastName, Name: playerData.Name, Team: player.Team, PhotoUrl: playerData.PhotoUrl == undefined ? player.PhotoUrl : playerData.PhotoUrl });
                }
              });
              batch2.update(z.ref, 'RCardsLocal', array5);
            }
            if (z.data().RCardsVisit != undefined) {
              array6 = [];
              z.data().RCardsVisit.forEach((player: Player) => {
                array6.push(player);
                if (player.Id == playerData.Id) {
                  array6.pop();
                  array6.push({ BirthDate: playerData.BirthDate, FirstName: playerData.FirstName, Folio: player.Folio, Id: player.Id, LastName: playerData.LastName, Name: playerData.Name, Team: player.Team, PhotoUrl: playerData.PhotoUrl == undefined ? player.PhotoUrl : playerData.PhotoUrl });
                }
              });
              batch2.update(z.ref, 'RCardsVisit', array6);
            }
          });
        }
        batch2.commit();
      });

      let roundName: string; let array7: Player[]; let array8: Player[]; let array9: Player[]; let array10: Player[]; let array11: Player[]; let array12: Player[];
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
        const yyyyy = await this.afs.collection(this.afAuth.auth.currentUser.email).doc(this.afAuth.auth.currentUser.uid).collection('liguillas').doc(q.docs[0].data().Name).collection(roundName).ref.get();
        yyyyy.forEach(z => {
          if (z.data().GoalsPlayersLocal != undefined) {
            array7 = [];
            z.data().GoalsPlayersLocal.forEach((player: Player) => {
              array7.push(player);
              if (player.Id == playerData.Id) {
                array7.pop();
                array7.push({ BirthDate: playerData.BirthDate, FirstName: playerData.FirstName, Folio: player.Folio, Id: player.Id, LastName: playerData.LastName, Name: playerData.Name, Team: player.Team, PhotoUrl: playerData.PhotoUrl == undefined ? player.PhotoUrl : playerData.PhotoUrl });
              }
            });
            batch3.update(z.ref, 'GoalsPlayersLocal', array7);
          }
          if (z.data().GoalsPlayersVisit != undefined) {
            array8 = [];
            z.data().GoalsPlayersVisit.forEach((player: Player) => {
              array8.push(player);
              if (player.Id == playerData.Id) {
                array8.pop();
                array8.push({ BirthDate: playerData.BirthDate, FirstName: playerData.FirstName, Folio: player.Folio, Id: player.Id, LastName: playerData.LastName, Name: playerData.Name, Team: player.Team, PhotoUrl: playerData.PhotoUrl == undefined ? player.PhotoUrl : playerData.PhotoUrl });
              }
            });
            batch3.update(z.ref, 'GoalsPlayersVisit', array8);
          }
          if (z.data().YCardsLocal != undefined) {
            array9 = [];
            z.data().YCardsLocal.forEach((player: Player) => {
              array9.push(player);
              if (player.Id == playerData.Id) {
                array9.pop();
                array9.push({ BirthDate: playerData.BirthDate, FirstName: playerData.FirstName, Folio: player.Folio, Id: player.Id, LastName: playerData.LastName, Name: playerData.Name, Team: player.Team, PhotoUrl: playerData.PhotoUrl == undefined ? player.PhotoUrl : playerData.PhotoUrl });
              }
            });
            batch3.update(z.ref, 'YCardsLocal', array9);
          }
          if (z.data().YCardsVisit != undefined) {
            array10 = [];
            z.data().YCardsVisit.forEach((player: Player) => {
              array10.push(player);
              if (player.Id == playerData.Id) {
                array10.pop();
                array10.push({ BirthDate: playerData.BirthDate, FirstName: playerData.FirstName, Folio: player.Folio, Id: player.Id, LastName: playerData.LastName, Name: playerData.Name, Team: player.Team, PhotoUrl: playerData.PhotoUrl == undefined ? player.PhotoUrl : playerData.PhotoUrl });
              }
            });
            batch3.update(z.ref, 'YCardsVisit', array10);
          }
          if (z.data().RCardsLocal != undefined) {
            array11 = [];
            z.data().RCardsLocal.forEach((player: Player) => {
              array11.push(player);
              if (player.Id == playerData.Id) {
                array11.pop();
                array11.push({ BirthDate: playerData.BirthDate, FirstName: playerData.FirstName, Folio: player.Folio, Id: player.Id, LastName: playerData.LastName, Name: playerData.Name, Team: player.Team, PhotoUrl: playerData.PhotoUrl == undefined ? player.PhotoUrl : playerData.PhotoUrl });
              }
            });
            batch3.update(z.ref, 'RCardsLocal', array11);
          }
          if (z.data().RCardsVisit != undefined) {
            array12 = [];
            z.data().RCardsVisit.forEach((player: Player) => {
              array12.push(player);
              if (player.Id == playerData.Id) {
                array12.pop();
                array12.push({ BirthDate: playerData.BirthDate, FirstName: playerData.FirstName, Folio: player.Folio, Id: player.Id, LastName: playerData.LastName, Name: playerData.Name, Team: player.Team, PhotoUrl: playerData.PhotoUrl == undefined ? player.PhotoUrl : playerData.PhotoUrl });
              }
            });
            batch3.update(z.ref, 'RCardsVisit', array12);
          }
        });
      }
      batch3.commit();
      batch.commit();
    });
  }

  drop(player: Player) {
    this.getUser();
    return this.playersCollection.doc(player.Id).update({ Team: { Id: 'Libre', Name: 'Libre', LogoUrl: '' } });
  }

  get() {
    this.getUser();
    return this.players;
  }

  getPlayers(idTeam: string) {
    return this.afs.collection(this.afAuth.auth.currentUser.email).doc(this.afAuth.auth.currentUser.uid).collection('players', ref => ref.where('Team.Id', '==', idTeam)).valueChanges();
  }

  getPlayer(idPlayer: string) {
    return this.afs.collection(this.afAuth.auth.currentUser.email).doc(this.afAuth.auth.currentUser.uid).collection('players', ref => ref.where('Id', '==', idPlayer)).valueChanges();
  }

  async ifExists(id: string) {
    this.getUser();
    if (await this.playersCollection.doc(id).valueChanges().pipe(first()).toPromise()) return true;
  }

  setPhoto(photoFile: File, idPlayer: string) {
    return this.fireStorage.ref(this.afAuth.auth.currentUser.email + '/players/' + idPlayer).put(photoFile);
  }

  removePhoto(player: Player) {
    if (player.PhotoUrl.localeCompare(''))
      return this.fireStorage.ref(this.afAuth.auth.currentUser.email + '/players/' + player.Id).delete();
  }

  async generateFolio() {
    var folio: number;
    while (true) {
      folio = Math.floor(1000 + Math.random() * 9000);
      const data = await this.afs.collection(this.afAuth.auth.currentUser.email).doc(this.afAuth.auth.currentUser.uid).collection('players').ref.where('Folio', '==', 3381).get();
      if (data.size == 0)
        return folio;
    }
  }
}
