import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'true-scenario-name',
    templateUrl: './scenario-name.component.html',
    styleUrls: ['./scenario-name.component.scss'],
    standalone: false
})
export class ScenarioNameComponent implements OnInit {
  public name = '';

  constructor(public matDialogRef: MatDialogRef<ScenarioNameComponent>) { }

  ngOnInit(): void {
  }

  close() {
    this.matDialogRef.close(this.name);
  }
}
