import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IndicatorRowComponent } from './indicator-row.component';

describe('IndicatorRowComponent', () => {
  let component: IndicatorRowComponent;
  let fixture: ComponentFixture<IndicatorRowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IndicatorRowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IndicatorRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
