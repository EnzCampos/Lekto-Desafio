import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { AccountService } from './services/account.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
  loggedIn = false;
  title = 'Angular_Lekto_Desafio';


  constructor(private accountService: AccountService) {
    this.loggedIn = accountService.loggedIn
  }

  ngOnInit() {
    this.setCurrentUser();
  }

  setCurrentUser() {
    const userString = localStorage.getItem('user');

    if (!userString) return

    const user = JSON.parse(userString);

    this.accountService.setCurrentUser(user);

    this.loggedIn = true;
  }

  handleUserLogIn(event: boolean) {
    this.loggedIn = event;
  }
}
