import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Player } from 'src/app/models/player/player';
import { AngularFireAuth } from '@angular/fire/auth';
import { StatsTeam } from 'src/app/models/statsTeam/stats-team';
import { Team } from 'src/app/models/team/team';

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {

  public table: StatsTeam[];
  public tableLeaderGoal: any[];
  public tableLeaderYCard: any[];

  constructor(private afs: AngularFirestore, private afAuth: AngularFireAuth) { }

  get(nameTournament: string) {
    return this.afs.collection(this.afAuth.auth.currentUser.email).doc(this.afAuth.auth.currentUser.uid).collection('leaderboard').doc(nameTournament).collection('table', ref => ref.orderBy("pts", "desc").orderBy("dg", "desc").orderBy("gf", "desc")).valueChanges();
  }

  getLeadergoal(nameTournament: string) {
    return this.afs.collection(this.afAuth.auth.currentUser.email).doc(this.afAuth.auth.currentUser.uid).collection('leadergoal').doc(nameTournament).collection('table', ref => ref.orderBy('nGoals', 'desc')).valueChanges();
  }

  getLeadergoalPlayer(nameTournament: string) {
    return this.afs.collection(this.afAuth.auth.currentUser.email).doc(this.afAuth.auth.currentUser.uid).collection('leadergoal').doc(nameTournament).collection('table', ref => ref.orderBy('pos').limit(1)).valueChanges();
  }

  getLeader(nameTournament: string) {
    return this.afs.collection(this.afAuth.auth.currentUser.email).doc(this.afAuth.auth.currentUser.uid).collection('leaderboard').doc(nameTournament).collection('table', ref => ref.orderBy('pos').limit(1)).valueChanges();
  }

  getLeaderYCards(nameTournament: string) {
    return this.afs.collection(this.afAuth.auth.currentUser.email).doc(this.afAuth.auth.currentUser.uid).collection('leaderYCards').doc(nameTournament).collection('table').valueChanges();
  }

  async setLeaderboard(nameTournament: string): Promise<any> {
    return new Promise(async (resolve, reject) => {
      this.table = [];
      this.tableLeaderGoal = [];
      this.tableLeaderYCard = [];
      await this.setStatisticsByTournament(nameTournament);
      await this.save(this.afs.collection(this.afAuth.auth.currentUser.email).doc(this.afAuth.auth.currentUser.uid).collection('leaderboard').doc(nameTournament).collection('table'), this.table);
      await this.save(this.afs.collection(this.afAuth.auth.currentUser.email).doc(this.afAuth.auth.currentUser.uid).collection('leadergoal').doc(nameTournament).collection('table'), this.tableLeaderGoal);
      await this.save(this.afs.collection(this.afAuth.auth.currentUser.email).doc(this.afAuth.auth.currentUser.uid).collection('leaderYCards').doc(nameTournament).collection('table'), this.tableLeaderYCard);
      resolve();
    });
  }

  save(ref: any, data: any[]): Promise<any> {
    return new Promise((resolve, reject) => {
      const batch = this.afs.firestore.batch();
      const batch2 = this.afs.firestore.batch();
      ref.get().subscribe(async collection => {
        collection.forEach(document => {
          batch.delete(document.ref);
        });
        await batch.commit();
        data.forEach(a => {
          batch2.set(ref.doc(this.afs.createId()).ref, a);
        });
        await batch2.commit();
        resolve();
      });
    });
  }

  setStatisticsByTournament(nameTournament: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.afs.collection(this.afAuth.auth.currentUser.email).doc(this.afAuth.auth.currentUser.uid).collection('tournaments').doc(nameTournament).collection('Jornadas', ref => ref.orderBy("nJornada")).get().subscribe(async matchweeks => {
        let i: number = 0;
        for (const matchweek of matchweeks.docs) {
          i++;
          await this.setStatistics(nameTournament, matchweek, i, matchweeks);
        }
        resolve();
      });
    });
  }

  setStatistics(nameTournament: string, matchweek, i: number, matchweeks): Promise<any> {
    return new Promise((resolve, reject) => {
      this.afs.collection(this.afAuth.auth.currentUser.email).doc(this.afAuth.auth.currentUser.uid).collection('tournaments').doc(nameTournament).collection('Jornadas').doc(matchweek.data().Name).collection('Partidos').get().subscribe(async matches => {
        let a: number = 0;
        for (const match of matches.docs) {
          if (match.data().Local.Id == "Descansa" || match.data().Visit.Id == "Descansa")
            a++
          if (match.data().Finished) {
            a++;
            if (match.data().GoalsLocal > match.data().GoalsVisit) {
              this.setLeaderBoard(match.data().Local, match.data().GoalsLocal, match.data().GoalsVisit, 'win');
              this.setLeaderBoard(match.data().Visit, match.data().GoalsVisit, match.data().GoalsLocal, 'lose');
            } else if (match.data().GoalsVisit > match.data().GoalsLocal) {
              this.setLeaderBoard(match.data().Visit, match.data().GoalsVisit, match.data().GoalsLocal, 'win');
              this.setLeaderBoard(match.data().Local, match.data().GoalsLocal, match.data().GoalsVisit, 'lose');
            } else {
              this.setLeaderBoard(match.data().Local, match.data().GoalsLocal, match.data().GoalsVisit, 'equal');
              this.setLeaderBoard(match.data().Visit, match.data().GoalsVisit, match.data().GoalsLocal, 'equal');
            }
            if (match.data().hasOwnProperty('GoalsPlayersLocal') && match.data().hasOwnProperty('GoalsPlayersVisit')) {
              this.setLeaderGoal(match.data().GoalsPlayersLocal);
              this.setLeaderGoal(match.data().GoalsPlayersVisit);
            }
            if (match.data().hasOwnProperty('YCardsLocal') && match.data().hasOwnProperty('YCardsVisit')) {
              this.setLeaderYCard(match.data().YCardsLocal, i);
              this.setLeaderYCard(match.data().YCardsVisit, i);
            }
            if (i == matchweeks.size && a == matches.size)
              this.generateLiguilla(nameTournament);
          }
        }
        resolve();
      });
    });
  }

  async generateLiguilla(nameTournament: string) {
    let round: string;
    //await this.sortTable(nameTournament);
    this.afs.collection(this.afAuth.auth.currentUser.email).doc(this.afAuth.auth.currentUser.uid).
      collection("tournaments").doc(nameTournament).get().subscribe(w => {
        const a = this.afs.collection(this.afAuth.auth.currentUser.email + '/' + this.afAuth.auth.currentUser.uid + "/" + "leaderboard" + "/" + nameTournament + "/" + 'table', ref => ref.orderBy("pts", "desc").orderBy("dg", "desc").orderBy("gf", "desc").limit(w.data().nTeams)).valueChanges();
        a.subscribe((c: any) => {
          switch (w.data().nTeams) {
            case 2:
              round = 'Final';
              break;
            case 4:
              round = 'Semifinal';
              break;
            case 8:
              round = 'Cuartos de final';
              break;
            default:
              break;
          }
          if (w.data().nTimesLiguilla == 1)
            for (let i = 0, y = c.length - 1; i < y; i++ , y--) {
              this.afs.collection(this.afAuth.auth.currentUser.email).doc(this.afAuth.auth.currentUser.uid).
                collection("liguillas").doc(nameTournament).collection(round).doc('Partido' + (i + 1)).
                set({ Type: round, Local: c[i].team, Visit: c[y].team, Finished: false, MatchName: 'Partido' + (i + 1), PosLocal: i + 1, PosVisit: y + 1 });
            }
          else {
            let matchName: string;
            for (let i = 0, y = c.length - 1; i < c.length; i++ , y--) {
              if (i < y)
                matchName = "Partido" + (i + 1);
              else
                matchName = "Partido" + (y + 1) + "" + (y + 1);
              this.afs.collection(this.afAuth.auth.currentUser.email).doc(this.afAuth.auth.currentUser.uid).
                collection("liguillas").doc(nameTournament).collection(round).doc(matchName).
                set({ Type: round, Local: c[i].team, Visit: c[y].team, Finished: false, MatchName: matchName, PosLocal: i + 1, PosVisit: y + 1 });
            }
          }
        });
      });
  }

  setLeaderYCard(players: Player[], nJornada: number) {
    players.forEach((player: Player) => {
      if (this.tableLeaderYCard.some(cardYPlayer => cardYPlayer.Player.Id.includes(player.Id))) {
        let playerTable = this.tableLeaderYCard.find(cardYPlayer => cardYPlayer.Player.Id === player.Id);
        if (playerTable.nYCards + 1 == 4) {
          playerTable.nYCards = 1;
          playerTable.LastMatchweek = nJornada;
        } else {
          playerTable.nYCards += 1;
          playerTable.LastMatchweek = nJornada;
        }
      }
      else
        this.tableLeaderYCard.push({ Player: player, nYCards: 1, LastMatchweek: nJornada });
    });
  }

  setLeaderBoard(team: Team, gf: number, gc: number, status: string) {
    if (this.table.some(teamTable => teamTable.team.Id.includes(team.Id))) {
      let index = this.table.findIndex(x => x.team.Id === team.Id);
      let teamTable = this.table.find(x => x.team.Id === team.Id);
      switch (status) {
        case 'win':
          this.table[index].pts = teamTable.pts + 3;
          this.table[index].jj = teamTable.jj + 1;
          this.table[index].dg = teamTable.dg + gf - gc;
          this.table[index].jg = teamTable.jg + 1;
          this.table[index].gf = teamTable.gf + gf;
          this.table[index].gc = teamTable.gc + gc;
          break;
        case 'lose':
          this.table[index].jj = teamTable.jj + 1;
          this.table[index].dg = teamTable.dg + gf - gc;
          this.table[index].jp = teamTable.jp + 1;
          this.table[index].gf = teamTable.gf + gf;
          this.table[index].gc = teamTable.gc + gc;
          break;
        case 'equal':
          this.table[index].pts = teamTable.pts + 1;
          this.table[index].jj = teamTable.jj + 1;
          this.table[index].dg = teamTable.dg + gf - gc;
          this.table[index].je = teamTable.je + 1;
          this.table[index].gf = teamTable.gf + gf;
          this.table[index].gc = teamTable.gc + gc;
          break;
      }
    } else {
      switch (status) {
        case 'win':
          this.table.push({ pts: 3, jj: 1, dg: gf - gc, jg: 1, je: 0, jp: 0, gf: gf, gc: gc, pos: 0, team: team });
          break;
        case 'lose':
          this.table.push({ pts: 0, jj: 1, dg: gf - gc, jg: 0, je: 0, jp: 1, gf: gf, gc: gc, pos: 0, team: team });
          break;
        case 'equal':
          this.table.push({ pts: 1, jj: 1, dg: gf - gc, jg: 0, je: 1, jp: 0, gf: gf, gc: gc, pos: 0, team: team });
          break;
      }
    }
  }

  setLeaderGoal(players: Player[]) {
    players.forEach((player: Player) => {
      if (this.tableLeaderGoal.some(goalPlayer => goalPlayer.Player.Id.includes(player.Id)))
        this.tableLeaderGoal.find(goalPlayer => goalPlayer.Player.Id === player.Id).nGoals += 1;
      else
        this.tableLeaderGoal.push({ Player: player, nGoals: 1 });
    });
  }
}