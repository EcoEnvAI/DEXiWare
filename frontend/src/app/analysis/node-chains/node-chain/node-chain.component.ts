import { Component, OnInit, Input } from '@angular/core';
import { ConfigService } from 'src/app/_services/config.service';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'true-node-chain',
    templateUrl: './node-chain.component.html',
    styleUrls: ['./node-chain.component.scss'],
    standalone: false
})
export class NodeChainComponent implements OnInit {
  @Input() nodes;
  @Input() type;

  public width = 265;
  public height = 72;
  public iconStyle = {
    'width.px' :42,
    'height.px': 42,
    zIndex: 100,
    position: 'relative',
    'top.px': 18,
    'left.px': 0
  };
  public strokeWidth = 2;
  
  public baseHref = environment.backendServer;

  constructor(public readonly config: ConfigService) { }

  ngOnInit(): void {
    if (this.type == "analysis") {
      this.iconStyle = {
        'width.px' :20,
        'height.px': 20,
        zIndex: 100,
        position: 'relative',
        'top.px': 18,
        'left.px': 0
      };
      this.width = 70;
      this.height = 38;
      this.strokeWidth = 3;
    }    
  }

  nodeClass(value): string {
    if (Array.isArray(value)) {
      // TODO: see issue #91
      if (value.length == 3) {
        return 'undefined';
      }
      return value.map(v => this.nodeClass(v)).join('-');
    } else {      
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
        case -1:
          return 'undefined';
          break;
      }
    }
  }
}
