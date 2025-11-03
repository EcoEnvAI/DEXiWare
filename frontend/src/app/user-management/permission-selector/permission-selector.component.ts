import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'true-permission-selector',
    templateUrl: './permission-selector.component.html',
    styleUrls: ['./permission-selector.component.scss'],
    standalone: false
})
export class PermissionSelectorComponent implements OnInit {
  @Input() values;
  @Output() change = new EventEmitter();

  public baseHref = environment.backendServer;
  
  constructor() { }

  ngOnInit(): void {
  }

  writeClass(): string {
    if (this.values && this.values["W"]) {
      return "enabled";
    } else {
      return "";
    }
  }

  readClass(): string {
    if (this.values && this.values["R"]) {
      return "enabled";
    } else {
      return "";
    }
  }

  toggleItem(item) {
    this.values[item] = !this.values[item];
    this.change.emit(this.values);
  }

  toggleRead(): void {
    this.toggleItem("R");
  }

  toggleWrite(): void {
    this.toggleItem("W");
  }
}
