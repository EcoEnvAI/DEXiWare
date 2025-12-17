import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { AuthService } from "../_services/auth.service";
import { ConfigService } from '../_services/config.service';

@Component({
    selector: 'true-reset',
    templateUrl: './reset.component.html',
    styleUrls: ['./reset.component.scss'],
    standalone: false
})
export class ResetComponent implements OnInit {
  public state:string = '';
  public model: any = {
    password: "",
    repeated_password: ""
  };

  private email: String;
  private hash: String;
  public username: String = '';

  constructor(private route: ActivatedRoute, private router: Router, private authService: AuthService, public readonly config: ConfigService) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.hash = params.get('hash');
      this.email = params.get('email');

      this.authService.verifyEmailHash(this.email, this.hash).subscribe((result: any) => {
        if (result.success) {
          this.state = 'valid';
          this.username = result.name;
        } else {
          this.state = 'invalid';
        }
      });
    });
  }

  reset() {
    if (this.model.password == this.model.repeated_password) {
      this.authService.setPassword(this.email, this.hash, this.model.password).subscribe((success) => {
        this.state = 'success';
      });
    }
  }

  login() {
    this.router.navigate(['login']);
  }
}
