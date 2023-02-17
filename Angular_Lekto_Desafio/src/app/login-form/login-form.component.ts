import { Component, EventEmitter, Output } from '@angular/core';
import { AppComponent } from '../app.component';
import { ILoginModel } from '../interfaces/ILoginModel';
import { AccountService } from '../services/account.service';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.css']
})

export class LoginFormComponent {
  @Output() userLoggedIn = new EventEmitter();

  loginModel: ILoginModel = {
    password: ""
  }

  loading: boolean = false


  validateForm!: UntypedFormGroup;

  formError: string = ""

  checkedForm: ILoginModel = {
    password: ""
   }

  submitForm(): void {
    if (this.validateForm.valid) {

      const cpfRegex = /^[0-9]{3}[\.]{1}[0-9]{3}[\.]{1}[0-9]{3}[-]{1}[0-9]{2}$/

      const credentials = this.validateForm.value.credentials

      this.checkedForm.password = this.validateForm.value.password

      if (cpfRegex.test(credentials)) {
        this.checkedForm.cpf = credentials
      } else this.checkedForm.email = credentials

      this.login(this.checkedForm)

    } else {
      Object.values(this.validateForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  constructor(private fb: UntypedFormBuilder, private accountService: AccountService, private router: Router) { }

  ngOnInit(): void {
    this.validateForm = this.fb.group({
      credentials: [null, [Validators.required, Validators.pattern(/(^[0-9]{3}[\.]{1}[0-9]{3}[\.]{1}[0-9]{3}[-]{1}[0-9]{2}$)|(^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$)/i)]],
      password: [null, [Validators.required]],
    });
  }

  login(credentials: ILoginModel) {
    this.loading = true
    this.checkedForm = {
      password: ""
    }

    this.accountService.login(credentials).subscribe({
      next: response => {
        this.loading = false
        this.userLoggedIn.emit(true);
        this.router.navigate([''])

      },
      error: error => {
        this.loading = false

        if (error.error == "Usuário inválido.") {
          this.formError = "invalidUser"

        } else if (error.error == "Senha inválida.") {

          this.formError = "invalidPassword"
        }

      }
      })
  }

}
