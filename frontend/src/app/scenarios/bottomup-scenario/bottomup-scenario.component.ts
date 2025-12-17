import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { ConfigService } from 'src/app/_services/config.service';

@Component({
    selector: 'true-bottomup-scenario',
    templateUrl: './bottomup-scenario.component.html',
    styleUrls: ['./bottomup-scenario.component.scss'],
    standalone: false
})
export class BottomupScenarioComponent implements OnInit {

  @Input() scenario;
  @Input() assessmentName;
  @Input() idx;
  @Output() removeClick = new EventEmitter();

  public evaluationData;
  public changedEvaluationData;
  public inputChanges;
  public name;
  public created;

  constructor(public readonly config: ConfigService) { }

  ngOnInit(): void {
    this.evaluationData = this.scenario.content.original_data;
    this.changedEvaluationData = this.scenario.content.changed_data;
    this.inputChanges = this.scenario.content.input_changes;
    this.name = this.scenario.content.name;
    this.created = Date.parse(this.scenario.content.timestamp);
  }

  remove() {
    this.removeClick.emit();
  }
}
