import { Component, OnInit } from '@angular/core';
import { faCalendarPlus } from '@fortawesome/free-solid-svg-icons';
import { faListOl } from '@fortawesome/free-solid-svg-icons';
import { faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { faTools } from '@fortawesome/free-solid-svg-icons';
import { faDoorOpen } from '@fortawesome/free-solid-svg-icons';
import { faSortDown } from '@fortawesome/free-solid-svg-icons';
import {AuthService} from "../../../services/user/auth.service";
import {UserService} from "../../../services/user/user.service";

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {

  isAuth: boolean = false;
  faCalendarPlus = faCalendarPlus;
  faListOl = faListOl;
  faUserPlus = faUserPlus;
  faTools = faTools;
  faDoorOpen = faDoorOpen;
  faSortDown = faSortDown;

  constructor(private auth: AuthService,
              private userService: UserService) { }

  ngOnInit(): void {
    this.auth.isAuth.subscribe(isLogged => this.isAuth = isLogged);
  }

  logout() {
    this.auth.logout();
    this.userService.setCurrentUser();
  }
}
