import { Injectable } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';

export interface CanComponentDeactivate {
  canDeactivate: () => Observable<boolean> | Promise<boolean> | boolean;
  lastTrigger: 'imperative' | 'popstate' | 'hashchange';
  location: Location;
}

@Injectable({
  providedIn: 'root'
})
export class NavigationGuardService  {
  canDeactivate(component: CanComponentDeactivate, 
                currentRoute: ActivatedRouteSnapshot, 
                currentState: RouterStateSnapshot, 
                nextState?: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

      console.log(component);
      let canLeave = component.canDeactivate(); //the function will be called on the component, that's why we'll implement the function on the component.

      if (!canLeave && component.lastTrigger === 'popstate') {
        component.location.go(currentState.url);
      }

      return canLeave;
  }   
}
