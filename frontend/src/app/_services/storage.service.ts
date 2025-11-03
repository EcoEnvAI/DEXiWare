import { Injectable } from '@angular/core';
import { Location } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  private prefix = '';

  constructor(location: Location) {
    let angularPath = location.path();
    if (angularPath != '') {
      let pos = window.location.href.lastIndexOf(angularPath);
      this.prefix = window.location.href.substr(0, pos + 1);
    } else {
      this.prefix = window.location.href;
    }
  }

  getItem(key) {
    return localStorage.getItem(this.prefix + key);
  }

  setItem(key, val) {
    localStorage.setItem(this.prefix + key, val);
  }

  removeItem(key) {
    localStorage.removeItem(this.prefix + key);
  }
}
