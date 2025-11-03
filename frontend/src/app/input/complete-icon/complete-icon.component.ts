import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'true-complete-icon',
    templateUrl: './complete-icon.component.html',
    styleUrls: ['./complete-icon.component.scss'],
    standalone: false
})
export class CompleteIconComponent implements OnInit {
  @Input() value;

  constructor() { }

  ngOnInit(): void {
  }
}
