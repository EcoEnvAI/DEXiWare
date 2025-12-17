import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { CookieService } from 'ngx-cookie-service';
import { NgcCookieConsentModule, NgcCookieConsentConfig } from 'ngx-cookieconsent';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { LoginComponent } from './login/login.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MenuComponent } from './menu/menu.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { InputComponent } from './input/input.component';
import { AnalysisComponent } from './analysis/analysis.component';
import { ScenariosComponent } from './scenarios/scenarios.component';
import { PillarComponent } from './input/pillar/pillar.component';
import { CircularProgressComponent } from './input/circular-progress/circular-progress.component';
import { BulletComponent } from './input/chain/bullet/bullet.component';
import { ChainComponent } from './input/chain/chain.component';
import { RatingComponent } from './input/rating/rating.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { PillarSelectorComponent } from './common/pillar-selector/pillar-selector.component';
import { UserStatsComponent } from './user-management/user-stats/user-stats.component';
import { UserPermissionsComponent } from './user-management/user-permissions/user-permissions.component';
import { PermissionSelectorComponent } from './user-management/permission-selector/permission-selector.component';
import { NewUserComponent } from './user-management/new-user/new-user.component';
import { ReviewRatingsComponent } from './input/review-ratings/review-ratings.component';
import { CompleteIconComponent } from './input/complete-icon/complete-icon.component';
import { IndicatorRowComponent } from './input/indicator-row/indicator-row.component';
import { TrafficLightsComponent } from './input/traffic-lights/traffic-lights.component';
import { NodeChainsComponent } from './analysis/node-chains/node-chains.component';
import { NodeChainComponent } from './analysis/node-chains/node-chain/node-chain.component';
import { VennDiagramComponent } from './analysis/venn-diagram/venn-diagram.component';
import { PillarIconComponent } from './analysis/node-chains/pillar-icon/pillar-icon.component';
import { BottomupInputComponent } from './analysis/bottomup/bottomup-input/bottomup-input.component';
import { BinaryInputComponent } from './analysis/binary-input/binary-input.component';
import { VariationComponent } from './analysis/topdown/variation/variation.component';
import { AssessmentSelectorComponent } from './assessment-selector/assessment-selector.component';
import { SubThemesComponent } from './input/pillar/sub-themes/sub-themes.component';
import { ResetComponent } from './reset/reset.component';
import { BottomupComponent } from './analysis/bottomup/bottomup.component';
import { TopdownComponent } from './analysis/topdown/topdown.component';

import { ReplaceLinksPipe } from './_pipes/replace-links.pipe';
import { Max2WordsPipe } from './_pipes/max2words.pipe';
import { TruncatePipe } from './_pipes/truncate.pipe';
import { BottomupScenarioComponent } from './scenarios/bottomup-scenario/bottomup-scenario.component';
import { TopdownScenarioComponent } from './scenarios/topdown-scenario/topdown-scenario.component';
import { FooterComponent } from './footer/footer.component';

import { NavigationService } from './_services/navigation.service';
import { EvaluationDiagramComponent } from './analysis/evaluation-diagram/evaluation-diagram.component';
import { PillarCompletedActionComponent } from './input/pillar-completed-action/pillar-completed-action.component';
import { EmailConfirmationComponent } from './email-confirmation/email-confirmation.component';
import { BreadcrumbsComponent } from './breadcrumbs/breadcrumbs.component';
import { ExportComponent } from './export/export.component';
import { AboutComponent } from './about/about.component';
import { HelpComponent } from './help/help.component';
import { ScenarioNameComponent } from './analysis/scenario-name/scenario-name.component';
import { WelcomeComponent } from './welcome/welcome.component';


const cookieConfig: NgcCookieConsentConfig = {
  cookie: {
    domain: 'dexiware.ijs.si' // or 'your.domain.com' // it is mandatory to set a domain, for cookies to work properly (see https://goo.gl/S2Hy2A)
  },
  position: "bottom",
  theme: "edgeless",
  palette: {
    popup: {
      background: "#707070",
      text: "#ffffff"
    },
    button: {
      background: "#E4E4E4",
      text: "#707070"
    }
  },
  type: "opt-in",
  layout: 'my-custom-layout',
  layouts: {
    "my-custom-layout": '{{messagelink}}{{compliance}}'
  },
  elements:{
    messagelink: `
    <span id="cookieconsent:desc" class="cc-message">{{message}} 
      <a aria-label="learn more about our privacy policy" tabindex="1" class="cc-link" href="{{privacyPolicyHref}}" target="_blank">{{privacyPolicyLink}}</a> and our 
      <a aria-label="learn more about our terms of service" tabindex="2" class="cc-link" href="{{tosHref}}" target="_blank">{{tosLink}}</a>
    </span>
    `,
  },
  content:{
    message: 'Our website uses cookies to optimize your user experience. For more information please see our ',
    
    privacyPolicyLink: 'Privacy Policy',
    privacyPolicyHref: '/true/assets/pdf/True_Privacy_Policy.pdf',
 
    tosLink: 'Terms and Conditions',
    tosHref: '/true/assets/pdf/True_Terms_Conditions.pdf',
  }
  /*
  content: {
    message: "Our website uses cookies to optimize your user experience.",
    deny: "Refuse cookies",
    link: "Learn more",
    href: "https://cookiesandyou.com",
    policy: "Cookie Policy"
  }*/
};

@NgModule({ declarations: [
        AppComponent,
        LoginComponent,
        MenuComponent,
        InputComponent,
        AnalysisComponent,
        ScenariosComponent,
        PillarComponent,
        CircularProgressComponent,
        BulletComponent,
        ChainComponent,
        RatingComponent,
        UserManagementComponent,
        PillarSelectorComponent,
        UserStatsComponent,
        UserPermissionsComponent,
        PermissionSelectorComponent,
        NewUserComponent,
        ReviewRatingsComponent,
        CompleteIconComponent,
        IndicatorRowComponent,
        TrafficLightsComponent,
        NodeChainsComponent,
        NodeChainComponent,
        VennDiagramComponent,
        PillarIconComponent,
        BottomupInputComponent,
        BinaryInputComponent,
        VariationComponent,
        AssessmentSelectorComponent,
        SubThemesComponent,
        ResetComponent,
        BottomupComponent,
        TopdownComponent,
        ReplaceLinksPipe,
        Max2WordsPipe,
        TruncatePipe,
        BottomupScenarioComponent,
        TopdownScenarioComponent,
        FooterComponent,
        EvaluationDiagramComponent,
        PillarCompletedActionComponent,
        EmailConfirmationComponent,
        BreadcrumbsComponent,
        ExportComponent,
        AboutComponent,
        HelpComponent,
        ScenarioNameComponent,
        WelcomeComponent
    ],
    bootstrap: [AppComponent], imports: [BrowserModule,
        AppRoutingModule,
        FormsModule,
        BrowserAnimationsModule,
        MatMenuModule,
        MatIconModule,
        MatDialogModule,
        AngularSvgIconModule.forRoot(),
        NgcCookieConsentModule.forRoot(cookieConfig)], providers: [CookieService, NavigationService, provideHttpClient(withInterceptorsFromDi())] })
export class AppModule {
  constructor() {}
 }
