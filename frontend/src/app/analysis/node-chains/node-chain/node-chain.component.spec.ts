import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NodeChainComponent } from './node-chain.component';

describe('NodeChainComponent', () => {
  let component: NodeChainComponent;
  let fixture: ComponentFixture<NodeChainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NodeChainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NodeChainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
