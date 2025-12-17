import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NodeChainsComponent } from './node-chains.component';

describe('NodeChainsComponent', () => {
  let component: NodeChainsComponent;
  let fixture: ComponentFixture<NodeChainsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NodeChainsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NodeChainsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
