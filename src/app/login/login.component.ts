import { Component, OnInit } from '@angular/core';
import { AuthService } from '../_services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  model: any = {};


  constructor(private route: ActivatedRoute, private authService: AuthService, private router: Router) {
    if (this.authService.isAuthenticated()){
      this.router.navigate(['']);
    }
  }

  ngOnInit() {
    const currentUrl = this.router.url;
    if (currentUrl === '/logout'){
      this.authService.logout();
    }
  }

  login(){
    this.authService.validate(this.model.username, this.model.password)
      .then((response) => {
        this.authService.setUserInfo({'user' : response['user']});
        this.router.navigate(['']);
      }).catch((err) => {
        console.log("An error has happened");
    });
  }

}
