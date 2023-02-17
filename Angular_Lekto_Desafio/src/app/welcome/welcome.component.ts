import { Component, Input } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ContactFormComponent } from '../contact-form/contact-form.component';
import { AccountService } from '../services/account.service';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent {

  user: string | undefined;

  constructor(public accountService: AccountService, private modal: NzModalService) { }

  ngOnInit() {
    this.accountService.currentUser$.subscribe((user) => {
      this.user = user?.name
    })
  }

  contactModal() {
    this.modal.create({
      nzTitle: 'Entrar em contato',
      nzContent: ContactFormComponent,
      nzClosable: true,
    });
  }
}
