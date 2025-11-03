import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { map } from 'rxjs/operators';
import { ApiService } from '../../_services/api.service';
import { NavigationService } from '../../_services/navigation.service';
import { ConfigService } from '../../_services/config.service';

@Component({
    selector: 'true-pillar',
    templateUrl: './pillar.component.html',
    styleUrls: ['./pillar.component.scss'],
    standalone: false
})
export class PillarComponent implements OnInit {
  public nodes;
  public pillarNodes;
  public selectedNode;
  public selectedIndicator;
  public selectedNodeDescriptor;
  private _pillar;
  private _indicator;
  
  @Input() assessmentId;
  get pillar() {
    return this._pillar;
  }
  @Input() set pillar(value: any) {
    this._pillar = value;
    this.fetchPillar();
  }
  @Input() set indicator(value: any)  {
    this._indicator = value;
    if (this.nodes) {
      this.selectedNode = this.nodes.find((n) => n.id==this._indicator.nodeId);
      this.selectedIndicator = this.selectedNode.indicators.find((i)=>i.id==this._indicator.id);
      this.navigation.navigate('/input/' + this._pillar.classname + '/' + this.selectedIndicator.id);
    }
  }
  @Output() complete: EventEmitter<any> = new EventEmitter();
  @Output() update: EventEmitter<any> = new EventEmitter();

  constructor(private api: ApiService, private location: Location, private route: ActivatedRoute, private navigation: NavigationService, public readonly config: ConfigService) { }

  ngOnInit(): void {
    let self = this;

    this.api.getNodes().pipe(
      map((nodes: any[]) => {
        for (let node of nodes) {
          node.indicators = [];
        }
        return nodes;
      })
    ).subscribe((nodes) => {
      self.nodes = nodes;
      self.pillarNodes = nodes.filter(n => n.pillarId == this.pillar.id);
      
      if (self.pillar) {
        self.fetchPillar();
      }
    });
  }

  fetchPillar() {
    let pillarId = this.route.snapshot.paramMap.get('pillar');
    
    let indicatorId = this.route.snapshot.paramMap.get('indicatorId');

    let self = this;

    if (this.nodes) {
      this.pillarNodes = this.nodes.filter(n => n.pillarId == this.pillar.id);

      this.api.getUserPillarIndicators(this.assessmentId, this.pillar.id).subscribe((indicators) => {
        
        // clear existing indicators
        for (let node of self.nodes) {
          node.indicators = [];
        }
        for (let indicator of indicators) {
          let indNode = self.nodes.find((n) => n.id == indicator.nodeId);
          indNode.indicators.push(indicator);
        }
        if (self._indicator) {
          self.selectedNode = self.nodes.find((n) => n.id==self._indicator.nodeId);
          self.selectedNodeDescriptor = self.getPillarShortTxt(self.pillar.description.name) + self.selectedNode.idx;
          let indicator = self.selectedNode.indicators.find((i)=>i.id==self._indicator.id);
          if (indicator) {
            self.selectedIndicator = indicator;
          } else {
            self.selectedIndicator = self.selectedNode.indicators[0];
          }
          console.log("go");
          self.navigation.navigate('/input/' + self._pillar.classname + '/' + self.selectedIndicator.id);
        } else {
          if (pillarId == self.pillar.classname && indicatorId != null) {
            self.selectedIndicator = indicators.find((i) => i.id == indicatorId);
            self.selectedNode = self.nodes.find((n) => n.id==self.selectedIndicator.nodeId);
            self.selectedNodeDescriptor = self.getPillarShortTxt(self.pillar.description.name) + self.selectedNode.idx;
          } else {
            if (this.config.pillar_models) {
              self.selectedNode = self.pillarNodes[0];
            } else {
              self.selectedNode = self.nodes[0];
            }
            self.selectedNodeDescriptor = self.getPillarShortTxt(self.pillar.description.name) + self.selectedNode.idx;
            self.selectedIndicator = self.selectedNode.indicators[0];
          }
          let url = '/input/' + self._pillar.classname + '/' + self.selectedIndicator.id;
          if (self.location.path() != url) {
            self.navigation.navigate(url);
          }
        }
      }, (err) => {
        console.log(err);
      });

      this.route.params.subscribe((params) => {
        console.log(params);
        if (!(self.selectedIndicator && self.selectedIndicator.id == params["indicatorId"])) {
            for (let node of self.nodes) {
              let candidate = node.indicators.find(i => i.id == params["indicatorId"]);
              if (candidate) {
                self.selectedNode = node;
                self.selectedNodeDescriptor = self.getPillarShortTxt(self.pillar.description.name) + self.selectedNode.idx;
                self.selectedIndicator = candidate;
              }
            }
        }
      });
    }
  }

  pillarClass(): string {
    if (this.pillar) {
      return this.pillar.classname;
    } else {
      return "";
    }
  }

  nodeClass(node): string[] {
    let classnames = [node.classname];
    if (this.selectedNode && this.selectedNode.classname == node.classname) {
      classnames.push("selected");
    }
    return classnames;
  }

  nodeEnabled(node):boolean {
    return this.selectedNode && this.selectedNode.classname == node.classname;
  }

  selectIndicator(node, indicator) {
    if (this.selectedNode != node) {
      this.selectedNode = node;
      this.selectedNodeDescriptor = this.getPillarShortTxt(this.pillar.description.name) + this.selectedNode.idx;
    }
    this.selectedIndicator = indicator;
    this.navigation.navigate('/input/' + this._pillar.classname + '/' + this.selectedIndicator.id);
  }

  selectNode(node) {
    this.selectedNode = node;
    this.selectedNodeDescriptor = this.getPillarShortTxt(this.pillar.description.name) + this.selectedNode.idx;
    if (this.selectedNode.indicators.length > 0) {
      this.selectedIndicator = this.selectedNode.indicators[0];
      this.navigation.navigate('/input/' + this._pillar.classname + '/' + this.selectedIndicator.id);
    } else {
      this.selectedIndicator = null;
      this.navigation.navigate('/input/' + this._pillar.classname);
    }
  }

  getPillarShortTxt(pillar) {
    if (pillar == "ENVIRONMENTAL") {
      return "En";
    } else {
      return pillar[0];
    }
  }

  recalcPct() {
    this._pillar.answerCount = 0;

    if (this.config.pillar_models) {
      for (let node of this.pillarNodes) {
        for (let indicator of node.indicators) {
          if (indicator.value != null) {
            this._pillar.answerCount++;
          }
        }
      }
    } else {
      for (let node of this.nodes) {
        for (let indicator of node.indicators) {
          if (indicator.value != null) {
            this._pillar.answerCount++;
          }
        }
      }
    }

    this._pillar.pct = this._pillar.answerCount *100 /this._pillar.indicatorCount;
    this.update.emit(this._pillar.pct);
  }

  prevIndicator() {
    let idx = this.selectedNode.indicators.findIndex((i) => i.id == this.selectedIndicator.id);
    if (idx == 0) {
      // prev node
      if (this.config.pillar_models) {
        idx = this.pillarNodes.findIndex((n) => n.id == this.selectedNode.id);
      } else {
        idx = this.nodes.findIndex((n) => n.id == this.selectedNode.id);
      }
      
      if (idx == 0) {
        // pillar input complete
        this.complete.emit(false);
      } else {
        if (this.config.pillar_models) {
          this.selectedNode = this.pillarNodes[idx - 1];
        } else {
          this.selectedNode = this.nodes[idx - 1];
        }
        this.selectedNodeDescriptor = this.getPillarShortTxt(this.pillar.description.name) + this.selectedNode.idx;
        this.selectedIndicator = this.selectedNode.indicators[this.selectedNode.indicators.length-1];
        this.navigation.navigate('/input/' + this._pillar.classname + '/' + this.selectedIndicator.id);
      }
    } else {
      this.selectedIndicator = this.selectedNode.indicators[idx - 1];
      this.navigation.navigate('/input/' + this._pillar.classname + '/' + this.selectedIndicator.id);
    }
    window.scrollTo(0, 0);    
  }

  nextIndicator() {
    let idx = this.selectedNode.indicators.findIndex((i) => i.id == this.selectedIndicator.id);
    if (idx == this.selectedNode.indicators.length - 1) {
      var numNodes;
      // next node
      if (this.config.pillar_models) {
        idx = this.pillarNodes.findIndex((n) => n.id == this.selectedNode.id);
        numNodes = this.pillarNodes.length;
      } else {
        idx = this.nodes.findIndex((n) => n.id == this.selectedNode.id);
        numNodes = this.nodes.length;
      }

      if (idx == numNodes - 1) {
        // pillar input complete
        this.complete.emit(true);
      } else {
        if (this.config.pillar_models) {
          this.selectedNode = this.pillarNodes[idx + 1];
        } else {
          this.selectedNode = this.nodes[idx + 1];
        }
        this.selectedNodeDescriptor = this.getPillarShortTxt(this.pillar.description.name) + this.selectedNode.idx;
        this.selectedIndicator = this.selectedNode.indicators[0];
        this.navigation.navigate('/input/' + this._pillar.classname + '/' + this.selectedIndicator.id);
      }
    } else {
      this.selectedIndicator = this.selectedNode.indicators[idx + 1];
      this.navigation.navigate('/input/' + this._pillar.classname + '/' + this.selectedIndicator.id);
    }
    window.scrollTo(0, 0);    
  }
}
