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

  add(team: Team) {
    return this.teamsCollection.doc(team.Id).set(team);
  }

  edit(team: Team) {
    if (team.hasOwnProperty('LogoUrl'))
      return this.teamsCollection.doc(team.Id).update({ Name: team.Name, LogoUrl: team.LogoUrl });
    else
      return this.teamsCollection.doc(team.Id).update({ Name: team.Name });
  }

  async delete(team: Team) {
    await this.teamsCollection.doc(team.Id).delete();
    return this.removeLogo(team);
  }

  get() {
    return this.teams;
  }

  getTeam(id: any) {
    return this.afs.collection('teams', ref => ref.where('Id', '==', id)).valueChanges();
  }

  setLogo(file: File, id: string) {
    return this.fireStorage.ref('teams/' + id).put(file);
  }

  removeLogo(team: Team) {
    if (team.hasOwnProperty('LogoUrl'))
      return this.fireStorage.ref('teams/' + team.Id).delete();
  }

  async ifExists(id: string) {
    const data = await this.teamsCollection.ref.where('Name', '==', id).get();
    if (data.size == 1)
      return true;
  }
}
