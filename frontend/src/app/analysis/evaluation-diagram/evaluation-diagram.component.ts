import { Component, Input, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'true-evaluation-diagram',
    templateUrl: './evaluation-diagram.component.html',
    styleUrls: ['./evaluation-diagram.component.scss'],
    standalone: false
})
export class EvaluationDiagramComponent implements OnInit {
  private svg;
  private margin = 10;
  private width = 840 - (this.margin * 2);
  private height = 300 - (this.margin * 2);

  private _values;
  get values() {
    return this._values;
  }
  @Input() set values(val) {
    this._values = val;
    this.redraw();
  };
  @Input() options;

  public id;
  public data;

  private baseHref = environment.backendServer;

  constructor() {
    this.id = "figure-" + Math.random().toString(36).substr(2, 5);
  }

  ngOnInit(): void {
    this.data = [];

    if (this.values) {
      for (let value of this.values) {
        this.data.push({
          name: value.name,
          className: value.name.toLowerCase().replaceAll(' ', '-'),
          value: value.value
        });
      }
    }
  }

  ngAfterViewInit() {
    this.createSvg();
    this.draw();
  }

  draw() {
    if (this.values) {
      this.drawPillars();
    } else {
      this.drawBlankPillars();
    }
    
    let drawLegend = true;

    if (this.options) {
      if (this.options.hasOwnProperty('legend')) {
        drawLegend = this.options.legend;
      }
    }

    if (drawLegend) {
      this.drawLegend();
    }
  }
  redraw() {
    if (this.svg) {
      d3.selectAll("#" + this.id + " svg g > *").remove();
      this.draw();
    }
  }

  private createSvg(): void {
    this.svg = d3.select("#" + this.id)
    .append("svg")
    .attr("width", this.width + (this.margin * 2))
    .attr("height", this.height + (this.margin * 2))
    .append("g")
    .attr("transform", "translate(" + this.margin + "," + this.margin + ")");
  }

  private icon(className) {
    return this.baseHref + "assets/icons/pillars/" + className + "Simple.svg";
  }

  private x(className) {
    let idx = this.values.findIndex(v => v.name.toLowerCase().replaceAll(' ', '-') == className);
    return 120 + idx*270;
  }

  private y(className) {
    return 150;
  }

  private titleX(className) {
    let idx = this.values.findIndex(v => v.name.toLowerCase().replaceAll(' ', '-') == className);
    return 120 + idx*270;
  }

  private titleY(className) {
    return 150;
  }

  private iconX(className) {
    let idx = this.values.findIndex(v => v.name.toLowerCase().replaceAll(' ', '-') == className);
    return 110 + idx*270;
  }

  private iconY(className) {
    return 110;
  }

  private fill(value) {
    if (Array.isArray(value)) {
      if (value.length == 1) {
        return this.fill(value[0]);
      } else {
        return 'url(#pattern-' + value.join("-") + ")";
      }
    } else {
      switch(value) {
        case 0:
          return '#F06266';
          break;
        case 1:
          return '#FFA74F';
          break;
        case 2:
          return '#94C760';
          break;
        case -1:
          return '#808080';
          break;
      }
    }
  }

  private drawHatching(): void {
    let data = [{id: "0-1", colors: ["#FFA74F", "#F06266"]}, {id: "1-2", colors: ["#94C760", "#FFA74F"]}, {id: "0-1-2", colors: ["#94C760", "#FFA74F", "#F06266"]}];
    var sel = this.svg.selectAll("hatchs")
       .data(data)
       .enter()
       .append("pattern")
       .attr("width", d => d.colors.length*8)
       .attr("height", d => d.colors.length*8)
       .attr("patternTransform", "rotate(45 0 0)")
       .attr("patternUnits", "userSpaceOnUse")
       .attr("id", d => "pattern-" + d.id);

     sel.append("rect")
       .attr("x", 0)
       .attr("y", 0)
       .attr("width", d => d.colors.length*8)
       .attr("height", d => d.colors.length*8)
       .style("fill", d => d.colors[0])

     sel.append("line")
       .attr("x1", 4)
       .attr("y1", 0)
       .attr("x2", 4)
       .attr("y2", d => d.colors.length*8)
       .style("stroke-width", 8)
       .style("stroke", d => d.colors[1]);

     sel.append("line")
       .attr("x1", 12)
       .attr("y1", 0)
       .attr("x2", 12)
       .attr("y2", d => d.colors.length*8)
       .style("stroke-width", 8)
       .style("stroke", d => (d.colors.length>2 ? d.colors[2] : ""));
  }

  private drawPillars() {
    var circle = this.svg.selectAll("circle")
      .data(this.data)
      .enter()
      .append("circle")
      .attr("cx", d => this.x(d.className))
      .attr("cy", d => this.y(d.className))
      .attr("r", 130)
      .style("stroke", "#000")
      .style("fill", d => this.fill(d.value));

    this.svg.selectAll("circleText")
      .data(this.data)
      .enter()
      .append("text")
      .attr("x", d => this.titleX(d.className))
      .attr("y", d => this.titleY(d.className))
      .text(d => d.name)
      .style("text-anchor", "middle")
      .style("fill", "#ffffff")
      .style("font-family", "Montserrat")
      .style("font-weight", 600)
      .style("font-size", "14px")
      .style("letter-spacing", "2.1px");

    this.svg.selectAll("primIcons")
      .data(this.data)
      .enter()
      .append("image")
      .attr("href", d => this.icon(d.className))
      .attr("x", d => this.iconX(d.className))
      .attr("y", d => this.iconY(d.className))
      .attr("width", 15)
      .attr("height", 18);

    this.drawHatching();
  }

  private drawBlankPillars() {
    // todo
  }

  private drawLegend(): void {
    let data = [
      { className: "low", value: 0, name: "NEGATIVE", xpos: 132 },
      { className: "medium", value: 1, name: "NEUTRAL", xpos: 255 },
      { className: "high", value: 2, name: "POSITIVE", xpos: 367 },
      { className: "undefined", value: -1, name: "MISSING DATA", xpos: 479 }
    ];
    this.svg.selectAll("legend")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", d => d.xpos)
      .attr("cy", d => 358)
      .attr("r", 4.5)
      .style("fill", d=>this.fill(d.value));

    this.svg.selectAll("legendText")
      .data(data)
      .enter()
      .append("text")
      .attr("x", d=>d.xpos + 15)
      .attr("y", 363)
      .text(d=>d.name)
      .style("fill", d=>this.fill(d.value))
      .style("font-family", "Montserrat")
      .style("font-weight", 600)
      .style("font-size", "14px")
      .style("letter-spacing", "2.1px");
  }
}
