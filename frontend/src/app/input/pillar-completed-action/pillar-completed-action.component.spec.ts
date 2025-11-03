import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PillarCompletedActionComponent } from './pillar-completed-action.component';

describe('PillarCompletedActionComponent', () => {
  let component: PillarCompletedActionComponent;
  let fixture: ComponentFixture<PillarCompletedActionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PillarCompletedActionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PillarCompletedActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
