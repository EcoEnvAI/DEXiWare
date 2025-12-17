import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BinaryInputComponent } from './binary-input.component';

describe('BinaryInputComponent', () => {
  let component: BinaryInputComponent;
  let fixture: ComponentFixture<BinaryInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BinaryInputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BinaryInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
