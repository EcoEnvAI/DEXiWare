import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BottomupScenarioComponent } from './bottomup-scenario.component';

describe('BottomupScenarioComponent', () => {
  let component: BottomupScenarioComponent;
  let fixture: ComponentFixture<BottomupScenarioComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BottomupScenarioComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BottomupScenarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
