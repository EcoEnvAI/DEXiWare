import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PillarSelectorComponent } from './pillar-selector.component';

describe('PillarSelectorComponent', () => {
  let component: PillarSelectorComponent;
  let fixture: ComponentFixture<PillarSelectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PillarSelectorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PillarSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
