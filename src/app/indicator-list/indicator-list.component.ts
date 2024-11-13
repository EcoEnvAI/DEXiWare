import { Component } from '@angular/core';
import indicatorsJsonFile from '../../assets/indicators.json';
import { Router } from '@angular/router';
import { AuthService } from '../_services/auth.service';


@Component({
  selector: 'app-indicator-list',
  templateUrl: './indicator-list.component.html',
  styleUrls: ['./indicator-list.component.css']
})
export class IndicatorListComponent {
  pillarNames = ["ENVIRONMENTAL PILLAR", "ECONOMIC PILLAR", "SOCIO-POLICY PILLAR"];
  indicators;
  constructor(private router: Router, private authService: AuthService) {
    this.indicators = indicatorsJsonFile;
   }
   logout(){
    this.authService.logout();
    this.router.navigate(['login']);
   }
}
