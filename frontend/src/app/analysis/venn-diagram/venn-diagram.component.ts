import { Component, Input, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'true-venn-diagram',
    templateUrl: './venn-diagram.component.html',
    styleUrls: ['./venn-diagram.component.scss'],
    standalone: false
})
export class VennDiagramComponent implements OnInit {
  private svg;
  private margin = 10;
  private width = 440 - (this.margin * 2);
  private height = 500 - (this.margin * 2);

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
    this.data = {
      primary: [
        {
          name: "ECONOMIC",
          className: "econ",
          value: (this.values) ? this.values.economic : null
        },
        {
          name: "SOCIAL",
          className: "soc",
          value: (this.values) ? this.values.social : null
        },
        {
          name: "ENVIRONM.",
          className: "env",
          value: (this.values) ? this.values.environmental : null
        }
      ],
      secondary: [
        {
          name: "EQUITA-",
          name2: "BILITY",
          className: "equi",
          value: (this.values) ? this.values.equitability : null
        },
        {
          name: "SUSTAINABILITY",
          className: "sust",
          value: (this.values) ? this.values.sustainability : null
        },
        {
          name: "VIABILITY",
          className: "via",
          value: (this.values) ? this.values.viability : null
        },
        {
          name: "BEARABILITY",
          className: "bear",
          value: (this.values) ? this.values.bearability : null
        }
      ]
    };
  }

  ngAfterViewInit() {
    this.createSvg();
    this.draw();
  }

  draw() {
    if (this.values) {
      this.drawVenn();
    } else {
      this.drawBlankVenn();
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
      console.log(d3.selectAll("#" + this.id + " svg g > *"));
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
    switch(className) {
      case 'econ':
        return this.baseHref + "assets/icons/pillars/economicSimple.svg";
        break;
      case 'soc':
        return this.baseHref + "assets/icons/pillars/socialSimple.svg";
        break;
      case 'env':
        return this.baseHref + "assets/icons/pillars/environmentalSimple.svg";
        break;
    }
  }

  private x(className) {
    switch(className) {
      case 'econ':
      case 'equi':
        return 210;
        break;
      case 'soc':
      case 'sust':
      case 'bear':
        return 150;
        break;
      case 'env':
      case 'via':
        return 270;
        break;
    }
  }

  private y(className) {
    switch(className) {
      case 'econ':
      case 'equi':
        return 150;
        break;
      case 'soc':
      case 'sust':
      case 'bear':
        return 275;
        break;
      case 'env':
      case 'via':
        return 275;
        break;
    }
  }

  private titleX(className) {
    switch(className) {
      case 'econ':
        return 165;
        break;
      case 'equi':
        return 80;
        break;
      case 'soc':
        return 40;
        break;
      case 'sust':
        return 138;
        break;
      case 'bear':
        return 150;
        break;
      case 'env':
        return 300;
        break;
      case 'via':
        return 260;
        break;
    }
  }

  private titleY(className) {
    switch(className) {
      case 'econ':
        return 80;
        break;
      case 'equi':
        return 170;
        break;
      case 'soc':
        return 320;
        break;
      case 'sust':
        return 235;
        break;
      case 'bear':
        return 350;
        break;
      case 'env':
        return 320;
        break;
      case 'via':
        return 170;
        break;
    }
  }

  private iconX(className) {
    switch(className) {
      case 'econ':
        return 202;
        break;
      case 'soc':
        return 65;
        break;
      case 'env':
        return 345;
        break;
    }
  }

  private iconY(className) {
    switch(className) {
      case 'econ':
        return 42;
        break;
      case 'soc':
        return 280;
        break;
      case 'env':
        return 280;
        break;
    }
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

  private clip(className) {
    switch(className) {
      case "sust":
        return 'url("#clip-env")';
        break;
      case "bear":
        return 'url("#clip-env")';
        break;
      case 'equi':
        return 'url("#clip-soc")';
        break;
      case 'via':
        return 'url("#clip-econ")';
        break;
    }
  }

  private mask(className) {
    switch(className) {
      case "sust":
        return '';
        break;
      case "bear":
        return 'url("#mask-econ")';
        break;
      case "equi":
        return 'url("#mask-env")';
        break;
      case 'via':
        return 'url("#mask-soc")';
        break;
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

  private drawMasks(): void {
    var sel = this.svg.selectAll("masks")
      .data(this.data.primary)
      .enter()
      .append("mask")
      .attr("id", d => "mask-" + d.className);

    sel.append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", 500)
      .attr("height", 500)
      .style("fill", "#FFFFFF");
    sel.append("circle")
      .attr("cx", d => this.x(d.className))
      .attr("cy", d => this.y(d.className))
      .attr("r", 150)
      .style("fill", "#000000");
  }

  private drawClips(): void {
    this.svg.selectAll("clips")
      .data(this.data.primary)
      .enter()
      .append("clipPath")
      .attr("id", d => "clip-" + d.className)
      .append("circle")
      .attr("cx", d => this.x(d.className))
      .attr("cy", d => this.y(d.className))
      .attr("r", 150)
      .style("fill", "#ffffff");

    var econEnv = this.svg.append("clipPath")
      .attr("id", d => "clip-econ-env");
    econEnv.append("circle")
      .attr("clip-path", 'url("#clip-env")')
      .attr("cx", d => this.x("econ"))
      .attr("cy", d => this.y("econ"))
      .attr("r", 150)
      .style("fill", "#ffffff");
  }

  private drawVenn(): void {
    var circle = this.svg.selectAll("circle")
      .data(this.data.primary)
      .enter()
      .append("circle")
      .attr("cx", d => this.x(d.className))
      .attr("cy", d => this.y(d.className))
      .attr("r", 150)
      .style("fill", d => this.fill(d.value));

    this.drawMasks();
    this.drawClips();
    this.drawHatching();
    
    this.svg.selectAll("secs")
      .data(this.data.secondary)
      .enter()
      .append("circle")
      .attr("id", d => d.className)
      .attr("cx", d => this.x(d.className))
      .attr("cy", d => this.y(d.className))
      .attr("clip-path", d => this.clip(d.className))
      .attr("mask", d => this.mask(d.className))
      .attr("r", 150)
      .style("fill", d=>this.fill(d.value));

    this.svg.selectAll("outline")
      .data(this.data.primary)
      .enter()
      .append("circle")
      .attr("cx", d => this.x(d.className))
      .attr("cy", d => this.y(d.className))
      .attr("r", 150)
      .style("fill", "none")
      .style("stroke-width", 3)
      .style("stroke", "#ffffff");

      this.svg.selectAll("circleText")
        .data(this.data.primary)
        .enter()
        .append("text")
        .attr("x", d => this.titleX(d.className))
        .attr("y", d => this.titleY(d.className))
        .text(d => d.name)
        .style("fill", "#ffffff")
        .style("font-family", "Montserrat")
        .style("font-weight", 600)
        .style("font-size", "14px")
        .style("letter-spacing", "2.1px");

      this.svg.selectAll("secsText")
        .data(this.data.secondary)
        .enter()
        .append("text")
        .attr("x", d => this.titleX(d.className))
        .attr("y", d => this.titleY(d.className))
        .text(d => d.name)
        .style("fill", "#ffffff")
        .style("font-family", "Montserrat")
        .style("font-weight", 600)
        .style("font-size", "14px")
        .style("letter-spacing", "2.1px");

      this.svg.selectAll("secsText")
        .data(this.data.secondary.filter(r => r.name2))
        .enter()
        .append("text")
        .attr("x", d => this.titleX(d.className))
        .attr("y", d => this.titleY(d.className) + 20)
        .text(d => d.name2)
        .style("fill", "#ffffff")
        .style("font-family", "Montserrat")
        .style("font-weight", 600)
        .style("font-size", "14px")
        .style("letter-spacing", "2.1px");

      this.svg.selectAll("primIcons")
        .data(this.data.primary)
        .enter()
        .append("image")
        .attr("href", d => this.icon(d.className))
        .attr("x", d => this.iconX(d.className))
        .attr("y", d => this.iconY(d.className))
        .attr("width", 15)
        .attr("height", 18);

      let centermask = this.svg.append("mask")
        .attr("id", "centermask");

      centermask.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 500)
        .attr("height", 500)
        .style("fill", "#FFFFFF");
        
      centermask.append("rect")
        .attr("x", 180)
        .attr("y", 220)
        .attr("width", 60)
        .attr("height", 20)
        .style("fill", "#000000");

      this.svg.append("circle")
        .attr("cx", 210)
        .attr("cy", 230)
        .attr("r", 18)
        .attr("mask", "url(#centermask)")
        .style("stroke-width", 2)
        .style("stroke", "#ffffff")
        .style("fill", "none");
  }

  private drawBlankVenn() {
    var circle = this.svg.selectAll("circle")
      .data(this.data.primary)
      .enter()
      .append("circle")
      .attr("cx", d => this.x(d.className))
      .attr("cy", d => this.y(d.className))
      .attr("r", 150)
      .style("fill", '#E4E4E4');
  }

  private drawLegend(): void {
    /*
    let data = [
      { className: "low", value: 0, name: "NEGATIVE", xpos: 40, ypos: 0 },
      { className: "medium", value: 1, name: "NEUTRAL", xpos: 163, ypos: 0 },
      { className: "high", value: 2, name: "POSITIVE", xpos: 280, ypos: 0 },
      { className: "undefined", value: -1, name: "MISSING DATA", xpos: 140, ypos: 20 }
    ];
    */
    let data = [
      { className: "low", value: 0, name: "LOW", xpos: 0, ypos: 0 },
      { className: "medium", value: 1, name: "MEDIUM", xpos: 83, ypos: 0 },
      { className: "high", value: 2, name: "HIGH", xpos: 200, ypos: 0 },
      { className: "undefined", value: -1, name: "MISSING DATA", xpos: 285, ypos: 0 }
    ];

    this.svg.selectAll("legend")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", d => d.xpos)
      .attr("cy", d => 458 + d.ypos)
      .attr("r", 4.5)
      .style("fill", d=>this.fill(d.value));

    this.svg.selectAll("legendText")
      .data(data)
      .enter()
      .append("text")
      .attr("x", d=>d.xpos + 15)
      .attr("y", d=>d.ypos + 463)
      .text(d=>d.name)
      .style("fill", d=>this.fill(d.value))
      .style("font-family", "Montserrat")
      .style("font-weight", 600)
      .style("font-size", "14px")
      .style("letter-spacing", "2.1px");
  }
}
