import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'true-chain',
    templateUrl: './chain.component.html',
    styleUrls: ['./chain.component.scss'],
    standalone: false
})
export class ChainComponent implements OnInit {

  @Input() enabled:boolean;
  @Input() items;
  @Input() activeItem;
  @Output() select:EventEmitter<any> = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

  selectItem(item): void {
    this.select.emit(item);
  }
}
