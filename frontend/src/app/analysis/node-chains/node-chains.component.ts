import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'true-node-chains',
    templateUrl: './node-chains.component.html',
    styleUrls: ['./node-chains.component.scss'],
    standalone: false
})
export class NodeChainsComponent implements OnInit {
  @Input() pillars;

  constructor() { }

  ngOnInit(): void {
  }
}
