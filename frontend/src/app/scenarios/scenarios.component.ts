import { Component, OnInit, Input } from '@angular/core';
import { ApiService } from '../_services/api.service';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConfigService } from '../_services/config.service';

@Component({
    selector: 'true-scenarios',
    templateUrl: './scenarios.component.html',
    styleUrls: ['./scenarios.component.scss'],
    standalone: false
})
export class ScenariosComponent implements OnInit {
  public tab = "bottomUp";
  public bottomUpScenarios = [];
  public topDownScenarios = [];
  public isLoading = false;

  private assessmentId;
  public assessmentName;

  public bottomUpPages = [];
  public topDownPages = [];
  @Input() paged;
  @Input() date;

  constructor(private api: ApiService, public readonly config: ConfigService) { }

  ngOnInit(): void {
    this.isLoading = true;
    let self = this;
    this.api.getAssessment().subscribe((assessment) => {
      this.assessmentId = assessment.id;
      this.assessmentName = assessment.name;
      this.load().subscribe(() => {
        self.isLoading = false;
        if (this.paged) {
          for (let i=0; i < Math.ceil(this.bottomUpScenarios.length / 3); i++) {
            let scenarios = [];
            for (let j=i*3; j < Math.min((i+1)*3, this.bottomUpScenarios.length); j++) {
              scenarios.push(this.bottomUpScenarios[j]);
            }
            this.bottomUpPages.push({
              "scenarios": scenarios 
            });
          }

          for (let i=0; i < Math.ceil(this.topDownScenarios.length / 3); i++) {
            let scenarios = [];
            for (let j=i*3; j < Math.min((i+1)*3, this.topDownScenarios.length); j++) {
              scenarios.push(this.topDownScenarios[j]);
            }
            this.topDownPages.push({
              "scenarios": scenarios 
            }); 
          }
        }
      });
    });
  }

  private load(): Observable<boolean> {
    return this.api.getScenarios(this.assessmentId).pipe(
      map((scenarios:any) => {
        for (let scenario of scenarios) {
          if (scenario.type == "bottomup") {
            this.bottomUpScenarios.push(scenario);
          } else if (scenario.type == "topdown") {
            this.topDownScenarios.push(scenario);
          }
        }

        return true;
      })
    );
  }

  topDown() {
    this.tab = "topDown";
  }

  bottomUp() {
    this.tab = "bottomUp";
  }

  remove(scenario) {
    this.api.removeScenario(this.assessmentId, scenario.id).subscribe(() => {
      this.bottomUpScenarios = [];
      this.topDownScenarios = [];
      let self = this;
      this.load().subscribe(() => {
        self.isLoading = false;
      });
    });
  }
}
