import { Component, OnInit, ɵConsole } from '@angular/core';
import { PlayerService } from 'src/app/services/player/player.service';
import { TeamService } from 'src/app/services/team/team.service';
import { TournamentService } from 'src/app/services/tournament/tournament.service';
import { StatisticsService } from 'src/app/services/statistics/statistics.service';
import { Team } from 'src/app/models/team/team';
import { Observable, of } from 'rxjs';
import { Player } from 'src/app/models/player/player';
import { FinancesService } from 'src/app/services/finances/finances.service';
import { Finance } from 'src/app/models/finance/finance';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  public Players: Observable<Player[]>;
  public Teams: Observable<Team[]>;
  public Tournament: Observable<any[]>;
  public teamLeader: Observable<any[]> = of([]);
  public playerLeader: Observable<any[]> = of([]);
  public finances: Observable<Finance[]>;
  public total: number;

  constructor(private playerService: PlayerService, private teamsService: TeamService, private tournamentService: TournamentService, private statisticsService: StatisticsService, private financeService: FinancesService) { }

  ngOnInit() {
    this.Players = this.playerService.get();
    this.Teams = this.teamsService.get();
    this.Tournament = this.tournamentService.getCurrentTournament();
    this.tournamentService.getCurrentTournament().subscribe((tournament: any) => {
      if (tournament.length > 0) {
        this.teamLeader = this.statisticsService.getLeader(tournament[0].Name);
        this.playerLeader = this.statisticsService.getLeadergoalPlayer(tournament[0].Name);
      }
    });
    this.finances = this.financeService.get();
    this.financeService.get().subscribe((results) => {
      this.total = results.map(t => t.Amount).reduce((acc, value) => acc + value, 0);
    });
  }

}
