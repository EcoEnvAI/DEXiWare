import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InputComponent } from './input/input.component';
import { AnalysisComponent } from './analysis/analysis.component';
import { TopdownComponent } from './analysis/topdown/topdown.component';
import { BottomupComponent } from './analysis/bottomup/bottomup.component';
import { ScenariosComponent } from './scenarios/scenarios.component';
import { ResetComponent } from './reset/reset.component';
import { AuthGuardService } from './_services/auth-guard.service';
import { LoginComponent } from './login/login.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { RoleGuardService } from './_services/role-guard.service';
import { NavigationGuardService } from './_services/navigation-guard.service';
import { EmailConfirmationComponent } from './email-confirmation/email-confirmation.component';

const routes: Routes = [
  { path: '', redirectTo: 'input', pathMatch: 'full' },
  { path: 'input', component: InputComponent, canActivate: [AuthGuardService] },
  { path: 'input/:pillar', component: InputComponent, canActivate: [AuthGuardService] },
  { path: 'input/:pillar/:indicatorId', component: InputComponent, canActivate: [AuthGuardService] },
  { path: 'analysis', component: AnalysisComponent, canActivate: [AuthGuardService], runGuardsAndResolvers: 'always' },
  { path: 'analysis/topdown/:goal/:direction', component: TopdownComponent, canActivate: [AuthGuardService], canDeactivate: [NavigationGuardService], runGuardsAndResolvers: 'always' },
  { path: 'analysis/bottomup', component: BottomupComponent, canActivate: [AuthGuardService], canDeactivate: [NavigationGuardService], runGuardsAndResolvers: 'always' },
  { path: 'scenarios', component: ScenariosComponent, canActivate: [AuthGuardService] },
  { path: 'users', component: UserManagementComponent, canActivate: [AuthGuardService, RoleGuardService] },
  { path: 'login', component: LoginComponent },
  { path: 'reset/:email/:hash', component: ResetComponent },
  { path: 'confirm/:email/:hash', component: EmailConfirmationComponent },
  { path: '**', redirectTo: '/input', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
