import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class MatchService {

  constructor(private afs: AngularFirestore, private afAuth: AngularFireAuth) { }

  update(match: any, nameTournament: string, matchweekName: string, matchId: string) {
    return this.afs.collection(this.afAuth.auth.currentUser.email).doc(this.afAuth.auth.currentUser.uid).collection('tournaments').doc(nameTournament).collection('Jornadas').doc(matchweekName).collection('Partidos').doc(matchId).update(match);
  }

  getPlayersGoals(nameTournament: string, matchweekName: string, matchId: string) {
    return this.afs.collection(this.afAuth.auth.currentUser.email).doc(this.afAuth.auth.currentUser.uid).collection('tournaments').doc(nameTournament).collection('Jornadas').doc(matchweekName).collection('Partidos').doc(matchId).get();
  }

  async updateMatchLiguilla(match: any, nameTournament: string, round: string, matchId: string) {
    return await this.afs.collection(this.afAuth.auth.currentUser.email).doc(this.afAuth.auth.currentUser.uid).collection('liguillas').doc(nameTournament).collection(round).doc(matchId).update(match);
  }
}