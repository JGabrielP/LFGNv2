import { Injectable } from '@angular/core';
import { TeamService } from '../team/team.service';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { Subject, Observable } from 'rxjs';
import { Match } from 'src/app/models/match/match';
import { AngularFireAuth } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class TournamentService {

  public tournamentsCollection: AngularFirestoreCollection<any>;
  public tournaments = [];

  constructor(private teamService: TeamService, private afs: AngularFirestore, private afAuth: AngularFireAuth) {
    this.getUser();
  }

  getUser() {
    this.tournamentsCollection = this.afs.collection(this.afAuth.auth.currentUser.email).doc(this.afAuth.auth.currentUser.uid).collection('tournaments');
  }

  set(nVueltas: number, nTeams: number, nCards: number, nameTournament: string, nTimesLiguilla: number) {
    this.getUser();
    this.teamService.get().subscribe(ListTeam => {
      let pos: number = 1;
      ListTeam.forEach(async team => {
        await this.afs.collection(this.afAuth.auth.currentUser.email).doc(this.afAuth.auth.currentUser.uid).collection('leaderboard').doc(nameTournament).collection('table').doc(team.Id).set({ pos: pos++, team: team, pts: 0, jj: 0, dg: 0, jg: 0, je: 0, jp: 0, gf: 0, gc: 0 });
      });
      if (ListTeam.length % 2 != 0)
        ListTeam.push({ Name: '', Id: 'Descansa' });

      let nMatchweek = (ListTeam.length - 1);
      let halfSize = ListTeam.length / 2;
      let teams = JSON.parse(JSON.stringify(ListTeam));
      teams.splice(0, 1);
      let teamsSize = teams.length;
      let nJornada = 0;
      this.tournamentsCollection.doc(nameTournament).set({ Name: nameTournament, DateAdded: new Date(), nTeams: Number(nTeams), nCards: nCards, nTimesLiguilla: Number(nTimesLiguilla) });

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
    });
  }

  async get(nameTournament: string) {
    this.tournaments = [];
    var subject = new Subject<any>();
    const f = await this.afs.collection(this.afAuth.auth.currentUser.email).doc(this.afAuth.auth.currentUser.uid).collection('tournaments/' + nameTournament + '/Jornadas').get().subscribe(async x => {
      for (let i = 1; i < x.size + 1; i++) {
        const jornada = await this.afs.collection(this.afAuth.auth.currentUser.email).doc(this.afAuth.auth.currentUser.uid).collection('tournaments/' + nameTournament + '/Jornadas/Jornada' + i + '/Partidos').valueChanges();
        this.tournaments.push(jornada);
      }
      subject.next(this.tournaments);
    });
    return subject.asObservable();
  }

  async getTournaments() {
    return await this.afs.collection(this.afAuth.auth.currentUser.email).doc(this.afAuth.auth.currentUser.uid).collection('tournaments', ref => ref.orderBy('DateAdded', 'desc')).valueChanges();
  }

  getMatch(nameTournament: string, matchweekName: string, matchId: string) {
    this.getUser();
    return <Observable<Match>>this.tournamentsCollection.doc(nameTournament).collection('Jornadas').doc(matchweekName).collection('Partidos').doc(matchId).valueChanges();
  }

  getMatchLiguilla(nameTournament: string, round: string, matchId: string) {
    this.getUser();
    return <Observable<Match>>this.afs.collection(this.afAuth.auth.currentUser.email).doc(this.afAuth.auth.currentUser.uid).collection('liguillas').doc(nameTournament).collection(round).doc(matchId).valueChanges();
  }

  async delete(nameTournament: string) {
    this.getUser();
    const registros = await this.tournamentsCollection.doc(nameTournament).collection('Jornadas').ref.get();
    for (const iterator of registros.docs) {
      const registros2 = await iterator.ref.collection('Partidos').get();
      for (const iterator2 of registros2.docs)
        await iterator2.ref.delete();
      await iterator.ref.delete();
    }
    const leadergoals = await this.afs.collection(this.afAuth.auth.currentUser.email).doc(this.afAuth.auth.currentUser.uid).collection('leadergoal').doc(nameTournament).collection('table').ref.get();
    for (const leader of leadergoals.docs)
      await leader.ref.delete();
    const leaderboard = await this.afs.collection(this.afAuth.auth.currentUser.email).doc(this.afAuth.auth.currentUser.uid).collection('leaderboard').doc(nameTournament).collection('table').ref.get();
    for (const leaderBoar of leaderboard.docs)
      await leaderBoar.ref.delete();
    const leaderYCards = await this.afs.collection(this.afAuth.auth.currentUser.email).doc(this.afAuth.auth.currentUser.uid).collection('leaderYCards').doc(nameTournament).collection('table').ref.get();
    for (const leaderYC of leaderYCards.docs)
      await leaderYC.ref.delete();
    this.deleteLiguilla(nameTournament);
    return this.tournamentsCollection.doc(nameTournament).delete();
  }

  getLiguillaCuartos(nameTournament: string) {
    return this.afs.collection(this.afAuth.auth.currentUser.email).doc(this.afAuth.auth.currentUser.uid).collection('liguillas').doc(nameTournament).collection('Cuartos de final').valueChanges();
  }

  getLiguillaSemifinales(nameTournament: string) {
    return this.afs.collection(this.afAuth.auth.currentUser.email).doc(this.afAuth.auth.currentUser.uid).collection('liguillas').doc(nameTournament).collection('Semifinal').valueChanges();
  }

  getLiguillaFinal(nameTournament: string) {
    return this.afs.collection(this.afAuth.auth.currentUser.email).doc(this.afAuth.auth.currentUser.uid).collection('liguillas').doc(nameTournament).collection('Final').valueChanges();
  }

  getChampion(nameTournament: string) {
    return this.afs.collection(this.afAuth.auth.currentUser.email).doc(this.afAuth.auth.currentUser.uid).collection('liguillas').doc(nameTournament).collection('CAMPEÓN').valueChanges();
  }

  async setLiguilla(nameTournament: string, round: string) {
    let teamsClas: any[] = [];
    let nextRound: string;
    const a = await this.afs.collection(this.afAuth.auth.currentUser.email).doc(this.afAuth.auth.currentUser.uid).collection('liguillas').doc(nameTournament).collection(round).get();
    a.subscribe(matches => {
      let i: number = 0;
      if ((round == "Cuartos de final" && matches.size == 8) || (round == "Semifinal" && matches.size == 4) || (round == "Final" && matches.size == 2)) {
        let q: number = 0;
        matches.forEach(match => {
          if (match.data().Finished)
            q++;
        });
        if (q == matches.size) {
          teamsClas = this.addTeamsClas(teamsClas, matches);
          this.setNextRound(round, nameTournament, nextRound, teamsClas, 2);
        }
      } else {
        matches.forEach(match => {
          if (match.data().Finished) {
            i++;
            if (match.data().GoalsLocal > match.data().GoalsVisit)
              teamsClas.push({ Team: match.data().Local, Pos: match.data().PosLocal });
            else
              teamsClas.push({ Team: match.data().Visit, Pos: match.data().PosVisit });
            if (matches.size == i) {
              this.setNextRound(round, nameTournament, nextRound, teamsClas, 1);
            }
          }
        });
      }
    });
  }

  addTeamsClas(teamsClas: any[], matches: any) {
    for (let i = 0, y = 0; y < (matches.size / 2); i = i + 2, y++) {
      if ((matches.docs[i].data().GoalsLocal + matches.docs[i + 1].data().GoalsVisit) > (matches.docs[i].data().GoalsVisit + matches.docs[i + 1].data().GoalsLocal))
        teamsClas.push({ Team: matches.docs[i].data().Local, Pos: matches.docs[i].data().PosLocal });
      else
        teamsClas.push({ Team: matches.docs[i].data().Visit, Pos: matches.docs[i].data().PosVisit });
    }
    return teamsClas;
  }

  setNextRound(round: string, nameTournament: string, nextRound: string, teamsClas: any[], type: number) {
    teamsClas.sort((a: any, b: any) => parseFloat(a.Pos) - parseFloat(b.Pos));
    switch (round) {
      case 'Cuartos de final':
        nextRound = 'Semifinal'
        break;
      case 'Semifinal':
        nextRound = 'Final';
        break;
      case 'Final':
        nextRound = 'CAMPEÓN';
        break;
      default:
        break;
    }
    if (nextRound != "CAMPEÓN") {
      if (type == 1) {
        for (let i = 0, y = teamsClas.length - 1; i < y; i++ , y--) {
          this.afs.collection(this.afAuth.auth.currentUser.email).doc(this.afAuth.auth.currentUser.uid).collection('liguillas').doc(nameTournament).collection(nextRound).doc('Partido' + (i + 1)).set({ Type: nextRound, Local: teamsClas[i].Team, Visit: teamsClas[y].Team, Finished: false, MatchName: 'Partido' + (i + 1), PosLocal: teamsClas[i].Pos, PosVisit: teamsClas[y].Pos });
        }
      } else {
        let matchName: string;
        for (let i = 0, y = teamsClas.length - 1; i < teamsClas.length; i++ , y--) {
          if (i < y)
            matchName = "Partido" + (i + 1);
          else
            matchName = "Partido" + (y + 1) + "" + (y + 1);
          this.afs.collection(this.afAuth.auth.currentUser.email).doc(this.afAuth.auth.currentUser.uid).collection('liguillas').doc(nameTournament).collection(nextRound).doc(matchName).set({ Type: nextRound, Local: teamsClas[i].Team, Visit: teamsClas[y].Team, Finished: false, MatchName: matchName, PosLocal: teamsClas[i].Pos, PosVisit: teamsClas[y].Pos });
        }
      }
    }
    else
      this.afs.collection(this.afAuth.auth.currentUser.email).doc(this.afAuth.auth.currentUser.uid).collection('liguillas').doc(nameTournament).collection(nextRound).doc(nextRound).set({ Type: nextRound, Winner: teamsClas[0].Team });
  }

  async deleteLiguilla(nameTournament: string) {
    const leaderYCards = await this.afs.collection(this.afAuth.auth.currentUser.email).doc(this.afAuth.auth.currentUser.uid).collection('liguillas').doc(nameTournament).collection('CAMPEÓN').ref.get();
    for (const leaderYC of leaderYCards.docs)
      await leaderYC.ref.delete();
    const leaderYCardsS = await this.afs.collection(this.afAuth.auth.currentUser.email).doc(this.afAuth.auth.currentUser.uid).collection('liguillas').doc(nameTournament).collection('Final').ref.get();
    for (const leaderYC of leaderYCardsS.docs)
      await leaderYC.ref.delete();
    const leaderYCardsSS = await this.afs.collection(this.afAuth.auth.currentUser.email).doc(this.afAuth.auth.currentUser.uid).collection('liguillas').doc(nameTournament).collection('Semifinal').ref.get();
    for (const leaderYC of leaderYCardsSS.docs)
      await leaderYC.ref.delete();
    const leaderYCardsss = await this.afs.collection(this.afAuth.auth.currentUser.email).doc(this.afAuth.auth.currentUser.uid).collection('liguillas').doc(nameTournament).collection('Cuartos de final').ref.get();
    for (const leaderYC of leaderYCardsss.docs)
      await leaderYC.ref.delete();
  }

  getCurrentTournament() {
    return this.afs.collection(this.afAuth.auth.currentUser.email).doc(this.afAuth.auth.currentUser.uid).collection('tournaments', ref => ref.orderBy('DateAdded', 'desc').limit(1)).valueChanges();
  }
}