import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IndicatorComponent } from './indicator/indicator.component';
import { IndicatorListComponent } from './indicator-list/indicator-list.component';
import {AuthGuardService} from './_services/auth-guard.service';
import {LoginComponent} from './login/login.component';

const routes: Routes = [
  { path: '', component: IndicatorListComponent, canActivate: [AuthGuardService]},
  { path: ':pillarId/:indicatorId', component: IndicatorComponent, canActivate: [AuthGuardService]},
  { path: 'login', component: LoginComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
