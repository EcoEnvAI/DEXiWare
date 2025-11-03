import { Component, OnInit, OnDestroy, ViewChild, ElementRef, HostListener, Output, EventEmitter } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { ApiService } from '../_services/api.service';
import { AnalysisService } from '../_services/analysis.service';
import { ConfigService } from '../_services/config.service';

@Component({
    selector: 'true-analysis',
    templateUrl: './analysis.component.html',
    styleUrls: ['./analysis.component.scss'],
    standalone: false
})
export class AnalysisComponent implements OnInit, OnDestroy {
  private assessmentId;
  public assessmentName;

  public evaluationData;
  public changedEvaluationData;
  public pillars;
  public nodes;

  public topDownModal = false;
  public topDownData = null;
  public topDownChanged = false;  

  public isLoading = false;

  @Output() loaded = new EventEmitter();
  
  @ViewChild('topDownPicker') topDownPicker: ElementRef;
  
  @HostListener('document:click', ['$event.target'])
  public onClick(targetElement) {
    if (this.topDownModal) {
      const clickedInside = this.topDownPicker.nativeElement.contains(targetElement);
      if (!clickedInside) {
        this.closeTopDownModal();
      }
    }
  }

  constructor(private api: ApiService, private analysis: AnalysisService, public location: Location, private router: Router, private route: ActivatedRoute, public readonly config: ConfigService) {
  }

  ngOnInit(): void {
    let self = this;

    if (this.config.pillar_models) {
      this.api.getAssessment().subscribe((assessment) => {
        this.assessmentId = assessment.id;
        this.assessmentName = assessment.name;

        this.api.getPillars().subscribe(pillars => {
          this.api.getAssessmentEvaluation(this.assessmentId).subscribe((ret: any) => {
            this.pillars = [];

            let evaluationData = []

            for (let model of ret.data) {
              let pillar = pillars.find(p=>p.model == model.model_name);
              let pillarData = this.analysis.getPillarData(pillar, pillar.Nodes, model.alternatives[0].evaluation, pillar.description.description.replaceAll(" ", "_"), pillar.description.name);
              this.pillars.push(pillarData);
              evaluationData.push(pillarData);
            }
            this.evaluationData = evaluationData;
            this.loaded.emit(true);
          });
        });
      });
    } else {
      this.api.getAssessment().subscribe((assessment) => {
        this.assessmentId = assessment.id;
  
        this.api.getAssessmentEvaluation(this.assessmentId).subscribe((ret: any) => {
          this.evaluationData = this.analysis.getEvaluationData(ret.data.alternatives[0].evaluation);
          //  in case of multiple values set all pillar values to worst

          for (let key of Object.keys(this.evaluationData)) {
            if (this.evaluationData[key].length > 0) {
              this.evaluationData[key] = [this.evaluationData[key][0]];
            }
          }
          
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
          
            this.pillars.push(this.analysis.getPillarData(null, nodes, ret.data.alternatives[0].evaluation, 'EnvironmentalPillar', 'Environmental'));
            this.pillars.push(this.analysis.getPillarData(null, nodes, ret.data.alternatives[0].evaluation, 'EconomicPillar', 'Economic'));
            this.pillars.push(this.analysis.getPillarData(null, nodes, ret.data.alternatives[0].evaluation, 'Social-PolicyPillar', 'Social'));

            for (let pillar of this.pillars) {
              pillar.classname = pillar.name.toLowerCase().replaceAll(' ', '-');
            }
          
            for (let node of this.nodes) {
              node.classname = node.name.toLowerCase();              
            }
            this.loaded.emit(true);
          });
        });
      });
    }
  }

  ngOnDestroy() {
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
  
  topDown() {
    this.topDownData = this.analysis.getTopDownData(this.evaluationData);

    setTimeout(()=>{this.topDownModal = true;});
  }

  topDownChange(changedItem) {
    for (let tier of this.topDownData) {
      for (let item of tier) {
        if (item != changedItem) {
          item.change = 0;
        }
      }
    }
    this.topDownChanged = true;
  }

  closeTopDownModal() {
    this.topDownChanged = false;
    this.topDownModal = false;
  }

  generateTopDown() {
    var goal;
    var direction;

    if (this.topDownData[0].change !== 0) {
      goal = "AgriFoodChain";
      if (this.topDownData[0].change > 0) {
        direction = "improve";
      } else {
        direction = "degrade";
      }
    }

    let intersectChanged = this.topDownData[1].find((i) => i.change !== 0);
    if (intersectChanged) {

      let keys = {
        "equitability": "Equitability",
        "viability": "Viability",
        "bearability": "Bearability",
      };
      goal = keys[intersectChanged.name];
      if (intersectChanged.change > 0) {
        direction = "improve";
      } else {
        direction = "degrade";
      }
    }

    let pillarChanged = this.topDownData[2].find((i) => i.change !== 0);
    if (pillarChanged) {
      goal = this.pillars.find(p => p.name.toLowerCase() == pillarChanged.name).key;
      if (pillarChanged.change > 0) {
        direction = "improve";
      } else {
        direction = "degrade";
      }
    }

    this.router.navigate(['topdown', goal, direction], {relativeTo: this.route});    
  }

  valueClass(value): string {
    switch (value) {
      case 0:
        return 'low';
        break;
      case 1:
        return 'medium';
        break;
      case 2:
        return 'high';
        break;
    }
  }

  bottomUp() {
    this.router.navigate(['bottomup'], {relativeTo: this.route});    
  }
}
