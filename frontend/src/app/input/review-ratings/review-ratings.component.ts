import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { map } from 'rxjs/operators';
import { ApiService } from '../../_services/api.service';
import { ConfigService } from '../../_services/config.service';

@Component({
    selector: 'true-review-ratings',
    templateUrl: './review-ratings.component.html',
    styleUrls: ['./review-ratings.component.scss'],
    standalone: false
})
export class ReviewRatingsComponent implements OnInit {
  @Input() assessmentId;
  @Input() pillars;
  @Output() selectPillar = new EventEmitter();
  @Output() selectIndicator = new EventEmitter();

  public nodes;
  public indicators;

  constructor(private api: ApiService, public readonly config: ConfigService) { }

  ngOnInit(): void {
    let self = this;

    this.api.getNodes().pipe(
      map((nodes: any[]) => {
        for (let node of nodes) {
          node.indicators = [];
        }
        return nodes;
      })
    ).subscribe((nodes) => {
      self.nodes = nodes;
    });

    this.api.getUserIndicators(this.assessmentId).pipe(
      map((inputs: any[]) => {
        let indicators = {};
        
        for (let input of inputs) {
          if (!indicators[input.pillarId]) {
            indicators[input.pillarId] = {};
          }
          if (!indicators[input.pillarId][input.nodeId]) {
            indicators[input.pillarId][input.nodeId] = [];
          }
          indicators[input.pillarId][input.nodeId].push(input);
        }

        return indicators;
    })).subscribe((indicators) => {
      this.indicators = indicators;
      console.log(this.pillars);
    });
  }

  pillarClass(pillar) {
    return pillar.classname;
  }

  clickPillar(pillar) {
    this.selectPillar.emit(pillar);
  }

  clickIndicator(indicator) {
    this.selectIndicator.emit(indicator);
  }

  clearIndicators(event, pillar, node) {
    event.preventDefault();
    
    if (node ) {
      for (let indicator of this.indicators[pillar.id][node.id]) {
        this.clearIndicator(indicator);
      }
    } else {
      for (let idx of Object.keys(this.indicators[pillar.id])) {
        for (let indicator of this.indicators[pillar.id][idx]) {
          this.clearIndicator(indicator);
        }
      }
    }

    return false;
  }

  clearIndicator(indicator) {
    this.api.submitAssessmentIndicator(this.assessmentId, indicator.id, null).subscribe((ret) => {
      indicator.value = null;
    });
  }
}
