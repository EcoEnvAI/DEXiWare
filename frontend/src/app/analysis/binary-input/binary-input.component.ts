import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
    selector: 'true-binary-input',
    templateUrl: './binary-input.component.html',
    styleUrls: ['./binary-input.component.scss'],
    standalone: false
})
export class BinaryInputComponent implements OnInit {
  @Input('can-improve') canImprove;
  @Input('can-degrade') canDegrade;
  @Input() value;
  @Output() valueChange = new EventEmitter();
  @Output() change = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
    
  }

  degrade() {
    if (this.canDegrade) {
      this.select(-1);
    }
  }

  improve() {
    if (this.canImprove) {
      this.select(1);
    }
  }

  select(value) {
    this.value = value;
    this.valueChange.emit(value);
    this.change.emit(value);
  }
}
