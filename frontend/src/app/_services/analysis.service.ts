import { Injectable } from '@angular/core';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class AnalysisService {

  constructor(private config: ConfigService) { }

  getEvaluationData(evaluation) {
    let sustainability = evaluation.find((o) => o.path == '/AgriFoodChain');
    let equitability = evaluation.find((o) => o.path == '/Equitability');
    let viability = evaluation.find((o) => o.path == '/Viability');
    let bearability = evaluation.find((o) => o.path == '/Bearability');

    let environmental = evaluation.find((o) => o.path.includes('/EnvironmentalPillar'));
    let economic = evaluation.find((o) => o.path.includes('/EconomicPillar'));
    let social = evaluation.find((o) => o.path.includes('/Social-PolicyPillar'));

    return {
      "economic": this.firstValue(economic),
      "social": this.firstValue(social),
      "environmental": this.firstValue(environmental),
      "sustainability": this.firstValue(sustainability),
      "equitability": this.firstValue(equitability),
      "viability": this.firstValue(viability),
      "bearability": this.firstValue(bearability)
    }
  }

  allValues(item) {
    return item.values.map((value) => this.stringToValue(value));
  }

  firstValue(item): number {
    if (item) {
      return this.stringToValue(item.values[0]);
    } else {
      return null;
    }
  }

  stringToValue(level: string, customLevels?: Array<string>): number {
    var levels;
    if (customLevels != undefined) {
      levels = customLevels;
    } else {
      levels = ['Low', 'Medium', 'High'];
    }

    let idx = levels.indexOf(level);
    if (idx >= 0) {
      return idx;
    } else {
      levels = ['Negative', 'Neutral', 'Positive']
      return levels.indexOf(level);
    }
  }

  valueToString(level: number): string {
    let levels = ['Low', 'Medium', 'High'];
    return levels[level];
  }

  getPillarData(completePillar, completeNodes, evaluation, pillarKey, pillarName) {

    var pillarValues;
    if (completePillar != null) {
      pillarValues = completePillar.Thresholds.map((t) => t.Threshold_descriptions[0].name);
    }
    if (!pillarValues || pillarValues.length == 0) {
      pillarValues = undefined;
    }
    let values = evaluation.find((o) => o.path.includes('/' + pillarKey)).values.map((value) => this.stringToValue(value, pillarValues)).sort();

    if (values.length > 0) {
      values = values[0];
    }
    
    let pillar = {
      "name": pillarName,
      "key": pillarKey,
      "value": values,
      "nodes": []
    };

    let segments = 3;
    if (this.config.pillar_models) {
      segments = 2;
    }
    let nodes = evaluation.filter((o) => o.path.includes('/' + pillarKey + '/') && (o.path.match(/\//g)).length == segments);
    
    for (let node of nodes) {
      let name = node.attribute.split('_')[0];

      let description = null;
      let completeNode = completeNodes.find(n=>n.name == name);
      if (completeNode) {
        description = completeNode.description;
      }
      let nodeValues = completeNode.Thresholds.map((t) => t.Threshold_descriptions[0].name);
      if (nodeValues.length == 0) {
        nodeValues = undefined;
      }
      let values = node.values.map((value) => this.stringToValue(value, nodeValues)).sort();
      pillar.nodes.push({
        "name": name,
        "description": description,
        "icon": 'icons/nodes/' + name.toLowerCase() + '-white.svg',
        "value": values
      });
    }

    return pillar;
  }

  getTopDownData(evaluationData) {
    let topDownData = [];
    topDownData.push([
      {"name": "sustainability", "value": evaluationData["sustainability"], "change": 0}
    ]);
  
    topDownData.push([
      {"name": "equitability", "value": evaluationData["equitability"], "change": 0},
      {"name": "viability", "value": evaluationData["viability"], "change": 0},
      {"name": "bearability", "value": evaluationData["bearability"], "change": 0}
    ]);

    topDownData.push([
      {"name": "environmental", "value": evaluationData["environmental"], "change": 0},
      {"name": "economic", "value": evaluationData["economic"], "change": 0},
      {"name": "social", "value": evaluationData["social"], "change": 0}
    ]);

    return topDownData;
  }
}
