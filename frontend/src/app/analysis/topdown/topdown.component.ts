import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationStart } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { map } from 'rxjs/operators';
import { Location } from '@angular/common';
import { CanComponentDeactivate } from '../../_services/navigation-guard.service';
import { ApiService } from '../../_services/api.service';
import { AnalysisService } from '../../_services/analysis.service';
import { ScenarioNameComponent } from '../scenario-name/scenario-name.component';

@Component({
    selector: 'true-topdown',
    templateUrl: './topdown.component.html',
    styleUrls: ['./topdown.component.scss'],
    standalone: false
})
export class TopdownComponent implements OnInit, OnDestroy, CanComponentDeactivate {
  public originalData;
  private assessmentId;
  public assessmentName;
  private topDownGoal;
  private topDownData;
  private nodes;

  public topDownDirection = null;
  public topDownVariations = null;

  public pillars;
  public topDownGoalName;
  public evaluationData;

  public isLoading = false;

  private savedScenarios = [];
  private navigationSubscription;
  lastTrigger: 'imperative' | 'popstate' | 'hashchange';

  constructor(private api: ApiService, private analysis: AnalysisService, public location: Location, private router: Router, private route: ActivatedRoute, private dialog: MatDialog) {
    this.isLoading = true;
    this.topDownGoal = this.route.snapshot.paramMap.get('goal');
    this.topDownGoalName = this.topDownGoal;
    this.topDownDirection = this.route.snapshot.paramMap.get('direction');

    this.api.getAssessment().subscribe((assessment) => {
      this.assessmentId = assessment.id;
      this.assessmentName = assessment.name;
      this.api.getAssessmentEvaluation(this.assessmentId).subscribe((ret: any) => {
        this.originalData = ret.data.alternatives[0].evaluation;
        this.evaluationData = this.analysis.getEvaluationData(ret.data.alternatives[0].evaluation);
        this.topDownData = this.analysis.getTopDownData(this.originalData);

        this.pillars = [];

        this.api.getNodes().pipe(
          map((nodes: any[]) => {
            for (let node of nodes) {
              node.indicators = [];
            }
            return nodes;
          })
        ).subscribe(nodes => {
          this.nodes = nodes;

          this.pillars.push(this.analysis.getPillarData(null, this.nodes, ret.data.alternatives[0].evaluation, 'EnvironmentalPillar', 'Environmental'));
          this.pillars.push(this.analysis.getPillarData(null, this.nodes, ret.data.alternatives[0].evaluation, 'EconomicPillar', 'Economic'));
          this.pillars.push(this.analysis.getPillarData(null, this.nodes, ret.data.alternatives[0].evaluation, 'Social-PolicyPillar', 'Social'));
          
          let changes = {
            goal: this.topDownGoal,
            direction: this.topDownDirection
          };

          if (this.topDownGoal == "AgriFoodChain") {
            changes["locked"] = [];
          } else {
            let keys = {
              "Equitability": "equitability",
              "Viability": "viability",
              "Bearability": "bearability",
            };
      
            let intersectChanged = this.topDownData[1].find((i) => i.name == keys[this.topDownGoal]);
            if (intersectChanged) {
              console.log(intersectChanged.name);
              changes["locked"] = Object.keys(keys).filter(p => keys[p] != intersectChanged.name);
            }

            let pillarChanged = this.topDownData[2].find((i) => i.name == this.topDownGoal);
            if (pillarChanged) {
              changes["locked"] = this.pillars.filter(p=>p.name.toLowerCase() != this.topDownGoal).map(p=>p.key);
            }
          }

          this.api.getAssessmentTopDownEvaluation(this.assessmentId, changes).subscribe((ret: any) => {
            this.topDownVariations = [];

            if (ret.data.generated.solutions > 0) {
              for (let alternative of ret.data.generated.alternatives) {
                let evaluationData = this.analysis.getEvaluationData(alternative);
                let pillars = this.pillars.map(x => JSON.parse(JSON.stringify(x)));
                
                let changedPillar = pillars.find(p=>p.key==this.topDownGoal);

                if (changedPillar) {
                  changedPillar.nodes = changedPillar.nodes.map(x => Object.assign({}, x));
                  this.topDownGoalName = changedPillar.name;

                  for (let node of changedPillar.nodes) {
                    let nodename = node.name;

                    let newnode = alternative.find(o=>o.path.includes('/' + this.topDownGoal + '/' + nodename) && (o.path.match(/\//g)).length == 3);
                    node.value = this.analysis.stringToValue(newnode.values[0]);
                  }
                } else if (this.topDownGoal == "AgriFoodChain") {
                  this.topDownGoalName = "Sustainability";

                  for (let pillar of pillars) {
                    for (let node of pillar.nodes) {
                      let nodename = node.name;
  
                      let newnode = alternative.find(o=>o.path.includes('/' + pillar.key + '/' + nodename) && (o.path.match(/\//g)).length == 3);
                      let newvalue = this.analysis.stringToValue(newnode.values[0]);
                      if (newvalue != node.value) {
                        node.value = newvalue;
                      }
                    }
                  }
                } else {
                  this.topDownGoalName = this.topDownGoal;
                }

                let changes = this.getChanges(this.originalData, alternative);
                this.topDownVariations.push({
                  "pillars": pillars,
                  "evaluationData": evaluationData,
                  "changes": changes
                });
              }
            }
            this.savedScenarios = this.topDownVariations.map(v=>false);
            this.isLoading = false;
          });
        });
      });
    });

    this.navigationSubscription = this.router.events.subscribe((e: any) => {
      if (e instanceof NavigationStart) {
        console.log(e);
        this.lastTrigger = e.navigationTrigger;
      }
    });
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    if (this.navigationSubscription) {
      this.navigationSubscription.unsubscribe();
    }
  }

  translateIfPillar(key) {
    let values = {
      "EnvironmentalPillar": "Environmental",
      "EconomicPillar": "Economic",
      "Social-PolicyPillar": "Social"
    }
    if (key in values) {
      return values[key];
    } else {
      return key;
    }
  }

  getChanges(original, evaluation) {
    let changes = [];
    for (let single of evaluation) {
      let parts = single.path.split("/");

      let size = parts.length;

      var name;

      if (size <= 2 || (size == 3 && parts[1] == "AgriFoodChain")) {
        name = this.translateIfPillar(parts.pop());
      } else {
        let pillar = parts.pop();
        let node = parts.pop();

        if (pillar.includes('_')) {
          let items = pillar.split("_");
          pillar = items[1];

          if (parts[1] == "AgriFoodChain") {
            node = items[0];
          }
        }

        name = this.translateIfPillar(pillar) + "/" + node;
      }

      let orig = original.find(o => o.path == single.path);

        if (single.values[0] != orig.values[0]) {
          changes.push({
            "path": this.translateIfPillar(name),
            "orig": orig.values[0],
            "new": single.values[0] 
          });
        }  
    }

    return changes;
  }

  canDeactivate() {
    if (this.savedScenarios.filter(s=>s==false).length == 0) {
      return true;
    } else {
      return confirm("Changes detected. Are you sure you want to leave this page?");
    }
  }

  saveScenario(content, idx) {

    let dialogRef = this.dialog.open(ScenarioNameComponent, {
      height: '400px',
      width: '600px'
    });
    dialogRef.afterClosed().subscribe(name => {
      window.scrollTo(0, 0);

      content["name"] = name;

      let data = {
        "type": "topdown",
        "content": content
      };

      this.isLoading = true;
      let self = this;

      this.api.createScenario(this.assessmentId, data).subscribe((ret) => {
        self.isLoading = false;
        this.savedScenarios[idx] = true;
      });
    });
  }
}
