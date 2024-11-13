import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import indicatorsJsonFile from '../../assets/indicators.json';
import { AuthService } from '../_services/auth.service';

@Component({
  selector: 'app-indicator',
  templateUrl: './indicator.component.html',
  styleUrls: ['./indicator.component.css']
})
export class IndicatorComponent implements OnInit {
  pillarNames = ["ENVIRONMENTAL PILLAR", "ECONOMIC PILLAR", "SOCIO-POLICY PILLAR"];
  currentPillar;
  indicator;

  constructor(private route: ActivatedRoute, private authService: AuthService, private router: Router) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.currentPillar = this.pillarNames[+params.get('pillarId')];
      this.indicator = indicatorsJsonFile[this.currentPillar][+params.get('indicatorId')];
    });
  }

  // builds string with HTML code for displaying indicator's descripton; also used for displaying metrics
  showDescription(description, isArray=false) {
    let htmlString = "";
    for (let desc of description) {
      if (desc instanceof Array) {
        htmlString += "<ul>";
        htmlString += this.showDescription(desc, true);
        htmlString += "</ul>";
      } else if (isArray) {
        htmlString += "<li>" + desc + "</li>";
      } else {
        htmlString += "<p>" + desc + "</p>";
      }
  }
    return htmlString;
  }

  // builds string with HTML code for displaying indicator's ratings
  showRatings() {
    if (this.indicator.RATINGS.length < 2) {
      return "<p>" + this.indicator.RATINGS[0] + "</p>";
    }

    let htmlString = "<ol>";
    for (let rating of this.indicator.RATINGS) {
        htmlString += "<li>" + rating + "</li>";
    }
    htmlString += "</ol>";

    return htmlString;
  }

  // builds string with HTML code for displaying indicator's ratings descriptions
  showRatingsDescriptions() {
    if (this.indicator.RATINGS_DESCRIPTIONS.length == 1) {
      return "<p>" + this.indicator.RATINGS_DESCRIPTIONS[0] + "</p>";
    }

    let htmlString = "<ol>";
    for (let rating of this.indicator.RATINGS_DESCRIPTIONS) {
      if (rating instanceof Array) { // description with bulletpoints
        htmlString += "<li>" + rating[0]
        if (rating.length > 1) {
          htmlString += "<ul>";
          for (let r of rating[1]) {
            htmlString += "<li>" + r + "</li>";
          }
          htmlString += "</ul>";
        }
      } else { // description without bulletpoints
        htmlString += "<li>" + rating;
      }
      htmlString += "</li>";
    }
    htmlString += "</ol>";

    return htmlString;
  }
  logout(){
    this.authService.logout();
    this.router.navigate(['login']);
  }
}
