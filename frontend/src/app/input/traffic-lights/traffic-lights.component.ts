import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'true-traffic-lights',
    templateUrl: './traffic-lights.component.html',
    styleUrls: ['./traffic-lights.component.scss'],
    standalone: false
})
export class TrafficLightsComponent implements OnInit {
  @Input() thresholds;
  @Input() value;
  @Input() selected;
  @Input() readonly;
  @Output() selectedChange = new EventEmitter();
  @Output() change = new EventEmitter();
  
  constructor() { }

  ngOnInit(): void { }

  transformClassname(classname) {
    return classname.toLowerCase().replace(" ", "-").replace("/", "-");
  }

  itemClass(threshold): string[] {
    var classname;

    if (threshold.color) {
      classname = this.transformClassname(threshold.color);
    } else {
      classname = this.transformClassname(threshold.description.name);
    }
    let items = [classname];
    
    if (this.value !== null && this.value != undefined) {
      if (threshold.value == this.value) {
        items.push('selected');
      }
    }

    if (this.selected !== undefined) {
      items.push('clickable');
      if (this.selected == threshold.value) {
        items.push('clicked');
      }
    }

    return items;
  }

  click(threshold) {
    if (!this.readonly) {
      if (this.selected !== undefined) {
        if (this.value == threshold.value || this.selected == threshold.value) {
          this.selected = null;
        } else {
          this.selected = threshold.value;
        }
        this.selectedChange.emit(this.selected);
        this.change.emit();
      }
    }
  }
}