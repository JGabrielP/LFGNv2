import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Team } from '../../models/team/team';
import { AngularFireStorage } from '@angular/fire/storage';
import { AngularFireAuth } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class TeamService {

  public teamsCollection: AngularFirestoreCollection<Team>;
  public teams: Observable<Team[]>;

  constructor(private afs: AngularFirestore, private fireStorage: AngularFireStorage, private afAuth: AngularFireAuth) {
    this.getUser();
  }

  getUser() {
    this.teamsCollection = this.afs.collection(this.afAuth.auth.currentUser.email).doc(this.afAuth.auth.currentUser.uid).collection('teams');
    this.teams = this.teamsCollection.valueChanges();
  }

  async add(team: Team, logoFile: File) {
    this.getUser();
    const id = this.afs.createId();
    team.Id = id;
    if (logoFile != null) {
      const uploadLogo = await this.setLogo(logoFile, team.Id);
      await uploadLogo.task.snapshot.ref.getDownloadURL().then(async logoUrl => {
        team.LogoUrl = logoUrl;
        await this.teamsCollection.doc(team.Id).set(team);
      });
    } else
      await this.teamsCollection.doc(team.Id).set(team);
    return team.Id;
  }

  async edit(team: Team) {
    this.getUser();
    this.updateAllTeams(team);
    await this.teamsCollection.doc(team.Id).update(team);
    return;
    /*await this.afs.collection("tranfers").ref.where('TeamSource.Id', '==', team.Id).get().then(querySnapshot => {
      querySnapshot.forEach(doc => {
        var cityRef = this.afs.collection("tranfers").doc(doc.id);
        return cityRef.update({
          'TeamSource.Name': team.Name,
          'TeamSource.LogoUrl': team.LogoUrl
        });
      });
    });

    await this.afs.collection("tranfers").ref.where('TeamDestin.Id', '==', team.Id).get().then(querySnapshot => {
      querySnapshot.forEach(doc => {
        var cityRef = this.afs.collection("tranfers").doc(doc.id);
        return cityRef.update({
          'TeamDestin.Name': team.Name,
          'TeamDestin.LogoUrl': team.LogoUrl
        });
      });
    });*/
  }

  updateAllTeams(team: Team): any {
    const batch = this.afs.firestore.batch();
    const batch2 = this.afs.firestore.batch();

    this.afs.collection(this.afAuth.auth.currentUser.email).doc(this.afAuth.auth.currentUser.uid).collection('tournaments', ref => ref.orderBy('DateAdded', 'desc')).get().subscribe(async q => {
      if (q.size > 0) {
        const r = this.afs.collection(this.afAuth.auth.currentUser.email).doc(this.afAuth.auth.currentUser.uid).collection('tournaments').doc(q.docs[0].data().Name).collection('Jornadas');
        r.get().subscribe(async x => {
          for (let i = 1; i <= x.size; i++) {
            const y = await r.doc('Jornada' + i).collection('Partidos').ref.where('Local.Id', '==', team.Id).get();
            y.forEach(z => {
              batch.update(z.ref, { Local: { Id: team.Id, Name: team.Name, LogoUrl: team.LogoUrl == undefined ? z.data().Local.LogoUrl : team.LogoUrl } });
            });
            const yy = await r.doc('Jornada' + i).collection('Partidos').ref.where('Visit.Id', '==', team.Id).get();
            yy.forEach(z => {
              batch.update(z.ref, { Visit: { Id: team.Id, Name: team.Name, LogoUrl: team.LogoUrl == undefined ? z.data().Visit.LogoUrl : team.LogoUrl } });
            });
          }
          batch.commit();
        });

        const y = await this.afs.collection(this.afAuth.auth.currentUser.email).doc(this.afAuth.auth.currentUser.uid).collection('leaderYCards').doc(q.docs[0].data().Name).collection('table').ref.where('Player.Team.Id', '==', team.Id).get();
        y.forEach(z => {
          batch2.update(z.ref, "Player.Team", { Id: team.Id, Name: team.Name, LogoUrl: team.LogoUrl == undefined ? z.data().Player.Team.LogoUrl : team.LogoUrl });
        });

        const yy = await this.afs.collection(this.afAuth.auth.currentUser.email).doc(this.afAuth.auth.currentUser.uid).collection('leaderboard').doc(q.docs[0].data().Name).collection('table').ref.where('team.Id', '==', team.Id).get();
        yy.forEach(z => {
          batch2.update(z.ref, { team: { Id: team.Id, Name: team.Name, LogoUrl: team.LogoUrl == undefined ? z.data().team.LogoUrl : team.LogoUrl } });
        });

        const yyy = await this.afs.collection(this.afAuth.auth.currentUser.email).doc(this.afAuth.auth.currentUser.uid).collection('leadergoal').doc(q.docs[0].data().Name).collection('table').ref.where('Player.Team.Id', '==', team.Id).get();
        yyy.forEach(z => {
          batch2.update(z.ref, "Player.Team", { Id: team.Id, Name: team.Name, LogoUrl: team.LogoUrl == undefined ? z.data().Player.Team.LogoUrl : team.LogoUrl });
        });

        const yyyy = await this.afs.collection(this.afAuth.auth.currentUser.email).doc(this.afAuth.auth.currentUser.uid).collection('players').ref.where('Team.Id', '==', team.Id).get();
        yyyy.forEach(z => {
          batch2.update(z.ref, { Team: { Id: team.Id, Name: team.Name, LogoUrl: team.LogoUrl == undefined ? z.data().Team.LogoUrl : team.LogoUrl } });
        });

        let roundName: string;
        for (let i = 0; i <= 3; i++) {
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
            case 3:
              roundName = 'CAMPEÓN';
              break;
            default:
              break;
          }
          if (i != 3) {
            const yyyyy = await this.afs.collection(this.afAuth.auth.currentUser.email).doc(this.afAuth.auth.currentUser.uid).collection('liguillas').doc(q.docs[0].data().Name).collection(roundName).ref.where('Local.Id', '==', team.Id).get();
            yyyyy.forEach(z => {
              batch2.update(z.ref, { Local: { Id: team.Id, Name: team.Name, LogoUrl: team.LogoUrl == undefined ? z.data().Local.LogoUrl : team.LogoUrl } });
            });
            const yyyyyy = await this.afs.collection(this.afAuth.auth.currentUser.email).doc(this.afAuth.auth.currentUser.uid).collection('liguillas').doc(q.docs[0].data().Name).collection(roundName).ref.where('Visit.Id', '==', team.Id).get();
            yyyyyy.forEach(z => {
              batch2.update(z.ref, { Visit: { Id: team.Id, Name: team.Name, LogoUrl: team.LogoUrl == undefined ? z.data().Visit.LogoUrl : team.LogoUrl } });
            });
          } else {
            const yyyyyy = await this.afs.collection(this.afAuth.auth.currentUser.email).doc(this.afAuth.auth.currentUser.uid).collection('liguillas').doc(q.docs[0].data().Name).collection(roundName).ref.where('Winner.Id', '==', team.Id).get();
            yyyyyy.forEach(z => {
              batch2.update(z.ref, { Winner: { Id: team.Id, Name: team.Name, LogoUrl: team.LogoUrl == undefined ? z.data().Winner.LogoUrl : team.LogoUrl } });
            });
          }
        }
        batch2.commit();
      }
    });
  }

  async delete(team: Team) {
    this.getUser();
    await this.teamsCollection.doc(team.Id).delete();
    this.removeLogo(team);
    team.LogoUrl = '';
    return;
    /*await this.afs.collection("tranfers").ref.where('TeamSource.Id', '==', team.Id).get().then(querySnapshot => {
      querySnapshot.forEach(doc => {
        var cityRef = this.afs.collection("tranfers").doc(doc.id);
        return cityRef.update({
          'TeamSource.LogoUrl': ''
        });
      });
    });

    await this.afs.collection("tranfers").ref.where('TeamDestin.Id', '==', team.Id).get().then(querySnapshot => {
      querySnapshot.forEach(doc => {
        var cityRef = this.afs.collection("tranfers").doc(doc.id);
        return cityRef.update({
          'TeamDestin.LogoUrl': ''
        });
      });
    });*/
  }

  get() {
    this.getUser();
    return this.teams;
  }

  getOnly() {
    return this.afs.collection(this.afAuth.auth.currentUser.email).doc(this.afAuth.auth.currentUser.uid).collection('teams').get()
  }

  getTeam(idTeam: string) {
    return this.afs.collection(this.afAuth.auth.currentUser.email).doc(this.afAuth.auth.currentUser.uid).collection('teams', ref => ref.where('Id', '==', idTeam)).valueChanges();
  }

  setLogo(logoFile: File, idTeam: string) {
    return this.fireStorage.ref(this.afAuth.auth.currentUser.email + '/teams/' + idTeam).put(logoFile);
  }

  removeLogo(team: Team) {
    if (team.LogoUrl.localeCompare(''))
      return this.fireStorage.ref(this.afAuth.auth.currentUser.email + '/teams/' + team.Id).delete();
  }

  async ifExists(id: string) {
    this.getUser();
    const data = await this.teamsCollection.ref.where('Name', '==', id).get();
    if (data.size == 1)
      return true;
  }
}
