import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from "../_services/auth.service";
import { ConfigService } from '../_services/config.service';

@Component({
    selector: 'true-email-confirmation',
    templateUrl: './email-confirmation.component.html',
    styleUrls: ['./email-confirmation.component.scss'],
    standalone: false
})
export class EmailConfirmationComponent implements OnInit {
  public state:string = '';
  private email: String;
  private hash: String;

  constructor(private route: ActivatedRoute, private router: Router, private authService: AuthService, public readonly config: ConfigService) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.hash = params.get('hash');
      this.email = params.get('email');

      this.authService.verifyEmailLink(this.email, this.hash).subscribe((result: any) => {
        if (result.success) {
          this.state = 'success';
        } else {
          this.state = 'invalid';
        }
      }, () => {
        this.state = 'invalid';
      });
    });
  }

  login() {
    this.router.navigate(['login']);
  }
}
