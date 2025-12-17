import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ApiService } from '../../_services/api.service';

@Component({
    selector: 'true-new-user',
    templateUrl: './new-user.component.html',
    styleUrls: ['./new-user.component.scss'],
    standalone: false
})
export class NewUserComponent implements OnInit {
  public name: string;
  public email: string;
  public error: string;
  public tab: string = 'existing';
  public userId: string;
  
  @Input() users;
  @Output() complete = new EventEmitter();

  constructor(private api: ApiService) { }

  ngOnInit(): void {
    console.log(this.users);
  }

  openTab(tab: string) {
    this.tab = tab;
  }

  addUser(): void {
    if (this.tab == 'new') {
      this.api.createUser(this.name, this.email).subscribe((data) => {
        if (data && data.error) {
          this.error = data.error.message;
        } else {
          this.complete.emit();
        }
      });
    } else {
      if (this.userId != "") {
        this.api.addUser(this.userId).subscribe(() => {
          this.complete.emit();
        });
      }
    }
  }
}
