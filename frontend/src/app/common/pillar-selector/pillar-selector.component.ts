import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'true-pillar-selector',
    templateUrl: './pillar-selector.component.html',
    styleUrls: ['./pillar-selector.component.scss'],
    standalone: false
})
export class PillarSelectorComponent implements OnInit {
  @Input() pillars;
  @Input() class;
  @Input() selectedPillar;
  @Output() select = new EventEmitter();

  private baseHref = environment.backendServer;

  constructor() { }

  ngOnInit(): void {
  }

  pillarClass(pillar) {
    let classList = [pillar.classname];

    if ((pillar.classname.match(/-/g) || []).length >1) {
      classList.push("long");
    }

    if (!this.selectedPillar || this.selectedPillar.id == pillar.id) {
      classList.push("selected");
    }

    return classList;
  }

  pillarIcon(pillar) {
    let icon = this.baseHref + "assets/icons/pillars/" + pillar.classname + ".svg";
    return icon;
  }

  pillarIconSize(pillar) {
    switch (pillar.classname) {
      case "economic":
      case "resource-use-efficiency":
        return 23;

      case "environmental":
        return 28;

      case "social":
      case "socio-economic":
        return 26;
    }
  }

  selectPillar(pillar) {
    this.select.emit(pillar);
  }
}
