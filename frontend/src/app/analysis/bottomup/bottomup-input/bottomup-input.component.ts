import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { ConfigService } from 'src/app/_services/config.service';

@Component({
    selector: 'true-bottomup-input',
    templateUrl: './bottomup-input.component.html',
    styleUrls: ['./bottomup-input.component.scss'],
    standalone: false
})
export class BottomupInputComponent implements OnInit {
  @Input() pillars;
  @Input() nodes;
  @Input() selections;
  @Output() change = new EventEmitter();
  public thresholds = [];
  
  constructor(public readonly config: ConfigService) { }

  ngOnInit(): void {
    this.thresholds.push({
      "value": 0,
      "description": {
        "name": "Low"
      }});
    this.thresholds.push({
      "value": 1,
      "description": {
        "name": "Medium"
      }});
    this.thresholds.push({
      "value": 2,
      "description": {
        "name": "High"
      }});

    for (let pillar of this.pillars) {
      pillar.classname = pillar.name.toLowerCase().replaceAll(' ', '-');

      if (this.config.pillar_models) {
        for (let node of pillar.nodes) {
          node.classname = node.name.toLowerCase();
          node.expanded = true;
        }
      }
    }

    if (!this.config.pillar_models) {
      for (let node of this.nodes) {
        node.classname = node.name.toLowerCase();
        node.expanded = true;
      }
    }
  }

  pillarNode(pillar, node) {
    return pillar.nodes.find(n => n.name == node.name);
  }

  expand(node) {
    if (node.expanded) {
      node.expanded = false;
    } else {
      node.expanded = true;
    }
  }

  changed(pillarQ, nodeQ) {
    if (pillarQ != null && nodeQ != null) {
      // clear all indicator changes
      for (let pillarKey in this.selections) {
        let pillar = this.selections[pillarKey];
        for (let nodeKey in pillar.nodes) {
          let pillarNode = pillar.nodes[nodeKey];
          if (pillarKey.replace(/_/g, '-') == pillarQ.classname && nodeKey.replace(/_/g, '-') == nodeQ.classname) {
            for (let indicatorKey in pillarNode.indicators) {
              pillarNode.indicators[indicatorKey] = null;
            }
          }
        }
      }
    }
    this.change.emit();
  }

  nodeChanged(pillarQ, nodeQ, indicator) {
    for (let pillarKey in this.selections) {
      let pillar = this.selections[pillarKey];
      for (let nodeKey in pillar.nodes) {
        let pillarNode = pillar.nodes[nodeKey];
        if (pillarKey.replace(/_/g, '-') == pillarQ.classname && nodeKey.replace(/_/g, '-') == nodeQ.classname) {
          if (pillarNode.value != null) {
            return true;
          }
        }
      }
    }
    return false;
  }
}
