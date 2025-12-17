import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  public anonymous = false;
  public pillar_models = false;
  public registration = true;

  private _subset;
  private _showWelcome;

  public get subset() {
    return this._subset;
  }

  public set subset(value) {
    this._subset = value;
    this.localStorage.setItem('subset', value)
  }

  private _backLink = '/';
  public get backLink() {
    return this._backLink;
  }

  public set backLink(value) {
    this._backLink = value;
  }

  public get showWelcome() {
    return this._showWelcome;
  }

  public set showWelcome(value) {
    this._showWelcome = value;
    if (value === true) {
      this.cookie.set('showWelcome', '1', 365);
    } else {
      this.cookie.set('showWelcome', '0', 365);
    }
  }

  constructor(private cookie: CookieService, private localStorage: StorageService) {
    this._subset = this.localStorage.getItem('subset');
    let cookieVal = this.cookie.get("showWelcome");
    if (cookieVal === '0') {
      this._showWelcome = false;
    } else {
      this._showWelcome = true;
    }

    cookieVal = this.cookie.get("welcomeShown");
    if (cookieVal === '1') {
      // already shown in this session
      this._showWelcome = false;
    }
  }

  disableSubset(url: string) {
    this._subset = null;
  }

  resetSubset() {
    this._subset = this.localStorage.getItem('subset');
  }
  
  welcomeShown() {
    this.cookie.set('welcomeShown', '1');
    this._showWelcome = false;
  }

  resetWelcome() {
    this.cookie.delete('welcomeShown');
    let cookieVal = this.cookie.get("showWelcome");
    if (cookieVal === '0') {
      this._showWelcome = false;
    } else {
      this._showWelcome = true;
    }
  }
}
