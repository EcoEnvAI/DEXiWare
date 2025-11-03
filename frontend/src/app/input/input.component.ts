import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from '../_services/api.service';
import { NavigationService } from '../_services/navigation.service';
import { ConfigService } from '../_services/config.service';
import { PillarCompletedActionComponent } from './pillar-completed-action/pillar-completed-action.component';
import { WelcomeComponent } from '../welcome/welcome.component';

@Component({
    selector: 'true-input',
    templateUrl: './input.component.html',
    styleUrls: ['./input.component.scss'],
    standalone: false
})
export class InputComponent implements OnInit {
  private allPillars;
  public pillars;
  public greenhouseSelection = false;
  public selectedSubset;
  public selectedPillar;
  public selectedIndicator;
  public assessmentId;
  public assessmentName;
  public isLoading = false;
  
  constructor(private api: ApiService, private location: Location, private route: ActivatedRoute, private router: Router, private navigation:NavigationService, public readonly config: ConfigService, private dialog: MatDialog) { }

  ngOnInit(): void {
    let self = this;
    this.isLoading = true;

    this.api.getAssessment().subscribe((assessment) => {
      if (!assessment) {
        let dialogRef = this.dialog.open(WelcomeComponent, {
          height: '400px',
          width: '600px'
        });
        this.isLoading = false;
      } else {
        this.assessmentId = assessment.id;
        this.assessmentName = assessment.name;
        self.api.getUserPillars(this.assessmentId).subscribe((data) => {          
          if (self.config.pillar_models) {
            self.allPillars = data;

            let selectedSubset = this.config.subset;
  
            if (selectedSubset) {
              this.selectedSubset = selectedSubset;
              this.filterBySubset();
            } else {
              this.selectedSubset = false;
            }
          } else {
            self.pillars = data;

            let pillar = this.route.snapshot.paramMap.get('pillar');
            
            if (pillar != null) {
              this.selectedPillar = this.pillars.find((p) => p.classname == pillar);
            }
          }

          this.route.params.subscribe((params) => {
            if (self.selectedPillar && self.selectedPillar.classname != params["pillar"]) {
              this.selectedPillar = this.pillars.find((p) => p.classname == params["pillar"]);
            }
          });

          this.isLoading = false;
        });
      }
    });
  }
  
  selectPillar(pillar) {
    this.selectedPillar = pillar;
  }

  selectIndicator(indicator) {
    let pillar = this.pillars.find((p) => p.id==indicator.pillarId);
    this.selectedPillar = pillar;
    this.selectedIndicator = indicator;
    this.navigation.navigate('/input/' + pillar.classname + '/' + indicator.id);
  }

  updateSelectedPillar(pct) {
    this.selectedPillar.pct = pct;
  }

  selectNextPillar() {
    let idx = this.pillars.findIndex((p) => p.id == this.selectedPillar.id);
    if (idx == this.pillars.length - 1) {
      // Todo: find first non-complete
    } else {
      this.selectedPillar = this.pillars[idx + 1];
    }
  }

  next(next) {

    if (next) {
      let idx = this.pillars.findIndex((p) => p.id == this.selectedPillar.id);
      let last = (idx == this.pillars.length - 1);

      let dialogRef = this.dialog.open(PillarCompletedActionComponent, {
        height: '400px',
        width: '600px',
        data :{completed: this.selectedPillar.answerCount.toString(), total: this.selectedPillar.indicatorCount.toString(), last: last}
      });
      dialogRef.afterClosed().subscribe(action => {
        window.scrollTo(0, 0);
        if (action == 1) {
          this.router.navigate(['analysis']);
        } else if (action == 0) {
          this.selectNextPillar();
        } else {
          // find first missing indicator
          this.api.getUserPillarIndicators(this.assessmentId, this.selectedPillar.id).subscribe((indicators) => {
            for (let indicator of indicators) {
              if (indicator.Assessment_indicator_answers.length == 0) {
                this.selectedIndicator = indicator;
                break;
              }
            }
          });
        }
      });
    } else {
      let idx = this.pillars.findIndex((p) => p.id == this.selectedPillar.id);
      if (idx == 0) {
        this.selectedPillar = this.pillars[this.pillars.length - 1];
      } else {
        this.selectedPillar = this.pillars[idx - 1];
      }
    }
  }

  selectSubset = function(subset) {
    this.selectedSubset = subset;
    this.config.subset = this.selectedSubset;

    this.router.navigateByUrl('/scenarios', {skipLocationChange: true}).then(()=> {
      this.router.navigateByUrl(this.config.backLink);
    });
  }

  filterBySubset = function () {
    let parts = this.selectedSubset.split("_");

    this.pillars = this.allPillars.filter(p => p.description.description.endsWith("_" + parts[0]));

    if (parts.length == 2) {
      if (parts[1] == "HYDROPONICS") {
        this.pillars = this.pillars.filter(p => !p.description.description.startsWith("ENVIRON"));
      }
    }

    let pillar = this.route.snapshot.paramMap.get('pillar');
        
    if (pillar != null) {
      this.selectedPillar = this.pillars.find((p) => p.classname == pillar);
    }
  }

  displayGreenhouseSelection = function () {
    this.greenhouseSelection = true;
  }

  back = function () {
    if (this.config.pillar_models) {
      if (this.greenhouseSelection) {
        this.greenhouseSelection = false;
      } else {
        this.config.resetSubset();
  
        this.router.navigateByUrl('/scenarios', {skipLocationChange: true}).then(()=> {
          this.router.navigateByUrl(this.config.backLink);
        });
      }
    } else {
      this.router.navigateByUrl('/scenarios', {skipLocationChange: true}).then(()=> {
        this.router.navigateByUrl(this.config.backLink);
      });
    }

    return false;
  }
}
