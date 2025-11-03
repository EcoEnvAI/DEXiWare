import { Component, Input, OnInit, ElementRef } from '@angular/core';

@Component({
    selector: 'true-circular-progress',
    templateUrl: './circular-progress.component.html',
    styleUrls: ['./circular-progress.component.scss'],
    standalone: false
})
export class CircularProgressComponent implements OnInit {
  get pct() {
    return this._pct;
  }
  @Input() set pct (value) {
    this._pct = value;
    this.redraw();
  }

  @Input() bgWidth: number;
  @Input() strokeWidth: number;
  @Input() icon: string;
  @Input() iconSize: number;

  private _pct;

  size = 0;
  center = 0;
  radius = 0;
  
  dasharray=0;
  offset=0;
  iconStyle = {};
  
  constructor(private elementRef: ElementRef) { }

  ngOnInit(): void {
    this.redraw();
  }

  redraw(): void {
    this.size = Math.min(this.elementRef.nativeElement.clientWidth, this.elementRef.nativeElement.clientHeight);
    this.center = this.size / 2;
    this.radius = this.size / 2 - this.strokeWidth / 2;

    let circumference = 2 * Math.PI * this.radius;
    this.dasharray = circumference;
    this.offset = circumference*(1-this._pct/100)
    
    this.iconStyle = {
      'width.px': this.iconSize,
      'height.px': this.iconSize,
      zIndex: 0,
      position: 'relative',
      'top.px': -(this.size/2 + this.iconSize/2),
      'left.px': this.size/2 - this.iconSize/2
    }
  }
}
