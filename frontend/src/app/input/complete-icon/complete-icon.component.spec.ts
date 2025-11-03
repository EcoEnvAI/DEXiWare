import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CompleteIconComponent } from './complete-icon.component';

describe('CompleteIconComponent', () => {
  let component: CompleteIconComponent;
  let fixture: ComponentFixture<CompleteIconComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompleteIconComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompleteIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
