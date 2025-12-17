import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ApiService } from '../../_services/api.service';
import { AuthService } from '../../_services/auth.service';

@Component({
    selector: 'true-user-stats',
    templateUrl: './user-stats.component.html',
    styleUrls: ['./user-stats.component.scss'],
    standalone: false
})
export class UserStatsComponent implements OnInit {
  @Input() assessmentId;
  @Input() users;
  @Input() pillar;
  @Input() nodes;
  @Output() newUserClick = new EventEmitter();

  public isLoading = '';

  constructor(private api: ApiService, private auth: AuthService) { }

  ngOnInit(): void {
  }

  userPermissions(user) {
    let permissions = { "R": 0, "W": 0 };
    let indicators = 0;
    for (let node of this.nodes) {
      for (let indicator of node.indicators) {
        if (indicator.permissions[user.id]) {
          if (indicator.permissions[user.id].R) permissions.R += 1;
          if (indicator.permissions[user.id].W) permissions.W += 1;
        }
        indicators++;
      }
    }
    return {
      "R": permissions.R == indicators,
      "W": permissions.W == indicators,
    }
  }

  setUserPermissions(user, permissions) {
    let old = this.userPermissions(user);
    let permission = null;
    if (old.R != permissions.R) {
      permission = "R";
    }
    if (old.W != permissions.W) {
      permission = "W";
    }
    let value = permissions[permission];

    if (permission != null) {
      for (let node of this.nodes) {
        for (let indicator of node.indicators) {
          indicator.permissions[user.id][permission] = value;
        }
      }
      this.api.setPillarUserPermission(this.assessmentId, this.pillar.id, user.id, permission, value).subscribe((data) => {
        console.log(data);
      }, (error) => {
        alert("Error!");
      });
    }
  }

  assignedStats(user) {
    let assigned = 0;
    if (this.nodes) {
      for (let node of this.nodes) {
        for (let indicator of node.indicators) {
          if (indicator.permissions[user.id] && 
            (indicator.permissions[user.id].R ||
            indicator.permissions[user.id].W)) {
              assigned++;
          }
        }
      }
    }
    return assigned;
  }

  doneStats(user) {
    let done = 0;
    if (this.nodes) {
      for (let node of this.nodes) {
        for (let indicator of node.indicators) {
          if (indicator.values[user.id]) {
              done++;
          }
        }
      }
    }
    return done;
  }

  displayNewForm(): void {
    this.newUserClick.emit();
  }

  copyLink(user) {
    this.isLoading = user.email;
    this.auth.requestPasswordResetLink(user.email).subscribe((data) => {
      let val = data["link"];

      const selBox = document.createElement('textarea');
      selBox.style.position = 'fixed';
      selBox.style.left = '0';
      selBox.style.top = '0';
      selBox.style.opacity = '0';
      selBox.value = val;
      document.body.appendChild(selBox);
      selBox.focus();
      selBox.select();
      document.execCommand('copy');
      document.body.removeChild(selBox);

      this.isLoading = '';
    });
  }
}