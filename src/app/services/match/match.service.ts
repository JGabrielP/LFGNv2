import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class MatchService {

  constructor(private afs: AngularFirestore) { }

  update(match: any, nameTournament: string, matchweekName: string, matchId: string) {
    return this.afs.collection('tournaments').doc(nameTournament).collection('Jornadas').doc(matchweekName).collection('Partidos').doc(matchId).update(match);
  }

  getPlayersGoals(nameTournament: string, matchweekName: string, matchId: string) {
    return this.afs.collection('tournaments').doc(nameTournament).collection('Jornadas').doc(matchweekName).collection('Partidos').doc(matchId).get();
  }
}