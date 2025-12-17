import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { ConfigService } from '../../../_services/config.service';

@Component({
    selector: 'true-variation',
    templateUrl: './variation.component.html',
    styleUrls: ['./variation.component.scss'],
    standalone: false
})
export class VariationComponent implements OnInit {
  @Input('original-data') originalData;
  @Input() idx;
  @Input() goal;
  @Input() direction;
  @Input() data;
  @Input() pillars;
  @Input() changes;
  @Output() saveClick = new EventEmitter();

  constructor(public readonly config: ConfigService) { }

  ngOnInit(): void {
  }

  saveScenario() {
    let variationData = {
      "input_changes": {
        "goal": this.goal,
        "direction": this.direction
      },
      "required_changes": this.changes,
      "original_data": this.originalData,
      "changed_data": this.data,
      "pillarnodes": this.pillars
    };
    this.saveClick.emit(variationData);
  }
}
