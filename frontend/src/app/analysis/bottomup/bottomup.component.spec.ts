import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BottomupComponent } from './bottomup.component';

describe('BottomupComponent', () => {
  let component: BottomupComponent;
  let fixture: ComponentFixture<BottomupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BottomupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BottomupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
