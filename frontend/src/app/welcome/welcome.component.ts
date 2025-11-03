import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ConfigService } from '../_services/config.service';
import { AssessmentSelectorComponent } from '../assessment-selector/assessment-selector.component';
import { ApiService } from '../_services/api.service';

@Component({
    selector: 'true-welcome',
    templateUrl: './welcome.component.html',
    styleUrls: ['./welcome.component.scss'],
    standalone: false
})
export class WelcomeComponent implements OnInit {
  notAgain: boolean = false;

  constructor(private dialogRef: MatDialogRef<WelcomeComponent>, private config: ConfigService, private dialog: MatDialog, private api: ApiService) { }

  ngOnInit(): void {
    this.config.welcomeShown();
  }

  manual(): void {
    this.handleNotAgain();
    window.open('/true/assets/pdf/PathfinderUserManual.pdf', '_blank');
  }

  startNew(): void {
    this.handleNotAgain();
    this.dialogRef.close();

    let dialogRef = this.dialog.open(AssessmentSelectorComponent, {
      height: '400px',
      width: '600px',
      data : { newAssessment: true, simple: true }
    });

    dialogRef.beforeClosed().subscribe(() => {
      window.location.reload();
    });
  }

  importDefault(): void {
    this.handleNotAgain();
    this.dialogRef.close();

    this.api.importDefaultAssessment().subscribe(
      (assessment:any) => {
        this.api.setAssessment(assessment.id, assessment.name);
        window.location.reload();
      }, (err) => {
        console.error('Error importing demo assessment:', err);
        alert('An error occurred while importing. Please try again later.');
      }
    );
  }

  openExisting(): void {
    this.handleNotAgain();
    this.dialogRef.close();

    let dialogRef = this.dialog.open(AssessmentSelectorComponent, {
      height: '400px',
      width: '600px',
      data : { newAssessment: false, simple: true }
    });

    dialogRef.beforeClosed().subscribe(() => {
      window.location.reload();
    });
  }

  handleNotAgain() {
    if (this.notAgain) {
      this.config.showWelcome = false;
    }
  }
}
