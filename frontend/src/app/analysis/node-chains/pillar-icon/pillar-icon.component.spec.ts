import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PillarIconComponent } from './pillar-icon.component';

describe('PillarIconComponent', () => {
  let component: PillarIconComponent;
  let fixture: ComponentFixture<PillarIconComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PillarIconComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PillarIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
