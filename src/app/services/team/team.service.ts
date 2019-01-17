import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Team } from '../../models/team/team';
import { AngularFireStorage } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root'
})
export class TeamService {

  public teamsCollection: AngularFirestoreCollection<Team>;
  public teams: Observable<Team[]>;

  constructor(private afs: AngularFirestore, private fireStorage: AngularFireStorage) {
    this.teamsCollection = this.afs.collection('teams');
    this.teams = this.teamsCollection.valueChanges();
  }

  async add(team: Team, logoFile: File) {
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

  async delete(team: Team) {
    await this.teamsCollection.doc(team.Id).delete();
    this.removeLogo(team);
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
    return this.teams;
  }

  getTeam(idTeam: string) {
    return this.afs.collection('teams', ref => ref.where('Id', '==', idTeam)).valueChanges();
  }

  setLogo(logoFile: File, idTeam: string) {
    return this.fireStorage.ref('teams/' + idTeam).put(logoFile);
  }

  removeLogo(team: Team) {
    if (team.LogoUrl.localeCompare(''))
      return this.fireStorage.ref('teams/' + team.Id).delete();
  }

  async ifExists(id: string) {
    const data = await this.teamsCollection.ref.where('Name', '==', id).get();
    if (data.size == 1)
      return true;
  }
}
