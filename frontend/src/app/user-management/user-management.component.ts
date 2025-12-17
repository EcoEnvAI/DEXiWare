import { Component, Input, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
import { ApiService } from '../_services/api.service';
import { AuthService } from '../_services/auth.service';

@Component({
    selector: 'true-user-management',
    templateUrl: './user-management.component.html',
    styleUrls: ['./user-management.component.scss'],
    standalone: false
})
export class UserManagementComponent implements OnInit {
  public pillars;
  public nodes;
  public selectedPillar;
  public users;
  public allUsers;
  public newUserInput: boolean = false;

  @Input() assessmentId;

  constructor(private api: ApiService, private auth: AuthService) { }

  ngOnInit(): void {
    let self = this;

    this.api.getAssessment().subscribe(assessment => {
      this.assessmentId = assessment.id;
      this.api.getPillars().subscribe((data) => {
        self.pillars = data;
        if (!self.selectedPillar) {
          self.selectedPillar = self.pillars[0];
        }
      });
        
      this.refresh(true);
    });
  }

  fetchPillar() {
    if (this.nodes) {
      let self = this;
      this.api.getPillarIndicators(this.assessmentId, this.selectedPillar.id).subscribe((indicators) => {
        // clear existing indicators
        for (let node of self.nodes) {
          node.indicators = [];
        }
        for (let indicator of indicators) {
          indicator.permissions = [];
          indicator.values = [];
          for (let user of this.users) {
            let userIndicators = indicator.User_assessment_indicators.filter((i) => i.userId == user.id);
      
            indicator.permissions[user.id] = {"R": false, "W": false};
      
            for (let ind of userIndicators) {
              indicator.permissions[user.id][ind.User_indicator_privilege.role] = true;
            }

            let userAnswers = indicator.Assessment_indicator_answers.filter((a) => a.userId == user.id);
            for (let ans of userAnswers) {
              indicator.values[user.id] = ans.value;
            }
          }
          let indNode = self.nodes.find((n) => n.id == indicator.nodeId);
          indNode.indicators.push(indicator);
        }
      });
    }
  }

  pillarClass(): string {
    if (this.selectedPillar) {
      return this.selectedPillar.classname;
    } else {
      return "";
    }
  }

  selectPillar(pillar) {
    this.selectedPillar = pillar;
    this.refresh(true);
  }

  refresh(refreshPillars:boolean = false): void {
    let self = this;
    this.newUserInput = false;
    let userId = this.auth.userId();
    
    this.api.getAssessmentUsers().subscribe((users) => {
      self.users = users.filter(u => u.id != userId);

      self.api.getUsers().subscribe((users:any) => {
        let auIds = self.users.map(u => u.id);
        self.allUsers = users.filter(u => u.id != userId).filter(u => !auIds.includes(u.id));
      });
      
      if (refreshPillars) {
        
        self.api.getNodes().pipe(
          map((nodes: any[]) => {
            for (let node of nodes) {
              node.indicators = [];
            }
            return nodes;
          })
        ).subscribe((nodes) => {
          self.nodes = nodes;
          if (self.selectedPillar) {
            self.fetchPillar();
          }
        });
      }
    });
  }

  nodeUserPermissions(node, user) {
    let permissions = { "R": 0, "W": 0 };

    for (let indicator of node.indicators) {
      if (indicator.permissions[user.id].R) permissions.R += 1;
      if (indicator.permissions[user.id].W) permissions.W += 1;
    }

    return {
      "R": permissions.R == node.indicators.length,
      "W": permissions.W == node.indicators.length,
    }
  }

  setNodeUserPermissions(node, user, permissions) {
    let old = this.nodeUserPermissions(node, user);
    let permission = null;
    if (old.R != permissions.R) {
      permission = "R";
    }
    if (old.W != permissions.W) {
      permission = "W";
    }
    let value = permissions[permission];

    if (permission != null) {
      for (let indicator of node.indicators) {
        indicator.permissions[user.id][permission] = value;
      }

      this.api.setNodeUserPermission(this.assessmentId, this.selectedPillar.id, node.id, user.id, permission, value).subscribe((data) => {
        console.log(data);
      }, (error) => {
        alert("Error!");
      });
    }
  }
}
