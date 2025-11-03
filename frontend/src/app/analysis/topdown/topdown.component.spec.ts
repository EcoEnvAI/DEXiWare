import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TopdownComponent } from './topdown.component';

describe('TopdownComponent', () => {
  let component: TopdownComponent;
  let fixture: ComponentFixture<TopdownComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TopdownComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TopdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
