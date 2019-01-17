import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort, MatTableDataSource } from '@angular/material';
import { StatisticsService } from 'src/app/services/statistics/statistics.service';
import { StatsTeam } from 'src/app/models/statsTeam/stats-team';
import { TournamentService } from 'src/app/services/tournament/tournament.service';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css']
})
export class StatisticsComponent implements OnInit {

  public tournaments;
  public currentTournament;
  public dataSource: any;
  public displayedColumns: string[] = ['pos', 'img', 'name', 'pts', 'jj', 'dg', 'jg', 'je', 'jp', 'gf', 'gc'];
  public dataSourceLeadergoal: any;
  public displayedColumnsLeadergoal: string[] = ['pos', 'img', 'photo', 'name', 'ngoals'];
  @ViewChild(MatSort) sort: MatSort;

  constructor(private statisticsService: StatisticsService, private tournamentService: TournamentService) { }

  async ngOnInit() {
    this.tournaments = await this.tournamentService.getTournaments();
    this.tournaments.subscribe(r => {
      if (r.length > 0) {
        this.currentTournament = r[0].Name;
        this.getLeaderboard(this.currentTournament);
      }
    });
  }

  async getLeaderboard(tournamentName: string) {
    this.statisticsService.get(tournamentName).subscribe((stats: StatsTeam[]) => {
      this.dataSource = new MatTableDataSource(stats);
      this.sort.active = 'pos';
      this.sort.direction = 'asc';
      this.dataSource.sort = this.sort;
    });
    this.statisticsService.getLeadergoal(tournamentName).subscribe((stats: StatsTeam[]) => {
      this.dataSourceLeadergoal = new MatTableDataSource(stats);
      this.sort.active = 'pos';
      this.sort.direction = 'asc';
      this.dataSourceLeadergoal.sort = this.sort;
    });
  }
}
