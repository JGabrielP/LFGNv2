import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort, MatTableDataSource } from '@angular/material';
import { StatisticsService } from 'src/app/services/statistics/statistics.service';
import { StatsTeam } from 'src/app/models/statsTeam/stats-team';
import { TournamentService } from 'src/app/services/tournament/tournament.service';
import * as jspdf from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css']
})
export class StatisticsComponent implements OnInit {

  public nCards;
  public tournaments;
  public currentTournament;
  public dataSource: any;
  public displayedColumns: string[] = ['pos', 'img', 'name', 'pts', 'jj', 'dg', 'jg', 'je', 'jp', 'gf', 'gc'];
  public dataSourceLeadergoal: any;
  public displayedColumnsLeadergoal: string[] = ['pos', 'img', 'photo', 'name', 'ngoals'];
  public dataSourceLeaderYCards: any;
  public displayedColumnsLeaderYCards: string[] = ['img', 'photo', 'name', 'nYCards'];
  @ViewChild('MatSort') sort: MatSort;
  @ViewChild('hBSort') hBSort: MatSort;
  @ViewChild('sBSort') sBSort: MatSort;

  constructor(private statisticsService: StatisticsService, private tournamentService: TournamentService) {
    this.dataSourceLeadergoal = new MatTableDataSource([]);
    this.dataSourceLeaderYCards = new MatTableDataSource([]);
  }

  async ngOnInit() {
    this.tournaments = await this.tournamentService.getTournaments();
    this.tournaments.subscribe(r => {
      if (r.length > 0) {
        this.currentTournament = r[0].Name;
        this.getLeaderboard(this.currentTournament);
        this.nCards = r[0].nCards;
      }
    });
  }

  async getLeaderboard(tournamentName: string) {
    this.statisticsService.get(tournamentName).subscribe((stats: StatsTeam[]) => {
      this.dataSource = new MatTableDataSource(stats);
    });
    this.statisticsService.getLeadergoal(tournamentName).subscribe(leaderGoal => {
      this.dataSourceLeadergoal = new MatTableDataSource(leaderGoal);
    });
    this.statisticsService.getLeaderYCards(tournamentName).subscribe(YCards => {
      this.dataSourceLeaderYCards = new MatTableDataSource(YCards);
      this.dataSourceLeaderYCards.sort = this.sBSort;
    });
  }

  generateReport(elementId: string) {
    var data = document.getElementById(elementId);
    html2canvas(data).then(canvas => {
      var imgWidth = 190;
      var imgHeight = canvas.height * imgWidth / canvas.width;
      const contentDataURL = canvas.toDataURL('image/png')
      let pdf = new jspdf();
      pdf.text('Reporte de ' + elementId, 10, 20)
      pdf.addImage(contentDataURL, 'PNG', 10, 30, imgWidth, imgHeight)
      pdf.save('Reporte' + elementId + '.pdf');
    });
  }
}
