import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ConfigService } from 'src/app/_services/config.service';

@Component({
    selector: 'true-pillar-completed-action',
    templateUrl: './pillar-completed-action.component.html',
    styleUrls: ['./pillar-completed-action.component.scss'],
    standalone: false
})
export class PillarCompletedActionComponent implements OnInit {

  public completed = 0;
  public total = 0;
  public incomplete = false;
  public last = false;
  public mainAction = "";
  public pillarName = "";
  public pillarNameUppercase = "";

  constructor(public matDialogRef: MatDialogRef<PillarCompletedActionComponent>, @Inject(MAT_DIALOG_DATA) public data: any, private config: ConfigService) {
    this.total = this.data.total;
    this.completed = this.data.completed;
    this.incomplete = this.data.total !== this.data.completed;
    this.last = this.data.last;

    if (this.config.pillar_models) {
      this.pillarName = "category";
      this.pillarNameUppercase = this.pillarName.toUpperCase();
      this.mainAction = "ANALYZE CURRENT " + this.pillarNameUppercase;
    } else {
      this.pillarName = "pillar";
      this.pillarNameUppercase = this.pillarName.toUpperCase();
      this.mainAction = this.last ? "ANALYZE AGRI-FOOD CHAIN" : "ANALYZE CURRENT " + this.pillarNameUppercase;
    }
  }

  ngOnInit(): void {
    this.matDialogRef.disableClose = true;
  }

  next() {
    this.matDialogRef.close(0);
  }

  analyze() {
    this.matDialogRef.close(1);
  }

  inputMissing() {
    this.matDialogRef.close(2);
  }
}
