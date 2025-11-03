import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'true-bullet',
    templateUrl: './bullet.component.html',
    styleUrls: ['./bullet.component.scss'],
    standalone: false
})
export class BulletComponent implements OnInit {
  @Input() text: string;
  @Input() complete: boolean;
  @Input() active: boolean;
  @Input() enabled: boolean;
  @Input() first: boolean;
  @Input() last: boolean;
  @Output() select:EventEmitter<any> = new EventEmitter();
  
  showTooltip = false;
  stroke = "";
  fill = ""
  radius = 7;
  strokeWidth = 2;
  width = 50;
  centerX = 35;
  lineStart = 0;
  lineEnd = 50;
  svgClass = "nonclickable";

  constructor() { }

  ngOnInit(): void {
    this.calc();
  }

  ngOnChanges(): void {
    this.calc();
  }

  calc(): void {
    if (this.first) {
      if (this.last) {
        this.centerX = 15;
        this.lineStart = 15;
        this.lineEnd=15;
      } else {
        this.width = 30;
        this.centerX = 15;
        this.lineStart = 15;
      }
    } else if (this.last) {
      this.lineEnd=40;
    }

    if (this.enabled) {
      this.stroke = "#707070"
      if (this.complete) {
        this.fill = "#707070";
      } else {
        this.fill = "#ffffff";
      }
      if (this.active) {
        this.strokeWidth = 8
        this.radius = 11;
        this.svgClass = "nonclickable";
      } else {
        this.strokeWidth = 2
        this.radius = 7;
        this.svgClass = "clickable";
      }
    } else {
      this.stroke = "#BFBFBF"
      this.strokeWidth = 2
      this.radius = 7;
      this.svgClass = "clickable";
      if (this.complete) {
        this.fill = "#E4E4E4";
      } else {
        this.fill = "#ffffff";
      }
    }
  }

  enter() {
    this.showTooltip = true;
  }

  leave() {
    this.showTooltip = false;
  }

  handleClick(): void {
    this.select.emit(this);
  }
}
