import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssessmentSelectorComponent } from './assessment-selector.component';

describe('AssessmentSelectorComponent', () => {
  let component: AssessmentSelectorComponent;
  let fixture: ComponentFixture<AssessmentSelectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssessmentSelectorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssessmentSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
