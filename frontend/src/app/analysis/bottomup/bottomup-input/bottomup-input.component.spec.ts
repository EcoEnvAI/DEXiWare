import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BottomupInputComponent } from './bottomup-input.component';

describe('BottomupInputComponent', () => {
  let component: BottomupInputComponent;
  let fixture: ComponentFixture<BottomupInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BottomupInputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BottomupInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
