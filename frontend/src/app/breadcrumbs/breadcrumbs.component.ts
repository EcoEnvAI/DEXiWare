import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'true-breadcrumbs',
    templateUrl: './breadcrumbs.component.html',
    styleUrls: ['./breadcrumbs.component.scss'],
    standalone: false
})
export class BreadcrumbsComponent implements OnInit {
  private _subset;
  private _assessmentName;
  private _pillar;
  private _indicator;

  @Input() set subset(value) {
    this._subset = value;
    this.update();
  };

  @Input() set assessmentName(value) {
    this._assessmentName = value;
    this.update();
  }

  @Input() set pillar(value) {
    this._pillar = value;
    this.update();
  }

  @Input() set indicator(value) {
    this._indicator = value;
    this.update();
  }

  @Input() includeModels: boolean = true;

  public segments = [];
  public rows = [];

  constructor() { }

  ngOnInit(): void {
    this.update();
  }

  update(): void {
    this.segments = [];

    if (this._assessmentName) {
      this.segments.push({"name": "ASSESSMENT", "className": "key"});
      this.segments.push({"name": this._assessmentName, "className": "value"});
    }

    if (this._subset) {
      let segments = this._subset.split("_");

      this.segments.push({"name": "MODEL", "className": "key"});
      
      for (let segment of segments) {
        switch(segment) {
          case 'FIELD':
            this.segments.push({"name": "Field production", "className": "value"});
            break;
          case 'GREENHOUSE':
            this.segments.push({"name": "Greenhouse production", "className": "value"});
            break;
          case 'HYDROPONICS':
            this.segments.push({"name": "Hydroponics", "className": "value"});
            break;
          case 'SOILBASE':
            this.segments.push({"name": "Soilbase", "className": "value"});
            break;
          default:
            this.segments.push({"name": segment, "className": "value"});
        }
      }
    }

    if (this._pillar) {
      this.segments.push({"name": "PILLAR", "className": "key"});
      if (this._pillar.classname == 'resource-use-efficiency') {
        this.segments.push({"name": 'RUE', "className": "value"});
      } else {
        this.segments.push({"name": this._pillar.description.name, "className": "value"});
      }
    }
/*
    if (this._indicator) {
      this.segments.push(this._indicator.description.name);
    }*/

    this.rows = [];
    let row = {key: null, value: null};
    for (let segment of this.segments) {
      row[segment.className] = segment.name;

      if (row.key != null && row.value != null) {
        this.rows.push(row);
        row = {key: null, value: null};
      }
    }
  }
}