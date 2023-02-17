import { Component } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, FormArray, Validators } from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd/modal';
import { map } from 'rxjs';
import { IUser, IUserPassword } from '../interfaces/IUser';
import { UsersService } from '../services/users.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent {
  users: any = [];

  isDeleteModalVisible: boolean = false
  isUserFormModalVisible: boolean = false

  userToDelete: string = ''

  userToEdit: IUser = {
    cpf: "",
    name: "",
    email: "",
    phoneNumber: "",
    addresses: []
  }

  loading: boolean = true;

  constructor(private userService: UsersService) {
  }

  ngOnInit(): void {
    this.loadUsers()
  }

  loadUsers() {
    this.userService.getUsers().subscribe({
      next: users => {
        this.users = users
        this.loading = false
      },
      error: error => console.log(error)
    })
  }

  searchValue = '';
  visible = false;
  listOfDisplayData = [...this.users];

  reset(): void {
    this.searchValue = '';
    this.search();
  }

  search(): void {
    this.visible = false;
    this.listOfDisplayData = this.users.filter((item: any) => item.name.indexOf(this.searchValue) !== -1);
  }

  showDeleteModal(cpf: string) {
    this.userToDelete = cpf
    this.isDeleteModalVisible = true
  }

  handleOkDeleteModal(): void {
    this.isDeleteModalVisible = false;

    this.userService.deleteUser(this.userToDelete).subscribe({
      next: () => {
        this.isDeleteModalVisible = false
        this.userToDelete = ''
        window.location.reload();
      },
      error: error => console.log(error)
      });

  }

  handleCancelDeleteModal(): void {
    this.isDeleteModalVisible = false;
    this.userToDelete = ''
  }

  toggleUserFormModal(event: IUser | "Submitted" | undefined) {

    this.isUserFormModalVisible = !this.isUserFormModalVisible

    if (event == "Submitted") {
      this.loadUsers();
    }
    else {
      this.userToEdit = event ? event : {
        cpf: "",
        name: "",
        email: "",
        phoneNumber: "",
        addresses: []
      }
    }
  }

}

