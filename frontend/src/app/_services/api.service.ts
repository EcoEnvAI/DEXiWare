import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from "@angular/router"
import { map, flatMap, catchError } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from './auth.service';
import { of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ConfigService } from 'src/app/_services/config.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private _assessmentId;
  private _assessmentName;
  private baseHref = environment.backendServer;
  
  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router,
    private cookie: CookieService,
    private config: ConfigService) {}


  public resetAssessment() {
    this._assessmentId = null;
  }

  getAssessment() {
    if (this._assessmentId) {
      return of({id: this._assessmentId, name: this._assessmentName});
    }

    let cookieVal = this.cookie.get("assessmentId");

    if (cookieVal) {
      this._assessmentId = parseInt(cookieVal);
      this._assessmentName = this.cookie.get("assessmentName");
      return of({id: this._assessmentId, name: this._assessmentName});
    } else {
      let userInfoVal = this.authService.assessmentId();
    
      if (userInfoVal) {
        this._assessmentId = userInfoVal;

        return this.getAssessments().pipe(
          map((assessments) => {
            let assessment = assessments.filter(a => a.id == this._assessmentId);
            if (assessment) {
              this._assessmentName = assessment.name;
            } else {
              this._assessmentId = assessments[0].id;
              this._assessmentName = assessments[0].name;
            }
            return {id: this._assessmentId, name: this._assessmentName};
          })
        );
      } else {
        /*
        return this.getAssessments().pipe(
          map((assessments) => {
            if (assessments && assessments.length > 0) {
              this._assessmentId = assessments[0].id;
              this._assessmentName = assessments[0].name;
            } else {
              this._assessmentId = null;
              this._assessmentName = '';
            }
            
            return {id: this._assessmentId, name: this._assessmentName};
          })
        );*/
        return of(null);
      }
    }
  }

  setAssessment(assessmentId, assessmentName) {
    this._assessmentId = assessmentId;
    this._assessmentName = assessmentName;
    this.cookie.set("assessmentId", assessmentId, 365, '/');
    this.cookie.set("assessmentName", assessmentName, 365, '/');
  }
  
  handleNotLoggedIn(err: any) {
    if (err.url && err.url.endsWith('/login')) {
      this.authService.logout();
      this.router.navigate(['login']);
    } else {
      return of(err);
    }
    return of(false);
  };

  handleErrors(err: any) {
    console.log(err);
    console.log(err.status);
    if (err.status != 201) {
      return of(false);
    }
  }

  getPillars() {
    let url = this.baseHref + "api/structure/pillars";

    return this.http.get(url).pipe(
      map((pillars: any[]) => {

        for (let pillar of pillars) {
          pillar.description = pillar.Pillar_descriptions[0];

          let parts = pillar.description.name.split("_");
          if (parts.length > 1) {
            pillar.description.description = parts.slice(0, parts.length-1).join(" ") + "_" + parts[parts.length-1];
          } else {
            pillar.description.description = parts[0].replace("_", " ");
          }
          parts = pillar.description.name.split("_");
          if (parts.length > 1) {
            pillar.description.name = parts.slice(0, parts.length-1).join(" ");
          } else {
            pillar.description.name = parts[0].replace("_", " ");
          }
          pillar.classname = pillar.description.name.toLowerCase().replaceAll(' ', '-');
          if (pillar.Nodes) {
            for (let node of pillar.Nodes) {
              node.description = node.Node_descriptions[0];
              node.classname = node.description.name.toLowerCase();
            }
          }
        }
        return pillars;
      })
    ).pipe(catchError(this.handleNotLoggedIn.bind(this)));
  }

  getPillarIndicators(assessmentId: number, pillarId: number) {
    let url = this.baseHref + "api/assessment/" + assessmentId + "/pillars/" + pillarId + "/indicators/all";

    return this.http.get(url).pipe(
      map((indicators: any[]) => {
        for (let indicator of indicators) {
          indicator.description = indicator.Indicator_descriptions[0];
          /*
          indicator.Theme.description = indicator.Theme.Theme_descriptions[0];
          if (indicator.Theme.parentTheme) {
            indicator.Theme.parentTheme.description = indicator.Theme.parentTheme.Theme_descriptions[0];
          }
          for (let threshold of indicator.Indicator_thresholds) {
            threshold.description = threshold.Indicator_threshold_descriptions[0];
          }*/
        }

        return indicators;
      })
    ).pipe(catchError(this.handleNotLoggedIn.bind(this)));
  }

  getNodes() {
    let url = this.baseHref + "api/structure/nodes";

    return this.http.get(url).pipe(
      map((nodes: any[]) => {
        for (let node of nodes) {
          node.description = node.Node_descriptions[0];
          node.classname = node.description.name.toLowerCase();
        }

        return nodes;
      })
    ).pipe(catchError(this.handleNotLoggedIn.bind(this)));
  }

  getUserPillars(assessmentId) {
    let url = this.baseHref + "api/assessment/" + assessmentId + "/pillars";

    return this.http.get(url).pipe(
      map((pillars: any[]) => {

        for (let pillar of pillars) {
          pillar.description = pillar.Pillar_descriptions[0];

          let parts = pillar.description.name.split("_");
          if (parts.length > 1) {
            pillar.description.description = parts.slice(0, parts.length-1).join(" ") + "_" + parts[parts.length-1];
          } else {
            pillar.description.description = parts[0].replace("_", " ");
          }
          parts = pillar.description.name.split("_");
          if (parts.length > 1) {
            pillar.description.name = parts.slice(0, parts.length-1).join(" ");
          } else {
            pillar.description.name = parts[0].replace("_", " ");
          }
          pillar.classname = pillar.description.name.toLowerCase().replaceAll(' ', '-');
          pillar.pct = pillar.answerCount * 100 / pillar.indicatorCount;

          for (let node of pillar.Nodes) {
            node.description = node.Node_descriptions[0];
            node.classname = node.name.toLowerCase();
          }
        }
        return pillars;
      })
    ).pipe(catchError(this.handleNotLoggedIn.bind(this)));
  }

  getUserIndicators(assessmentId) {
    let url = this.baseHref + "api/assessment/" + assessmentId + "/indicators";

    return this.http.get(url).pipe(
      map((indicators: any[]) => {
        for (let indicator of indicators) {
          indicator.description = indicator.Indicator_descriptions[0];
          for (let threshold of indicator.Indicator_thresholds) {
            threshold.description = threshold.Indicator_threshold_descriptions[0];
          }
          if (indicator.Assessment_indicator_answers.length > 0) {
            indicator.value = indicator.Assessment_indicator_answers[0].value;
          }
        }

        return indicators;
      })
    ).pipe(catchError(this.handleNotLoggedIn.bind(this)));
      /*
      map((uais: any[]) => {
        let indicators = [];
        for (let uai of uais) {
          let indicator = uai.Indicator;
          let existing = indicators.find((i) => i.id == indicator.id);
          if (existing) {
            existing.permissions.push(uai.User_indicator_privilege.role);
          } else {
            indicator.description = indicator.Indicator_descriptions[0];
            for (let threshold of indicator.Indicator_thresholds) {
              threshold.description = threshold.Indicator_threshold_descriptions[0];
            }
            indicator.permissions = [uai.User_indicator_privilege.role];
            if (indicator.Assessment_indicator_answers.length > 0) {
              indicator.value = indicator.Assessment_indicator_answers[0].value;
            }
            indicators.push(indicator);
          }
        }
        
        return indicators;
      })*/
  }

  setThemeDescriptions(theme) {
    if (theme != null) {
      theme.description = theme.Theme_descriptions[0];
      if (theme.parentTheme) {
        this.setThemeDescriptions(theme.parentTheme);
      }
    }
  }

  getUserPillarIndicators(assessmentId, pillarId) {
    let url = this.baseHref + "api/assessment/" + assessmentId + "/pillars/" + pillarId + "/indicators";

    return this.http.get(url).pipe(
      map((indicators: any[]) => {
        for (let indicator of indicators) {
          indicator.description = indicator.Indicator_descriptions[0];
          this.setThemeDescriptions(indicator.Theme);
          for (let threshold of indicator.Indicator_thresholds) {
            threshold.description = threshold.Indicator_threshold_descriptions[0];
          }
          if (indicator.Assessment_indicator_answers.length > 0) {
            indicator.value = indicator.Assessment_indicator_answers[0].value;
          }
        }
        return indicators;
      })
    ).pipe(catchError(this.handleNotLoggedIn.bind(this)));
      /*
      map((uais: any[]) => {
        let indicators = [];
        for (let uai of uais) {
          let indicator = uai.Indicator;
          let existing = indicators.find((i) => i.id == indicator.id);
          if (existing) {
            existing.permissions.push(uai.User_indicator_privilege.role);
          } else {
            indicator.description = indicator.Indicator_descriptions[0];

            this.setThemeDescriptions(indicator.Theme);

            for (let threshold of indicator.Indicator_thresholds) {
              threshold.description = threshold.Indicator_threshold_descriptions[0];
            }
            indicator.permissions = [uai.User_indicator_privilege.role];
            if (indicator.Assessment_indicator_answers.length > 0) {
              indicator.value = indicator.Assessment_indicator_answers[0].value;
            }
            indicators.push(indicator);
          }
        }

        return indicators;
      })*/
    
  }

  getAssessmentUsers() {
    return this.getAssessment().pipe(
      flatMap(assessment => {
        let url = this.baseHref + "api/structure/users";
        
        if (assessment) {
          let assessmentId = assessment.id;
          url = this.baseHref + "api/assessment/" + assessmentId + "/users";
        }
    
        return this.http.get(url)
          .pipe(catchError(this.handleNotLoggedIn.bind(this)));
      }));
  }

  getUsers() {
    let url = this.baseHref + "api/structure/users";
    return this.http.get(url)
  }

  getAssessmentEvaluation(assessmentId) {
    let url = this.baseHref + "api/assessment/" + assessmentId + "/evaluate";
    return this.http.post(url, {});
  }

  getAssessmentTopDownEvaluation(assessmentId, changes) {
    let url = this.baseHref + "api/assessment/" + assessmentId + "/top-down";
    return this.http.post(url, changes);
  }

  getAssessmentBottomUpEvaluation(assessmentId, changes) {
    let url = this.baseHref + "api/assessment/" + assessmentId + "/bottom-up";
    return this.http.post(url, changes);
  }

  createUser(name, email) {
    return this.getAssessment().pipe(
      flatMap(assessment => {
      let url = this.baseHref + "api/structure/users";

      if (assessment) {
        let assessmentId = assessment.id;
        url = this.baseHref + "api/assessment/" + assessmentId + "/user";
      }
      
      let user = {
        name: name,
        email: email
      }
  
      return this.http.post(url, user)
        .pipe(catchError(this.handleNotLoggedIn.bind(this)));
    }));
  }

  addUser(userId) {
    return this.getAssessment().pipe(
      flatMap(assessment => {
        let url = this.baseHref + "api/structure/users";

        if (assessment) {
          let assessmentId = assessment.id;
          url = this.baseHref + "api/assessment/" + assessmentId + "/user/" + userId;
        }
    
        return this.http.post(url, {})
          .pipe(catchError(this.handleNotLoggedIn.bind(this)));
    }));
  }

  getAssessments() {
    let url = this.baseHref + "api/assessment";

    return this.http.get(url)
      .pipe(catchError(this.handleNotLoggedIn.bind(this)));
  }

  createAssessment(name) {
    let data = {
      "name": name
    }
    let url = this.baseHref + "api/assessment/";
    return this.http.post(url, data);
  }

  updateAssessment(assessmentId, name) {
    let data = {
      "name": name
    }
    let url = this.baseHref + "api/assessment/" + assessmentId;
    return this.http.post(url, data);
  }

  removeAssessment(assessmentId) {
    let url = this.baseHref + "api/assessment/" + assessmentId;
    return this.http.delete(url);
  }

  setUserPermission(assessmentId, indicatorId, userId, permission) {
    let url = this.baseHref + "api/assessment/" + assessmentId + "/indicators/" + indicatorId + "/users/" + userId;
    return this.http.post(url, permission);
  }

  setPillarUserPermission(assessmentId, pillarId, userId, permission, value) {
    let url = this.baseHref + "api/assessment/" + assessmentId + "/indicators/pillars/" + pillarId + "/users/" + userId;
    let data = {};
    data[permission] = value;
    return this.http.post(url, data)
      .pipe(catchError(this.handleNotLoggedIn.bind(this)));
  }

  setNodeUserPermission(assessmentId, pillarId, nodeId, userId, permission, value) {
    let url = this.baseHref + "api/assessment/" + assessmentId + "/indicators/pillars/" + pillarId + "/nodes/" + nodeId + "/users/" + userId;

    let data = {};
    data[permission] = value;
    return this.http.post(url, data)
      .pipe(catchError(this.handleNotLoggedIn.bind(this)));
  }

  submitAssessmentIndicator(assessmentId, indicatorId, value) {
    let url = this.baseHref + "api/assessment/" + assessmentId + "/indicators/" + indicatorId;
    let data = { "value": value };
    
    return this.http.post(url, data)
      .pipe(catchError(this.handleNotLoggedIn.bind(this)))
      .pipe(catchError(this.handleErrors.bind(this)));
  }

  createScenario(assessmentId, data) {
    let url = this.baseHref + "api/assessment/" + assessmentId + "/scenario";
    return this.http.post(url, data);
  }

  getScenarios(assessmentId) {
    let url = this.baseHref + "api/assessment/" + assessmentId + "/scenarios";
    return this.http.get(url);
  }

  removeScenario(assessmentId, scenarioId) {
    let url = this.baseHref + "api/assessment/" + assessmentId + "/scenarios/" + scenarioId;
    return this.http.delete(url);
  }

  importDefaultAssessment() {
    let url = this.baseHref + "api/assessment/default";
    return this.http.post(url, {});
  }
}
