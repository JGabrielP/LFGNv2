import { Injectable } from '@angular/core';
import { TeamService } from '../team/team.service';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { Subject, Observable } from 'rxjs';
import { Match } from 'src/app/models/match/match';

@Injectable({
  providedIn: 'root'
})
export class TournamentService {

  public tournamentsCollection: AngularFirestoreCollection<any>;
  public tournaments = [];

  constructor(private teamService: TeamService, private afs: AngularFirestore) {
    this.tournamentsCollection = this.afs.collection('tournaments');
  }

  set(nVueltas: number, nTeams: number, nCards: number, nameTournament: string) {
    this.teamService.get().subscribe(ListTeam => {

      if (ListTeam.length % 2 != 0)
        ListTeam.push({ Name: '', Id: 'Descansa' });

      let nMatchweek = (ListTeam.length - 1);
      let halfSize = ListTeam.length / 2;
      let teams = JSON.parse(JSON.stringify(ListTeam));
      teams.splice(0, 1);
      let teamsSize = teams.length;
      let nJornada = 0;
      this.tournamentsCollection.doc(nameTournament).set({ Name: nameTournament, DateAdded: new Date().toLocaleString() });

      for (let i = 0; i < nVueltas; i++) {
        for (let y = 0; y < nMatchweek; y++) {
          let teamIdx = y % teamsSize;
          let npartido = 1;
          nJornada++;
          this.tournamentsCollection.doc(nameTournament + '/Jornadas/Jornada' + nJornada).set({ Name: 'Jornada' + nJornada });
          if (i == 0)
            //console.log(teams[teamIdx].Name + " vs " + ListTeam[0].Name);
            this.tournamentsCollection.doc(nameTournament).collection('Jornadas').doc('Jornada' + nJornada).collection('Partidos').doc('Partido' + npartido++).set({ Local: teams[teamIdx], Visit: ListTeam[0], Finished: false });
          else
            this.tournamentsCollection.doc(nameTournament).collection('Jornadas').doc('Jornada' + nJornada).collection('Partidos').doc('Partido' + npartido++).set({ Local: ListTeam[0], Visit: teams[teamIdx], Finished: false });
          //console.log(ListTeam[0].Name + " vs " + teams[teamIdx].Name);
          for (let idx = 1; idx < halfSize; idx++) {
            let firstTeam = (y + idx) % teamsSize;
            let secondTeam = (y + teamsSize - idx) % teamsSize;
            if (i == 0)
              this.tournamentsCollection.doc(nameTournament).collection('Jornadas').doc('Jornada' + nJornada).collection('Partidos').doc('Partido' + npartido++).set({ Local: teams[firstTeam], Visit: teams[secondTeam], Finished: false });
            //console.log(teams[firstTeam].Name + " vs " + teams[secondTeam].Name);
            else
              this.tournamentsCollection.doc(nameTournament).collection('Jornadas').doc('Jornada' + nJornada).collection('Partidos').doc('Partido' + npartido++).set({ Local: teams[secondTeam], Visit: teams[firstTeam], Finished: false });
            //console.log(teams[secondTeam].Name + " vs " + teams[firstTeam].Name);
          }
        }
      }

      let pos: number = 1;
      ListTeam.forEach(async team => {
        await this.afs.collection('leaderboard').doc(nameTournament).collection('table').doc(team.Id).set({ pos: pos++, team: team, pts: 0, jj: 0, dg: 0, jg: 0, je: 0, jp: 0, gf: 0, gc: 0 });
      });
    });
  }

  async get(nameTournament: string) {
    this.tournaments = [];
    var subject = new Subject<any>();
    const f = await this.afs.collection('tournaments/' + nameTournament + '/Jornadas').valueChanges().subscribe(async x => {
      for (let i = 1; i < x.length + 1; i++) {
        const jornada = await this.afs.collection('tournaments/' + nameTournament + '/Jornadas/Jornada' + i + '/Partidos').valueChanges();
        this.tournaments.push(jornada);
      }
      subject.next(this.tournaments);
    });
    return subject.asObservable();
  }

  async getTournaments() {
    return await this.afs.collection('tournaments', ref => ref.orderBy('DateAdded', 'desc')).valueChanges();
  }

  getMatch(nameTournament: string, matchweekName: string, matchId: string) {
    return <Observable<Match>>this.tournamentsCollection.doc(nameTournament).collection('Jornadas').doc(matchweekName).collection('Partidos').doc(matchId).valueChanges();
  }
}