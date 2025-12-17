import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TopdownScenarioComponent } from './topdown-scenario.component';

describe('TopdownScenarioComponent', () => {
  let component: TopdownScenarioComponent;
  let fixture: ComponentFixture<TopdownScenarioComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TopdownScenarioComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TopdownScenarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
