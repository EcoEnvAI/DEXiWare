import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'true-indicator-row',
    templateUrl: './indicator-row.component.html',
    styleUrls: ['./indicator-row.component.scss'],
    standalone: false
})
export class IndicatorRowComponent implements OnInit {
  @Input() indicator;
  @Input() selected;
  @Input() readonly;
  @Output() selectedChange = new EventEmitter();
  @Output() click = new EventEmitter();

  showTooltip = false;

  constructor() { }

  ngOnInit(): void {
  }

  thresholdClass(threshold, value) {
    let classNames = [];
    classNames.push(threshold.color.toLowerCase().replace(" ", "-").replace("/", "-"));
    if (value == threshold.value) {
      classNames.push('selected');
    }

    return classNames;
  }

  select() {
    this.click.emit('');
  }

  enter() {
    this.showTooltip = true;
  }

  leave() {
    this.showTooltip = false;
  }
 
  changed() {
    if (!this.readonly) {
      this.selectedChange.emit(this.selected);
    }
  }
}
