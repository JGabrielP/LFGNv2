import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { StatsTeam } from 'src/app/models/statsTeam/stats-team';
import { Player } from 'src/app/models/player/player';
import { AngularFireAuth } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {

  constructor(private afs: AngularFirestore, private afAuth: AngularFireAuth) { }

  get(nameTournament: string) {
    return this.afs.collection(this.afAuth.auth.currentUser.email).doc(this.afAuth.auth.currentUser.uid).collection('leaderboard').doc(nameTournament).collection('table').valueChanges();
  }

  getLeadergoal(nameTournament: string) {
    return this.afs.collection(this.afAuth.auth.currentUser.email).doc(this.afAuth.auth.currentUser.uid).collection('leadergoal').doc(nameTournament).collection('table').valueChanges();
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

  async setLeaderboard(nameTournament: string) {
    await this.cleanLeaderboard(nameTournament);
    await this.cleanLeadergoal(nameTournament);
    await this.cleanLeaderYCard(nameTournament);
    const matchweeks = await this.afs.collection(this.afAuth.auth.currentUser.email).doc(this.afAuth.auth.currentUser.uid).collection('tournaments').doc(nameTournament).collection('Jornadas').ref.get();
    let i: number = 0;
    for (const matchweek of matchweeks.docs) {
      i++;
      const matches = await this.afs.collection(this.afAuth.auth.currentUser.email).doc(this.afAuth.auth.currentUser.uid).collection('tournaments').doc(nameTournament).collection('Jornadas').doc(matchweek.data().Name).collection('Partidos').ref.get();
      let a: number = 0;
      for (const match of matches.docs) {
        if (match.data().Finished) {
          a++;
          if (match.data().GoalsLocal > match.data().GoalsVisit) {
            await this.updateLeaderboard(match.data().Local.Id, match.data().GoalsLocal, match.data().GoalsVisit, 'win', nameTournament);
            await this.updateLeaderboard(match.data().Visit.Id, match.data().GoalsVisit, match.data().GoalsLocal, 'lose', nameTournament);
          } else if (match.data().GoalsVisit > match.data().GoalsLocal) {
            await this.updateLeaderboard(match.data().Visit.Id, match.data().GoalsVisit, match.data().GoalsLocal, 'win', nameTournament);
            await this.updateLeaderboard(match.data().Local.Id, match.data().GoalsLocal, match.data().GoalsVisit, 'lose', nameTournament);
          } else {
            await this.updateLeaderboard(match.data().Local.Id, match.data().GoalsLocal, match.data().GoalsVisit, 'equal', nameTournament);
            await this.updateLeaderboard(match.data().Visit.Id, match.data().GoalsVisit, match.data().GoalsLocal, 'equal', nameTournament);
          }
          if (match.data().hasOwnProperty('GoalsPlayersLocal') && match.data().hasOwnProperty('GoalsPlayersVisit'))
            await this.setLeadergoal(match.data().GoalsPlayersLocal, match.data().GoalsPlayersVisit, nameTournament);
          if (match.data().hasOwnProperty('YCardsLocal') && match.data().hasOwnProperty('YCardsVisit'))
            await this.setLeaderYCard(match.data().YCardsLocal, match.data().YCardsVisit, nameTournament, i);
          if (i == matchweeks.size && a == matches.size)
            this.generateLiguilla(nameTournament);
        }
      }
    }
    await this.sortTable(nameTournament);
    await this.sortTableLeadergoal(nameTournament);
  }

  async generateLiguilla(nameTournament: string) {
    let round: string;
    await this.sortTable(nameTournament);
    this.afs.collection(this.afAuth.auth.currentUser.email).doc(this.afAuth.auth.currentUser.uid).
      collection("tournaments").doc(nameTournament).get().subscribe(w => {
        const a = this.afs.collection(this.afAuth.auth.currentUser.email + '/' + this.afAuth.auth.currentUser.uid + "/" + "leaderboard" + "/" + nameTournament + "/" + 'table', ref => ref.orderBy('pos').limit(w.data().nTeams)).valueChanges();
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

  async cleanLeaderYCard(nameTournament: string) {
    const getReg = () => {
      return this.afs.collection(this.afAuth.auth.currentUser.email).doc(this.afAuth.auth.currentUser.uid).collection('leaderYCards').doc(nameTournament).collection('table').ref.get();
    }
    const registros = await getReg();
    for (const iterator of registros.docs)
      await iterator.ref.update({ nYCards: 0 });
  }

  setLeaderYCard(YCardsLocal: Player[], YCardsVisit: Player[], nameTournament: string, nJornada: number) {
    this.setYCard(YCardsLocal, nameTournament, nJornada);
    this.setYCard(YCardsVisit, nameTournament, nJornada);
  }

  setYCard(arrayPlayer, nameTournament: string, nJornada: number) {
    const getPlayerLeaderYCard = (playerId) => { return this.afs.collection(this.afAuth.auth.currentUser.email).doc(this.afAuth.auth.currentUser.uid).collection("leaderYCards").doc(nameTournament).collection('table').ref.where("Player.Id", "==", playerId).get(); }
    const cards = () => { return this.afs.collection(this.afAuth.auth.currentUser.email).doc(this.afAuth.auth.currentUser.uid).collection("tournaments").doc(nameTournament).get(); }
    arrayPlayer.forEach(async cardPlayer => {
      const player = await getPlayerLeaderYCard(cardPlayer.Id);
      if (player.size > 0) {
        const nCardsY = await cards();
        nCardsY.subscribe(async x => {
          if (player.docs[0].data().nYCards + 1 == x.data().nCards + 1)
            await this.afs.collection(this.afAuth.auth.currentUser.email).doc(this.afAuth.auth.currentUser.uid).
              collection("leaderYCards").doc(nameTournament).collection('table').doc(cardPlayer.Id).
              update({ nYCards: 1, LastMatchweek: nJornada });
          else
            await this.afs.collection(this.afAuth.auth.currentUser.email).doc(this.afAuth.auth.currentUser.uid).
              collection("leaderYCards").doc(nameTournament).collection('table').doc(cardPlayer.Id).
              update({ nYCards: player.docs[0].data().nYCards + 1, LastMatchweek: nJornada });
        });
      }
      else
        await this.afs.collection(this.afAuth.auth.currentUser.email).doc(this.afAuth.auth.currentUser.uid).
          collection("leaderYCards").doc(nameTournament).collection('table').doc(cardPlayer.Id).
          set({ Player: cardPlayer, nYCards: 1, LastMatchweek: nJornada });
    });
  }

  async updateLeaderboard(idTeam: string, gf: number, gc: number, status: string, nameTournament: string) {
    const getTeamTable = (id) => { return this.afs.collection(this.afAuth.auth.currentUser.email).doc(this.afAuth.auth.currentUser.uid).collection("leaderboard").doc(nameTournament).collection('table').ref.where("team.Id", "==", id).get(); }
    const team = await getTeamTable(idTeam);
    if (!status.localeCompare('win'))
      return await this.afs.collection(this.afAuth.auth.currentUser.email).doc(this.afAuth.auth.currentUser.uid).collection('leaderboard').doc(nameTournament).collection('table').doc(idTeam).update({ pts: team.docs[0].data().pts + 3, jj: team.docs[0].data().jj + 1, dg: team.docs[0].data().dg + gf - gc, jg: team.docs[0].data().jg + 1, gf: team.docs[0].data().gf + gf, gc: team.docs[0].data().gc + gc });
    else if (!status.localeCompare('lose'))
      return await this.afs.collection(this.afAuth.auth.currentUser.email).doc(this.afAuth.auth.currentUser.uid).collection('leaderboard').doc(nameTournament).collection('table').doc(idTeam).update({ jj: team.docs[0].data().jj + 1, dg: team.docs[0].data().dg + gf - gc, jp: team.docs[0].data().jp + 1, gf: team.docs[0].data().gf + gf, gc: team.docs[0].data().gc + gc });
    else
      return await this.afs.collection(this.afAuth.auth.currentUser.email).doc(this.afAuth.auth.currentUser.uid).collection('leaderboard').doc(nameTournament).collection('table').doc(idTeam).update({ pts: team.docs[0].data().pts + 1, jj: team.docs[0].data().jj + 1, dg: team.docs[0].data().dg + gf - gc, je: team.docs[0].data().je + 1, gf: team.docs[0].data().gf + gf, gc: team.docs[0].data().gc + gc });
  }

  async cleanLeaderboard(nameTournament: string) {
    const getReg = () => {
      return this.afs.collection(this.afAuth.auth.currentUser.email).doc(this.afAuth.auth.currentUser.uid).collection('leaderboard').doc(nameTournament).collection('table').ref.get();
    }
    const registros = await getReg();
    for (const iterator of registros.docs)
      await iterator.ref.update({ pts: 0, jj: 0, dg: 0, jg: 0, je: 0, jp: 0, gf: 0, gc: 0 });
  }

  async cleanLeadergoal(nameTournament: string) {
    const getReg = () => {
      return this.afs.collection(this.afAuth.auth.currentUser.email).doc(this.afAuth.auth.currentUser.uid).collection('leadergoal').doc(nameTournament).collection('table').ref.get();
    }
    const registros = await getReg();
    for (const iterator of registros.docs)
      await iterator.ref.update({ nGoals: 0 });
  }

  async sortTable(nameTournament: string) {
    let TABLA: any[] = [], SOR: StatsTeam[] = [];
    const a = await this.afs.collection(this.afAuth.auth.currentUser.email).doc(this.afAuth.auth.currentUser.uid).collection('leaderboard').doc(nameTournament).collection('table').ref.get();
    for (const iterator of a.docs)
      TABLA.push(iterator.data());
    SOR = await TABLA.sort((a: any, b: any) => {
      if (a.pts > b.pts)
        return -1;
      if (a.pts < b.pts)
        return 1;
      if (a.pts == a.pts) {
        if (a.dg > b.dg)
          return -1;
        if (a.dg < b.dg)
          return 1;
        if (a.dg == b.dg) {
          if (a.gf > b.gf)
            return -1;
          if (a.gf < b.gf)
            return 1;
        }
      }
    });
    for (let i = 0; i < SOR.length; i++) {
      await this.afs.collection(this.afAuth.auth.currentUser.email).doc(this.afAuth.auth.currentUser.uid).collection("leaderboard").doc(nameTournament).collection('table').doc(SOR[i].team.Id).update({ pos: (i + 1) });
    }
  }

  async setLeadergoal(goalsLocal: Player[], goalsVisit: Player[], nameTournament: string) {
    this.setPlayersLeaderSum(this.getPlayersGoalsSum(goalsLocal), nameTournament);
    this.setPlayersLeaderSum(this.getPlayersGoalsSum(goalsVisit), nameTournament);
  }

  setPlayersLeaderSum(arrayPlayer, nameTournament: string) {
    const getPlayerLeadergoal = (playerId) => { return this.afs.collection(this.afAuth.auth.currentUser.email).doc(this.afAuth.auth.currentUser.uid).collection("leadergoal").doc(nameTournament).collection('table').ref.where("Player.Id", "==", playerId).get(); }
    arrayPlayer.forEach(async goalPlayer => {
      const player = await getPlayerLeadergoal(goalPlayer.player.Id);
      if (player.size > 0)
        this.afs.collection(this.afAuth.auth.currentUser.email).doc(this.afAuth.auth.currentUser.uid).collection("leadergoal").doc(nameTournament).collection('table').doc(goalPlayer.player.Id).update({ nGoals: player.docs[0].data().nGoals + goalPlayer.nGoals });
      else
        this.afs.collection(this.afAuth.auth.currentUser.email).doc(this.afAuth.auth.currentUser.uid).collection("leadergoal").doc(nameTournament).collection('table').doc(goalPlayer.player.Id).set({ Player: goalPlayer.player, nGoals: goalPlayer.nGoals });
    });
  }

  getPlayersGoalsSum(arrayPlayers: Player[]) {
    let goals: any[] = [];
    arrayPlayers.forEach((goalPlayer: Player) => {
      if (!goals.some(element => element.player.Id.includes(goalPlayer.Id)))
        goals.push({ player: goalPlayer, nGoals: 1 });
      else
        goals.find(x => x.player.Id === goalPlayer.Id).nGoals += 1;
    });
    return goals;
  }

  async sortTableLeadergoal(nameTournament: string) {
    let TABLA: any[] = [], SOR: any[] = [];
    const a = await this.afs.collection(this.afAuth.auth.currentUser.email).doc(this.afAuth.auth.currentUser.uid).collection('leadergoal').doc(nameTournament).collection('table').ref.get();
    for (const iterator of a.docs) {
      if (iterator.data().nGoals == 0)
        await iterator.ref.delete();
      else
        TABLA.push(iterator.data());
    }
    SOR = await TABLA.sort(((a: any, b: any) => {
      if (a.nGoals > b.nGoals)
        return -1;
      if (a.nGoals < b.nGoals)
        return 1;
    }));
    for (let i = 0; i < SOR.length; i++) {
      await this.afs.collection(this.afAuth.auth.currentUser.email).doc(this.afAuth.auth.currentUser.uid).collection("leadergoal").doc(nameTournament).collection('table').doc(SOR[i].Player.Id).update({ pos: (i + 1) });
    }
  }
}