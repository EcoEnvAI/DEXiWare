import { Component, OnInit, Output, EventEmitter, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiService } from '../_services/api.service';

@Component({
    selector: 'true-assessment-selector',
    templateUrl: './assessment-selector.component.html',
    styleUrls: ['./assessment-selector.component.scss'],
    standalone: false
})
export class AssessmentSelectorComponent implements OnInit {
  public assessments = [];
  public assessmentId = null;

  public state = 'list';
  public name = '';

  public simple = false;

  @Output() done = new EventEmitter();

  constructor(private api: ApiService, private dialogRef: MatDialogRef<AssessmentSelectorComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {
    if (this.data) {
      if (this.data.simple) {
        this.simple = true;
      }

      if (this.data.newAssessment) {
        this.create();
      }
    }
  }

  ngOnInit(): void {
    this.api.getAssessments().subscribe(assessments => {
      this.assessments = assessments;
    });
  }

  create() {
    this.assessmentId = null;
    this.name = '';
    this.state = 'create';
  }

  importDemo() {
    this.api.importDefaultAssessment().subscribe(
      (assessment: any) => {
        this.api.setAssessment(assessment.id, assessment.name);
        this.dialogRef.close();
        window.location.reload();
      }, (err) => {
        console.error('Error importing demo assessment:', err);
        alert('An error occurred while importing. Please try again later.');
      }
    );
  }

  load() {
    let assessment = this.assessments.find(a => a.id==this.assessmentId);
    this.api.setAssessment(this.assessmentId, assessment.name);
    this.dialogRef.close();
  }

  close() {
    this.dialogRef.close();
  }

  delete() {
    this.api.removeAssessment(this.assessmentId).subscribe(() => {
      this.refresh();
    });
    this.refresh();
  }

  changeName() {
    let assessment = this.assessments.find(a => a.id == this.assessmentId);
    this.name = assessment.name;
    this.state = 'create';
  }
  
  cancel() {
    this.state = 'list';
  }

  update() {
    var observable;
    if (this.assessmentId == null) {
      observable = this.api.createAssessment(this.name);
    } else {
      observable = this.api.updateAssessment(this.assessmentId, this.name);
    }

    observable.subscribe((assessment) => {
      if (this.simple) {
        this.api.setAssessment(assessment.id, assessment.name);
        this.dialogRef.close();
      } else {
        this.refresh();
      }
    });
  }

  refresh() {
    this.api.getAssessments().subscribe(assessments => {
      this.assessments = assessments;
      this.state = 'list';
    });
  }
}
