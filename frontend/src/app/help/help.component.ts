import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'true-about',
    templateUrl: './help.component.html',
    styleUrls: ['./help.component.scss'],
    standalone: false
})
export class HelpComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<HelpComponent>) { }

  ngOnInit(): void {
  }

  close():void {
    this.dialogRef.close();
  }
}
