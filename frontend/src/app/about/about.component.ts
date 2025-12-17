import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'true-about',
    templateUrl: './about.component.html',
    styleUrls: ['./about.component.scss'],
    standalone: false
})
export class AboutComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<AboutComponent>) { }

  ngOnInit(): void {
  }

  close():void {
    this.dialogRef.close();
  }
}
