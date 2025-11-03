import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AssessmentSelectorComponent } from '../assessment-selector/assessment-selector.component';
import { AuthService } from '../_services/auth.service';
import { ApiService } from '../_services/api.service';
import { ConfigService } from '../_services/config.service';
import { ExportComponent } from '../export/export.component';
import { AboutComponent } from '../about/about.component';
import { HelpComponent } from '../help/help.component';

@Component({
    selector: 'true-menu',
    templateUrl: './menu.component.html',
    styleUrls: ['./menu.component.scss'],
    standalone: false
})
export class MenuComponent implements OnInit {
  public loggedIn: boolean;
  constructor(private route: ActivatedRoute, public readonly authService: AuthService, private api: ApiService, private router: Router, private dialog: MatDialog, public readonly config:ConfigService) { }

  ngOnInit(): void {
    this.authService.authenticated.subscribe((authenticated) => {
      this.loggedIn = authenticated;
    });
  }

  navigate(id): void {
    switch (id) {
      case 'input':
        this.router.navigateByUrl('/scenarios', {skipLocationChange: true}).then(()=> {
          this.router.navigate(['input'])
        });
        
        break;

      case 'analysis':
        this.router.navigate(['analysis'], );
        break;

      case 'scenarios':
        this.router.navigate(['scenarios']);
        break;
    }
  }

  activeClass(menuItem: string): string {
    if (this.route.snapshot['_routerState'].url.startsWith('/' + menuItem))
      return "selected";
    return "";
  }

  usermanagement(): void {
    this.router.navigate(['users']);
  }

  chooseAssessment(): void {
    let dialogRef = this.dialog.open(AssessmentSelectorComponent, {
      height: '400px',
      width: '600px',
    });

    dialogRef.beforeClosed().subscribe(() => {
      window.location.reload();
    });
  }

  logout(): void {
    this.api.resetAssessment();
    this.authService.logout();
    this.router.navigate(['login']);
  }
  
  export(): void {
    let dialogRef = this.dialog.open(ExportComponent, {
      height: '400px',
      width: '600px',
    });
  }

  help(): void {
    if (this.config.pillar_models) {
      window.open('/dexiware/assets/Resource_amplifier_-_User_Manual_-_June_2021.pdf', '_blank');
    } else {
      let dialogRef = this.dialog.open(HelpComponent, {
        height: '765px',
        width: '800px',
      });
    }
  }

  about(): void {
    let dialogRef = this.dialog.open(AboutComponent, {
      height: '765px',
      width: '800px',
    });
  }
}
