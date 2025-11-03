import { Component, OnInit, Input } from '@angular/core';
import { ApiService } from '../../_services/api.service';

@Component({
    selector: 'true-user-permissions',
    templateUrl: './user-permissions.component.html',
    styleUrls: ['./user-permissions.component.scss'],
    standalone: false
})
export class UserPermissionsComponent implements OnInit {
  @Input() assessmentId;
  @Input() node;
  @Input() indicator;
  @Input() users;

  constructor(private api: ApiService) {
  }

  ngOnInit(): void {
  }

  setUserPermission(user): void {
    this.api.setUserPermission(this.assessmentId, this.indicator.id, user.id, this.indicator.permissions[user.id]).subscribe((ret) => {
      console.log(ret);
    }, (error) => {
      alert("Error!");
    });
  }
}
