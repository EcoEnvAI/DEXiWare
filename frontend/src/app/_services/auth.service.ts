import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as Rx from "rxjs";
import { environment } from 'src/environments/environment';
import { CookieService } from 'ngx-cookie-service';
import { ConfigService } from './config.service';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public authenticated: Rx.BehaviorSubject<boolean>;
  private baseHref = environment.backendServer;
  
  constructor(private http: HttpClient, private cookie: CookieService, private config: ConfigService, private localStorage: StorageService) {
    this.authenticated = new Rx.BehaviorSubject(this.isAuthenticated())
  }

  public isAuthenticated(): boolean {
    const userData = this.localStorage.getItem('userInfo');
    if (userData && JSON.parse(userData)){
      return true;
    }

    if (this.config.anonymous) {
      let user = {'User_role': 'Admin'}
      
      this.setUserInfo(user);
      return true;
    } else {
      return false;
    }
  }

  public setUserInfo(user){
    this.localStorage.setItem('userInfo', JSON.stringify(user));
    if (this.authenticated) {
      this.authenticated.next(true);
    }
  }

  public validate(username, password) {
    return this.http.post(this.baseHref + 'api/authenticate', {'username': username, 'password' : password}).toPromise();
  }

  public hasRole(role) {
    const userData = this.localStorage.getItem('userInfo');
    if (userData && JSON.parse(userData)){
      let data = JSON.parse(userData);
      return data['User_role'] && data['User_role']['role_name'] == role;
    }
    return false;
  }

  public assessmentId() {
    const userData = this.localStorage.getItem('userInfo');
    if (userData && JSON.parse(userData)){
      let data = JSON.parse(userData);
      return data['assessmentId'];
    }
  }

  public username() {
    const userData = this.localStorage.getItem('userInfo');
    if (userData && JSON.parse(userData)){
      let data = JSON.parse(userData);
      return data['username'];
    }
  }

  public userId() {
    const userData = this.localStorage.getItem('userInfo');
    if (userData && JSON.parse(userData)){
      let data = JSON.parse(userData);
      return data['id'];
    }
  }
  
  public logout(){
    this.localStorage.removeItem('userInfo');
    this.cookie.delete("assessmentId");
    this.cookie.delete("assessmentName");
    this.config.resetWelcome();
    console.log(this.localStorage.getItem('userInfo'));
    this.authenticated.next(false);
  }

  public requestReset(email) {
    let site = this.baseHref;
    return this.http.post(this.baseHref + 'api/reset/', {'email': email, 'site': site});
  }

  public verifyEmailHash(email, hash) {
    return this.http.get(this.baseHref + 'api/reset/' + email + '/' + hash);
  }

  public setPassword(email, hash, password) {
    return this.http.post(this.baseHref + 'api/reset/' + email + '/' + hash, {'password': password});
  }

  public requestPasswordResetLink(email) {
    let site = this.baseHref;
    return this.http.post(this.baseHref + 'api/reset/link/', {'email': email, 'site': site});
  }

  public register(email, password) {
    let site = this.baseHref;
    return this.http.put(this.baseHref + 'api/structure/users/', {'name': email, 'email': email, 'password': password, 'site': site});
  }

  public verifyEmailLink(email, hash) {
    return this.http.get(this.baseHref + 'api/confirm/' + email + '/' + hash);
  }

  public resendLink(email) {
    let site = this.baseHref;
    return this.http.post(this.baseHref + 'api/resend/link/', {'email': email, 'site': site});
  }
}
