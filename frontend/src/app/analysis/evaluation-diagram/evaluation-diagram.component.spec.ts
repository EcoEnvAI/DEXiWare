import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluationDiagramComponent } from './evaluation-diagram.component';

describe('EvaluationDiagramComponent', () => {
  let component: EvaluationDiagramComponent;
  let fixture: ComponentFixture<EvaluationDiagramComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EvaluationDiagramComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EvaluationDiagramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
