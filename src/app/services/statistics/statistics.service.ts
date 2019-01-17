import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { StatsTeam } from 'src/app/models/statsTeam/stats-team';
import { Team } from 'src/app/models/team/team';
import { Player } from 'src/app/models/player/player';

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {

  constructor(private afs: AngularFirestore) { }

  get(nameTournament: string) {
    return this.afs.collection('leaderboard').doc(nameTournament).collection('table').valueChanges();
  }

  getLeadergoal(nameTournament: string) {
    return this.afs.collection('leadergoal').doc(nameTournament).collection('table').valueChanges();
  }

  async setLeaderboard(nameTournament: string) {
    await this.cleanLeaderboard(nameTournament);
    await this.cleanLeadergoal(nameTournament);
    const matchweeks = await this.afs.collection('tournaments').doc(nameTournament).collection('Jornadas').ref.get();
    for (const matchweek of matchweeks.docs) {
      const matches = await this.afs.collection('tournaments').doc(nameTournament).collection('Jornadas').doc(matchweek.data().Name).collection('Partidos').ref.get();
      for (const match of matches.docs) {
        if (match.data().Finished) {
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
            await this.setLeadergoal(match.data().GoalsPlayersLocal, match.data().GoalsPlayersVisit, nameTournament, match.data().Local, match.data().Visit);
        }
      }
    }
    await this.sortTable(nameTournament);
    await this.sortTableLeadergoal(nameTournament);
  }

  async updateLeaderboard(idTeam: string, gf: number, gc: number, status: string, nameTournament: string) {
    const getTeamTable = (id) => { return this.afs.collection("leaderboard").doc(nameTournament).collection('table').ref.where("team.Id", "==", id).get(); }
    const team = await getTeamTable(idTeam);
    if (!status.localeCompare('win'))
      return await this.afs.collection('leaderboard').doc(nameTournament).collection('table').doc(idTeam).update({ pts: team.docs[0].data().pts + 3, jj: team.docs[0].data().jj + 1, dg: team.docs[0].data().dg + gf - gc, jg: team.docs[0].data().jg + 1, gf: team.docs[0].data().gf + gf, gc: team.docs[0].data().gc + gc });
    else if (!status.localeCompare('lose'))
      return await this.afs.collection('leaderboard').doc(nameTournament).collection('table').doc(idTeam).update({ jj: team.docs[0].data().jj + 1, dg: team.docs[0].data().dg + gf - gc, jp: team.docs[0].data().jp + 1, gf: team.docs[0].data().gf + gf, gc: team.docs[0].data().gc + gc });
    else
      return await this.afs.collection('leaderboard').doc(nameTournament).collection('table').doc(idTeam).update({ pts: team.docs[0].data().pts + 1, jj: team.docs[0].data().jj + 1, dg: team.docs[0].data().dg + gf - gc, je: team.docs[0].data().je + 1, gf: team.docs[0].data().gf + gf, gc: team.docs[0].data().gc + gc });
  }

  async cleanLeaderboard(nameTournament: string) {
    const getReg = () => {
      return this.afs.collection('leaderboard').doc(nameTournament).collection('table').ref.get();
    }
    const registros = await getReg();
    for (const iterator of registros.docs)
      await iterator.ref.update({ pts: 0, jj: 0, dg: 0, jg: 0, je: 0, jp: 0, gf: 0, gc: 0 });
  }

  async cleanLeadergoal(nameTournament: string) {
    const getReg = () => {
      return this.afs.collection('leadergoal').doc(nameTournament).collection('table').ref.get();
    }
    const registros = await getReg();
    for (const iterator of registros.docs)
      await iterator.ref.update({ nGoals: 0 });
  }

  async sortTable(nameTournament: string) {
    let TABLA: any[] = [], SOR: StatsTeam[] = [];
    const a = await this.afs.collection('leaderboard').doc(nameTournament).collection('table').ref.get();
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
      await this.afs.collection("leaderboard").doc(nameTournament).collection('table').doc(SOR[i].team.Id).update({ pos: (i + 1) });
    }
  }

  async setLeadergoal(goalsLocal: Player[], goalsVisit: Player[], nameTournament: string, teamLocal: Team, teamVisit: Team) {
    this.setPlayersLeaderSum(this.getPlayersGoalsSum(goalsLocal), nameTournament, teamLocal);
    this.setPlayersLeaderSum(this.getPlayersGoalsSum(goalsVisit), nameTournament, teamVisit);
  }

  setPlayersLeaderSum(arrayPlayer, nameTournament: string, team: Team) {
    const getPlayerLeadergoal = (playerId) => { return this.afs.collection("leadergoal").doc(nameTournament).collection('table').ref.where("Player.Id", "==", playerId).get(); }
    arrayPlayer.forEach(async goalPlayer => {
      const player = await getPlayerLeadergoal(goalPlayer.player.Id);
      if (player.size > 0)
        this.afs.collection("leadergoal").doc(nameTournament).collection('table').doc(goalPlayer.player.Id).update({ nGoals: player.docs[0].data().nGoals + goalPlayer.nGoals });
      else
        this.afs.collection("leadergoal").doc(nameTournament).collection('table').doc(goalPlayer.player.Id).set({ Team: team, Player: goalPlayer.player, nGoals: goalPlayer.nGoals });
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
    const a = await this.afs.collection('leadergoal').doc(nameTournament).collection('table').ref.get();
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
      await this.afs.collection("leadergoal").doc(nameTournament).collection('table').doc(SOR[i].Player.Id).update({ pos: (i + 1) });
    }
  }
}