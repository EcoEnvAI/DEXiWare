import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router, Event, NavigationEnd } from '@angular/router';
import { NgcCookieConsentService } from 'ngx-cookieconsent';
import { Subscription } from 'rxjs';
import { WelcomeComponent } from './welcome/welcome.component';
import { ConfigService } from './_services/config.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    standalone: false
})
export class AppComponent {
  private popupOpenSubscription: Subscription;
  private popupCloseSubscription: Subscription;
  private initializeSubscription: Subscription;
  private statusChangeSubscription: Subscription;
  private revokeChoiceSubscription: Subscription;
  private noCookieLawSubscription: Subscription;

  title = 'true';

  constructor(private ccService: NgcCookieConsentService, private router: Router, private config: ConfigService, private dialog: MatDialog){}
 
  ngOnInit() {
    // subscribe to cookieconsent observables to react to main events
    this.popupOpenSubscription = this.ccService.popupOpen$.subscribe(
      () => {
        // you can use this.ccService.getConfig() to do stuff...
      });
 
    this.popupCloseSubscription = this.ccService.popupClose$.subscribe(
      () => {
        // you can use this.ccService.getConfig() to do stuff...
      });
 
    this.initializeSubscription = this.ccService.initialized$.subscribe(
      (event) => {
        // you can use this.ccService.getConfig() to do stuff...
      });
 
    this.statusChangeSubscription = this.ccService.statusChange$.subscribe(
      (event) => {
        // you can use this.ccService.getConfig() to do stuff...
      });
 
    this.revokeChoiceSubscription = this.ccService.revokeChoice$.subscribe(
      () => {
        // you can use this.ccService.getConfig() to do stuff...
      });
 
      this.noCookieLawSubscription = this.ccService.noCookieLaw$.subscribe(
      (event) => {
        // you can use this.ccService.getConfig() to do stuff...
      });

      this.router.events.subscribe((event: Event) => {
        if (event instanceof NavigationEnd) console.log(event);
        if (event instanceof NavigationEnd && event.url.endsWith("/") && event.urlAfterRedirects.endsWith("/input")) {
          if (this.config.showWelcome) {
            let dialogRef = this.dialog.open(WelcomeComponent, {
              height: '400px',
              width: '600px'
            });
          }
        }
      });
  }
 
  ngOnDestroy() {
    // unsubscribe to cookieconsent observables to prevent memory leaks
    this.popupOpenSubscription.unsubscribe();
    this.popupCloseSubscription.unsubscribe();
    this.initializeSubscription.unsubscribe();
    this.statusChangeSubscription.unsubscribe();
    this.revokeChoiceSubscription.unsubscribe();
    this.noCookieLawSubscription.unsubscribe();
  }
}
