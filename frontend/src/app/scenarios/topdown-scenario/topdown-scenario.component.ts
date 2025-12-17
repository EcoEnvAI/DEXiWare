import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { ConfigService } from 'src/app/_services/config.service';

@Component({
    selector: 'true-topdown-scenario',
    templateUrl: './topdown-scenario.component.html',
    styleUrls: ['./topdown-scenario.component.scss'],
    standalone: false
})
export class TopdownScenarioComponent implements OnInit {

  @Input() scenario;
  @Input() assessmentName;
  @Input() idx;
  @Output() removeClick = new EventEmitter();

  public goal;
  public direction;
  public originalData;
  public data;
  public pillars;
  public changes;
  public name;
  public created;

  constructor(public readonly config: ConfigService) { }

  ngOnInit(): void {
    this.goal = this.scenario.content.input_changes.goal;    
    this.direction = this.scenario.content.input_changes.direction;
    this.originalData = this.scenario.content.original_data;
    this.data = this.scenario.content.changed_data;
    this.pillars = this.scenario.content.pillarnodes;
    for (let pillar of this.pillars) {
      pillar.classname = pillar.name.toLowerCase().replaceAll(' ', '-');
    }
    this.changes = this.scenario.content.required_changes;
    this.name = this.scenario.content.name;
    this.created = Date.parse(this.scenario.content.timestamp);
  }

  remove() {
    this.removeClick.emit();
  }
}
