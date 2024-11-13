import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) { }

  public isAuthenticated(): boolean {
    const userData = localStorage.getItem('userInfo');
    if (userData && JSON.parse(userData)){
      return true;
    }
    return false;
  }

  public setUserInfo(user){
    localStorage.setItem('userInfo', JSON.stringify(user));
  }

  public validate(username, password) {

    return this.http.post('/api/authenticate', {'username': username, 'password' : password}).toPromise();
  }
  public logout(){
    localStorage.removeItem('userInfo');
  }
}
