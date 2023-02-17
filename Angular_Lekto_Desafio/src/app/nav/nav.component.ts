import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ContactFormComponent } from '../contact-form/contact-form.component';
import { AccountService } from '../services/account.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent {
  loggedIn: boolean = false

  constructor(private accountService: AccountService, private router: Router, private modal: NzModalService) { }

  ngOnInit() {
    this.getCurrentUser();
  }

  getCurrentUser() {
    this.accountService.currentUser$.subscribe({
      next: user => this.loggedIn = !!user,
      error: error => console.log(error)
      })
  }

  logout() {
    this.accountService.logout();
    this.router.navigate([''])
  }

  contactModal() {
    this.modal.create({
      nzTitle: 'Entrar em contato',
      nzContent: ContactFormComponent,
      nzClosable: true,
    });
  }
}
