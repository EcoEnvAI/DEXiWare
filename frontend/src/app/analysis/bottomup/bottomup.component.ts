import { Component, OnInit, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import { Router, NavigationStart } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { map } from 'rxjs/operators';
import { ApiService } from '../../_services/api.service';
import { AnalysisService } from '../../_services/analysis.service';
import { CanComponentDeactivate } from '../../_services/navigation-guard.service';
import { environment } from 'src/environments/environment';
import { ConfigService } from 'src/app/_services/config.service';
import { ScenarioNameComponent } from '../scenario-name/scenario-name.component';

@Component({
    selector: 'true-bottomup',
    templateUrl: './bottomup.component.html',
    styleUrls: ['./bottomup.component.scss'],
    standalone: false
})
export class BottomupComponent implements OnInit, OnDestroy, CanComponentDeactivate {
  private assessmentId;
  public assessmentName;
  public evaluationData;
  public selectionsChanged = false;
  public selections = {};
  public changedEvaluationData;
  public changedEvaluationDataPillars;
  public isLoading = false;
  public pillars;
  public nodes;
  public showNodes = true;
  public showChanges = false;
  public ready = false;

  public inputChanges = [];
  public resultChanges = [];

  private savedScenario = '';

  private baseHref = environment.backendServer;
  private navigationSubscription;
  lastTrigger: 'imperative' | 'popstate' | 'hashchange';

  constructor(private api: ApiService, private analysis: AnalysisService, private router: Router, public location: Location, public readonly config: ConfigService, private dialog: MatDialog) {
    this.navigationSubscription = this.router.events.subscribe((e: any) => {
      if (e instanceof NavigationStart) {
        console.log(e);
        this.lastTrigger = e.navigationTrigger;
      }
    });
  }

  ngOnInit(): void {
    this.isLoading = true;

    this.api.getAssessment().subscribe((assessment) => {
      this.assessmentId = assessment.id;
      this.assessmentName = assessment.name;

      if (this.config.pillar_models) {
        console.log(this.config.subset);
        if (this.config.subset == null) {
          this.router.navigate(['input']);
        } else {
          this.api.getPillars().subscribe(pillars => {
            this.api.getAssessmentEvaluation(this.assessmentId).subscribe((ret: any) => {
              this.pillars = [];

              let evaluationData = []

              for (let model of ret.data) {
                let pillar = pillars.find(p=>p.model == model.model_name);
                pillar.icon = this.baseHref + "assets/icons/pillars/" + pillar.classname + ".svg";
                let pillarData = this.analysis.getPillarData(pillar, pillar.Nodes, model.alternatives[0].evaluation, pillar.description.description.replaceAll(" ", "_"), pillar.description.name);
                this.pillars.push(Object.assign(pillar, pillarData));
                evaluationData.push(pillarData);

                this.selections[pillar.name.toLowerCase().replaceAll(' ','_')] = {"nodes": {}, "value": null};

                for (let node of pillar.nodes) {
                  node.classname = node.name.toLowerCase();
                  let Node = pillar.Nodes.find(n => n.classname == node.classname);
                  node.id = Node.id;
                  node.pillarId = Node.pillarId;
                  
                  this.selections[pillar.name.toLowerCase().replaceAll(' ','_')].nodes[node.classname] = {"indicators": {}, "value": null};
                }
              }

              this.evaluationData = evaluationData;
              let pillarKeys = this.pillars.map(p => p.key);
              
              this.api.getUserIndicators(this.assessmentId).subscribe((indicators) => {
                for (let indicator of indicators) {
                  let pillar = this.pillars.find(p => p.id == indicator.pillarId);
                  if (pillar) {
                    let node = pillar.nodes.find(n => n.id == indicator.nodeId);
                    node.classname = node.name.toLowerCase();
                    if (!node["indicators"]) {
                      node.indicators = [];
                    }
                    node.indicators.push(indicator);
                    this.selections[pillar.name.toLowerCase().replaceAll(' ','_')].nodes[node.classname].indicators[indicator.id] = null;
                  }
                }
                this.isLoading = false;
                this.ready = true;
              });
            });
          });
        }
      } else {
        this.api.getAssessmentEvaluation(this.assessmentId).subscribe((ret: any) => {
          this.evaluationData = this.analysis.getEvaluationData(ret.data.alternatives[0].evaluation);
          this.pillars = [];
          
          this.api.getNodes().pipe(
            map((nodes: any[]) => {
              for (let node of nodes) {
                node.indicators = [];
              }
              return nodes;
            })
          ).subscribe(nodes => {
            this.nodes = nodes;

            this.pillars.push(this.analysis.getPillarData(null, nodes, ret.data.alternatives[0].evaluation, 'EnvironmentalPillar', 'Environmental'));
            this.pillars.push(this.analysis.getPillarData(null, nodes, ret.data.alternatives[0].evaluation, 'EconomicPillar', 'Economic'));
            this.pillars.push(this.analysis.getPillarData(null, nodes, ret.data.alternatives[0].evaluation, 'Social-PolicyPillar', 'Social'));

            this.api.getPillars().subscribe((pillars) => {
              for (let pillar of this.pillars) {
                let found = pillars.find(p => p.model == pillar.key.replace("-", ""));
                pillar.id = found.id;
              }

              for (let pillar of this.pillars) {
                for (let node of pillar.nodes) {
                  let found = this.nodes.find(n => node.name == n.name);
                  node.id = found.id;
                  node.classname = found.classname;
                }
              }

              for (let pillar of this.pillars) {
                pillar.classname = pillar.name.toLowerCase().replaceAll(' ', '-');
                pillar.icon = this.baseHref + "assets/icons/pillars/" + pillar.classname + ".svg";
                this.selections[pillar.name.toLowerCase().replaceAll(' ','_')] = {"nodes": {}, "value": null};
              }
              
              for (let node of this.nodes) {
                node.classname = node.name.toLowerCase();
                for (let pillar of this.pillars) {
                  this.selections[pillar.name.toLowerCase().replaceAll(' ','_')].nodes[node.classname] = {"indicators": {}, "value": null};
                }
              }

              this.api.getUserIndicators(this.assessmentId).subscribe((indicators) => {
                for (let indicator of indicators) {
                  let pillar = this.pillars.find(p => p.id == indicator.pillarId);
                  let node = pillar.nodes.find(n => n.id == indicator.nodeId);
                  node.classname = node.name.toLowerCase();

                  if (!node["indicators"]) {
                    node.indicators = [];
                  }
                  node.indicators.push(indicator);
                  this.selections[pillar.name.toLowerCase().replaceAll(' ','_')].nodes[node.classname].indicators[indicator.id] = null;
                }
                this.isLoading = false;
                this.ready = true;
              });
            });
          });
        });
      }
    });
  }

  ngOnDestroy() {
    if (this.navigationSubscription) {
      this.navigationSubscription.unsubscribe();
    }
  }
/*
  changed() {
    this.selectionsChanged = false;
    this.isLoading = true;
    this.changedEvaluationData = null;

    this.inputChanges = [];
    
    for (let pillar in this.selections) {
      if (this.selections[pillar].value != null) {
        let orig = this.pillars.find(p => p.name.toLowerCase() == pillar.replace(/_/g, " "));
        this.inputChanges.push(
          {
            "path": pillar.replace(/_/g, " "),
            "orig": this.analysis.valueToString(orig.value),
            "new": this.analysis.valueToString(this.selections[pillar].value)
          });
      }
      for (let node in this.selections[pillar].nodes) {
        if (this.selections[pillar].nodes[node].value != null) {
          let orig = this.pillars.find(p => p.name.toLowerCase() == pillar.replace(/_/g, " "));
          let origNode = orig.nodes.find(n => n.name.toLowerCase() == node);
          this.inputChanges.push(
            {
              "path": pillar.replace(/_/g, " ") + " - " + node,
              "orig": this.analysis.valueToString(origNode.value),
              "new": this.analysis.valueToString(this.selections[pillar].nodes[node].value)
            });
        }
        for (let indicator in this.selections[pillar].nodes[node].indicators) {
          if (this.selections[pillar].nodes[node].indicators[indicator] != null) {
            let orig = this.pillars.find(p => p.classname == pillar.replace(/_/g, "-"));
            let origNode = orig.nodes.find(n => n.name.toLowerCase() == node);
            let origIndicator = origNode.indicators.find(i => i.description.name == indicator);

            this.inputChanges.push(
              {
                "path": pillar.replace(/_/g, " ") + " - " + node + " - " + indicator,
                "orig": this.analysis.valueToString(origIndicator.value - 1),
                "new": this.analysis.valueToString(this.selections[pillar].nodes[node].indicators[indicator] - 1)
              });
          }
        }
      }
    }

    this.api.getAssessmentBottomUpEvaluation(this.assessmentId, this.selections).subscribe((ret: any) => {
      this.selectionsChanged = true;
      if (this.config.pillar_models) {
        this.api.getPillars().subscribe(pillars => {
          this.changedEvaluationData = []
          this.changedEvaluationDataPillars = [];
          
          for (let model of ret.data) {
            let pillar = pillars.find(p=>p.model == model.model_name);
            let pillarValues = pillar.Thresholds.map(t => t.Threshold_descriptions[0].name);
            let key = pillar.description.description.replaceAll(' ', '_');
            let main = model.alternatives[0].evaluation.find(o => o.path == "/" + key);
            
            let values = this.allValues(main, pillarValues);
            if (values.length > 0) {
              values = values[0];
            }
            let item = {"name": pillar.description.name, "value": values, "classname": pillar.classname};
            this.changedEvaluationData.push(item);
            pillar.icon = this.baseHref + "assets/icons/pillars/" + pillar.classname + ".svg";
            let changedPillar = Object.assign({}, pillar);
            changedPillar.nodes = this.pillarNodes(pillar.Nodes, model.alternatives[0].evaluation, key);
            this.changedEvaluationDataPillars.push(changedPillar);
          }
          this.resultChanges = [];
        
          // pillars & composites
          for (let item of this.changedEvaluationData) {
            let origItem = this.evaluationData.find(i=>i.name==item.name);
            if (item.value.toString() != origItem.value.toString()) {
              this.resultChanges.push({
                "path": item.name,
                "orig": this.analysis.valueToString(origItem.value),
                "new": this.analysis.valueToString(item.value)
              });
            }
          }

          // nodes
          for (let pillar of this.changedEvaluationDataPillars) {
            let orig = this.pillars.find(p => p.description.name == pillar.description.name);
            for (let node of pillar.nodes) {
              let origNode = orig.nodes.find(n => n.name == node.name);
              if (origNode.value != node.value) {
                this.resultChanges.push({
                  "path": pillar.description.name + " - " + node.name,
                  "orig": this.analysis.valueToString(origNode.value),
                  "new": this.analysis.valueToString(node.value)
                });
              }
            }
          }
          
          this.isLoading = false;
        });
      } else {
        let sustainability = ret.data.alternatives[0].evaluation.find((o) => o.path == '/AgriFoodChain');
        let equitability = ret.data.alternatives[0].evaluation.find((o) => o.path == '/Equitability');
        let viability = ret.data.alternatives[0].evaluation.find((o) => o.path == '/Viability');
        let bearability = ret.data.alternatives[0].evaluation.find((o) => o.path == '/Bearability');

        let environmental = ret.data.alternatives[0].evaluation.find((o) => o.path.includes('/EnvironmentalPillar'));
        let economic = ret.data.alternatives[0].evaluation.find((o) => o.path.includes('/EconomicPillar'));
        let social = ret.data.alternatives[0].evaluation.find((o) => o.path.includes('/Social-PolicyPillar'));

        this.changedEvaluationData = {
          "economic": this.allValues(economic),
          "social": this.allValues(social),
          "environmental": this.allValues(environmental),
          "sustainability": this.allValues(sustainability),
          "equitability": this.allValues(equitability),
          "viability": this.allValues(viability),
          "bearability": this.allValues(bearability)
        }

        this.changedEvaluationDataPillars = [];
        for (let pillar of this.pillars) {
          pillar.icon = this.baseHref + "assets/icons/pillars/" + pillar.classname + ".svg";
          
          let changedPillar = Object.assign({}, pillar);
          let key = pillar.key;
          if (key == 'Social-PolicyPillar') {
            key = 'SocialPolicyPillar';
          }
          changedPillar.nodes = this.pillarNodes(this.nodes, ret.data.alternatives[0].evaluation, key);
          this.changedEvaluationDataPillars.push(changedPillar);
        }

        this.resultChanges = [];
        
        // pillars & composites
        for (let item in this.changedEvaluationData) {
          if (this.changedEvaluationData[item][0] != this.evaluationData[item]) {
            this.resultChanges.push({
              "path": item,
              "orig": this.analysis.valueToString(this.evaluationData[item]),
              "new": this.analysis.valueToString(this.changedEvaluationData[item][0])
            });
          }
        }

        // nodes
        for (let pillar of this.changedEvaluationDataPillars) {
          let orig = this.pillars.find(p => p.key = pillar.key);
          for (let node of pillar.nodes) {
            let origNode = orig.nodes.find(n => n.name == node.name);
            if (origNode.value != node.value) {
              this.resultChanges.push({
                "path": pillar.name + " - " + node.name,
                "orig": this.analysis.valueToString(origNode.value),
                "new": this.analysis.valueToString(node.value)
              });
            }
          }
        }
        
        this.isLoading = false;
      }
    });
  }
*/

  changed() {
    this.selectionsChanged = true;
  }

  clear() {
    if (this.selectionsChanged) {
      this.selectionsChanged = false;
      this.inputChanges = [];
      this.resultChanges = [];
      this.changedEvaluationData = null;
      this.changedEvaluationDataPillars = null;

      // reset pillar & node & indicator values
      for (let key of Object.keys(this.selections)) {
        let pillar = this.selections[key];
        if (pillar.nodes) {
          pillar.value = null;
          for (let nKey of Object.keys(pillar.nodes)) {
            let node = pillar.nodes[nKey];
            node.value = null;

            for (let iKey of Object.keys(node.indicators)) {
              node.indicators[iKey] = null;
            }
          }
        }
      }
    }
  }

  update() {
    if (this.selectionsChanged) {
      this.selectionsChanged = false;
      this.isLoading = true;
      this.changedEvaluationData = null;

      this.inputChanges = [];
      
      for (let pillar in this.selections) {
        if (this.selections[pillar].value != null) {
          let orig = this.pillars.find(p => p.name.toLowerCase() == pillar.replace(/_/g, " "));
          this.inputChanges.push(
            {
              "path": pillar.replace(/_/g, " "),
              "orig": this.analysis.valueToString(orig.value),
              "new": this.analysis.valueToString(this.selections[pillar].value)
            });
        }
        for (let node in this.selections[pillar].nodes) {
          if (this.selections[pillar].nodes[node].value != null) {
            let orig = this.pillars.find(p => p.name.toLowerCase() == pillar.replace(/_/g, " "));
            let origNode = orig.nodes.find(n => n.name.toLowerCase() == node);
            this.inputChanges.push(
              {
                "path": pillar.replace(/_/g, " ") + " - " + node,
                "orig": this.analysis.valueToString(origNode.value),
                "new": this.analysis.valueToString(this.selections[pillar].nodes[node].value)
              });
          }
          for (let indicator in this.selections[pillar].nodes[node].indicators) {
            if (this.selections[pillar].nodes[node].indicators[indicator] != null) {
              let orig = this.pillars.find(p => p.classname == pillar.replace(/_/g, "-"));
              let origNode = orig.nodes.find(n => n.name.toLowerCase() == node);
              let origIndicator = origNode.indicators.find(i => i.id == indicator);

              this.inputChanges.push(
                {
                  "path": pillar.replace(/_/g, " ") + " - " + node + " - " + origIndicator.description.name,
                  "orig": this.analysis.valueToString(origIndicator.value - 1),
                  "new": this.analysis.valueToString(this.selections[pillar].nodes[node].indicators[indicator] - 1)
                });
            }
          }
        }
      }

      this.api.getAssessmentBottomUpEvaluation(this.assessmentId, this.selections).subscribe((ret: any) => {
        this.selectionsChanged = true;
        if (this.config.pillar_models) {
          this.api.getPillars().subscribe(pillars => {
            this.changedEvaluationData = []
            this.changedEvaluationDataPillars = [];
            
            for (let model of ret.data) {
              let pillar = pillars.find(p=>p.model == model.model_name);
              let pillarValues = pillar.Thresholds.map(t => t.Threshold_descriptions[0].name);
              let key = pillar.description.description.replaceAll(' ', '_');
              let main = model.alternatives[0].evaluation.find(o => o.path == "/" + key);

              let values = this.allValues(main, pillarValues);
              if (values.length > 0) {
                values = values[0];
              }
              let item = {"name": pillar.description.name, "value": values, "classname": pillar.classname};
              this.changedEvaluationData.push(item);
              pillar.icon = this.baseHref + "assets/icons/pillars/" + pillar.classname + ".svg";
              let changedPillar = Object.assign({}, pillar);
              changedPillar.nodes = this.pillarNodes(pillar.Nodes, model.alternatives[0].evaluation, key);
              this.changedEvaluationDataPillars.push(changedPillar);
            }
            this.resultChanges = [];
          
            // pillars & composites
            for (let item of this.changedEvaluationData) {
              let origItem = this.evaluationData.find(i=>i.name==item.name);
              
              if (item.value.toString() != origItem.value.toString()) {
                this.resultChanges.push({
                  "path": item.name,
                  "orig": this.analysis.valueToString(origItem.value),
                  "new": this.analysis.valueToString(item.value)
                });
              }
            }

            // nodes
            for (let pillar of this.changedEvaluationDataPillars) {
              let orig = this.pillars.find(p => p.description.name == pillar.description.name);
              for (let node of pillar.nodes) {
                let origNode = orig.nodes.find(n => n.name == node.name);
                if (origNode.value != node.value) {
                  this.resultChanges.push({
                    "path": pillar.description.name + " - " + node.name,
                    "orig": this.analysis.valueToString(origNode.value),
                    "new": this.analysis.valueToString(node.value)
                  });
                }
              }
            }
            
            this.isLoading = false;
          });
        } else {
          let sustainability = ret.data.alternatives[0].evaluation.find((o) => o.path == '/AgriFoodChain');
          let equitability = ret.data.alternatives[0].evaluation.find((o) => o.path == '/Equitability');
          let viability = ret.data.alternatives[0].evaluation.find((o) => o.path == '/Viability');
          let bearability = ret.data.alternatives[0].evaluation.find((o) => o.path == '/Bearability');

          let environmental = ret.data.alternatives[0].evaluation.find((o) => o.path.includes('/EnvironmentalPillar'));
          let economic = ret.data.alternatives[0].evaluation.find((o) => o.path.includes('/EconomicPillar'));
          let social = ret.data.alternatives[0].evaluation.find((o) => o.path.includes('/Social-PolicyPillar'));

          this.changedEvaluationData = {
            "economic": this.firstValue(economic),
            "social": this.firstValue(social),
            "environmental": this.firstValue(environmental),
            "sustainability": this.firstValue(sustainability),
            "equitability": this.firstValue(equitability),
            "viability": this.firstValue(viability),
            "bearability": this.firstValue(bearability)
          }

          this.changedEvaluationDataPillars = [];
          for (let pillar of this.pillars) {
            pillar.icon = this.baseHref + "assets/icons/pillars/" + pillar.classname + ".svg";
            
            let changedPillar = Object.assign({}, pillar);
            let key = pillar.key;
            if (key == 'Social-PolicyPillar') {
              key = 'SocialPolicyPillar';
            }
            changedPillar.nodes = this.pillarNodes(this.nodes, ret.data.alternatives[0].evaluation, key);
            this.changedEvaluationDataPillars.push(changedPillar);
          }

          this.resultChanges = [];
          
          // pillars & composites
          for (let item in this.changedEvaluationData) {
            if (this.changedEvaluationData[item][0] != this.evaluationData[item]) {
              this.resultChanges.push({
                "path": item,
                "orig": this.analysis.valueToString(this.evaluationData[item]),
                "new": this.analysis.valueToString(this.changedEvaluationData[item][0])
              });
            }
          }

          // nodes
          for (let pillar of this.changedEvaluationDataPillars) {
            let orig = this.pillars.find(p => p.key == pillar.key);
            for (let node of pillar.nodes) {
              let origNode = orig.nodes.find(n => n.name == node.name);
              if (origNode.value != node.value) {
                this.resultChanges.push({
                  "path": pillar.name + " - " + node.name,
                  "orig": this.analysis.valueToString(origNode.value),
                  "new": this.analysis.valueToString(node.value)
                });
              }
            }
          }
          
          this.isLoading = false;
        }
      });
    }
  }

  allValues(item, thresholds?) {
    if (item) {
      let values = [];
      for (let value of item.values) {
        values.push(this.analysis.stringToValue(value, thresholds));
      }
      return values.sort();
    } else {
      return null;
    }
  }

  firstValue(item): number {
    if (item) {
      return this.analysis.stringToValue(item.values[0]);
    } else {
      return null;
    }
  }

  pillarNodes(completeNodes, evaluation, key) {
    
    let ret = [];

    if (this.config.pillar_models) {
      let nodes = evaluation.filter((o) => o.path.startsWith('/' + key) && (o.path.match(/\//g)).length == 2);
      for (let node of nodes) {
        let parts = node.path.split('/');
        let name = parts[2];

        let description = null;
        let completeNode = completeNodes.find(n => n.name == name);
        if (completeNode) {
          description = completeNode.description;
        }
        let nodeValues = completeNode.Thresholds.map((t) => t.Threshold_descriptions[0].name);
        if (nodeValues.length == 0) {
          nodeValues = undefined;
        }
        ret.push({
          name: name,
          description: description,
          icon: 'icons/nodes/' + name.toLowerCase() + '-white.svg',
          value: this.allValues(node, nodeValues),
        });
      }
    } else {
      let nodes = evaluation.filter((o) => o.path.endsWith('_' + key) && (o.path.match(/\//g)).length == 2);
      for (let node of nodes) {
        let parts = node.path.split('/');
        let name = parts[1];
        if (name == "Consumption") {
          name = "Consumers";
        }

        let description = null;
        let completeNode = completeNodes.find(n => n.name == name);
        if (completeNode) {
          description = completeNode.description;
        }
        let nodeValues = completeNode.Thresholds.map((t) => t.Threshold_descriptions[0].name);
        if (nodeValues.length == 0) {
          nodeValues = undefined;
        }
        ret.push({
          name: name,
          description: description,
          icon: 'icons/nodes/' + name.toLowerCase() + '-white.svg',
          value: this.allValues(node, nodeValues),
        });
      }    
    }
    return ret;
  }

  canDeactivate() {
    if (!this.selectionsChanged) {
      return true;
    } else {
      if (this.savedScenario == this.getCurrentScenario()) {
        return true;
      } else {
        return confirm("Changes detected. Are you sure you want to leave this page?");
      }
    }
  }

  revealNodes() {
    if (this.selectionsChanged) {
      this.showNodes = !this.showNodes;
      this.showChanges = false;
    }
  }

  listChanges() {
    if (this.selectionsChanged) {
      this.showChanges = !this.showChanges;
      this.showNodes = false;
    }
  }

  clearScenario() {
    for (let pillar of this.pillars) {
      pillar.classname = pillar.name.toLowerCase().replaceAll(' ', '-');
      this.selections[pillar.name.toLowerCase().replaceAll(' ','_')] = {"nodes": {}, "value": null};
    }
  
    for (let node of this.nodes) {
      node.classname = node.name.toLowerCase();
      for (let pillar of this.pillars) {
        this.selections[pillar.name.toLowerCase().replaceAll(' ','_')].nodes[node.classname] = {"indicators": {}, "value": null};
        for (let indicator of node.indicators) {
          this.selections[pillar.name.toLowerCase().replaceAll(' ','_')].nodes[node.classname].indicators[indicator.name] = null;
        }
      }
    }

    this.showChanges = false;
    this.showNodes = false;
    this.selectionsChanged = false;
  }

  saveScenario() {
    if (this.changedEvaluationData) {

      let dialogRef = this.dialog.open(ScenarioNameComponent, {
        height: '400px',
        width: '600px'
      });
      dialogRef.afterClosed().subscribe(name => {
        window.scrollTo(0, 0);

        let data = {
          "type": "bottomup",
          "content": {
            "input_changes": this.inputChanges, 
            "required_changes": this.resultChanges,
            "original_data": this.evaluationData,
            "changed_data": this.changedEvaluationData,
            "name": name,
            "timestamp": new Date().toISOString(),
            "model": this.config.subset
          }
        };

        this.isLoading = true;
        let self = this;

        this.api.createScenario(this.assessmentId, data).subscribe((ret) => {
          self.isLoading = false;
        });

        this.savedScenario = this.getCurrentScenario();
      });
    }
  }

  getCurrentScenario() {
    return this.inputChanges.map(c=>c.path + "=" + c.new).join(';');
  }
}
