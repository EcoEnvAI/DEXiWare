import { Component, OnInit } from '@angular/core';
import { AuthService } from '../_services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfigService } from '../_services/config.service';

@Component({
    selector: 'true-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    standalone: false
})
export class LoginComponent implements OnInit {
  model: any = {};
  public state: string = '';
  public invalidUser: boolean = false;
  public unconfirmedUser: boolean = false;
  public invalidPass: boolean = false;

  constructor(private route: ActivatedRoute, private authService: AuthService, private router: Router, public readonly config: ConfigService) {
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

  login() {
    this.invalidUser = false;
    this.invalidPass = false;
    this.authService.validate(this.model.username, this.model.password)
      .then((response) => {
        this.authService.setUserInfo(response);
        this.router.navigate(['']);
      }).catch((err) => {
        if (err.status == 404) {
          this.invalidUser = true;
        } else if (err.status == 403) {
          this.unconfirmedUser = true;
        } else if (err.status == 401) {
          this.invalidPass = true;
        } else {
          console.log(err);
          console.log("An error has happened");
        }
      });
  }

  openPasswordReset() {
    this.state = 'forgotPassword';
  }

  openDefault() {
    this.state = '';
  }

  sendPasswordReset() {
    this.invalidUser = false;
    this.authService.requestReset(this.model.username).subscribe(() => {
      this.state = 'resetSent';
    }, (err) => {
      if (err.status == 404) {
        this.invalidUser = true;
      }
    });
  }

  openRegistration() {
    this.state = 'register'
  }

  register() {
    this.invalidUser = false;
    this.invalidPass = this.model.password !== this.model.password2;
    if (!this.invalidPass && this.model.agree) {
      this.authService.register(this.model.username, this.model.password).subscribe(() => {
        this.state = 'registrationSent';
      }, (err) => {
        if (err.status == 403) {
          this.invalidUser = true;
        }
      });
    }
  }

  resendConfirmationEmail(event) {
    event.preventDefault();
    this.authService.resendLink(this.model.username).subscribe(() => {
      this.state = 'registrationSent';
    }, (err) => {
      if (err.status == 403) {
        this.invalidUser = true;
      }
    });

    return false;
  }
}
