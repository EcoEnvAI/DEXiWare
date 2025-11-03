import { Component, OnInit, Input } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'true-pillar-icon',
    templateUrl: './pillar-icon.component.html',
    styleUrls: ['./pillar-icon.component.scss'],
    standalone: false
})
export class PillarIconComponent implements OnInit {
  @Input() pillar;
  @Input() value;

  iconStyle = {
    'width.px': 24,
    'height.px': 24,
    zIndex: 0,
    position:'relative',
    'top.px': 16,
    'left.px': 0
  }

  public baseHref = environment.backendServer;

  constructor() { }

  ngOnInit(): void {
  }

  icon() {
    return this.pillar.toLowerCase() + 'WhiteBg.svg';
  }

  valueClass() {
    var value;

    if (Array.isArray(this.value)) {
      return this.value.map(value => this.singleValueClass(value)).join('-');
    } else {
      value = this.value;
      return this.singleValueClass(value);
    }
  }

  singleValueClass(value) {
    switch (value) {
      case 0:
        return 'low';
        break;

      case 1:
        return 'medium';
        break;

      case 2:
        return 'high';
        break;
    }
  }
}
