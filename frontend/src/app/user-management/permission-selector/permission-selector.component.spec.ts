import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PermissionSelectorComponent } from './permission-selector.component';

describe('PermissionSelectorComponent', () => {
  let component: PermissionSelectorComponent;
  let fixture: ComponentFixture<PermissionSelectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PermissionSelectorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PermissionSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
