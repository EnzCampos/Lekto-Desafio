import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators, FormArray, UntypedFormControl, ValidatorFn, FormGroup, ValidationErrors, AbstractControl } from '@angular/forms';
import { IUser } from '../../interfaces/IUser';
import { UsersService } from '../../services/users.service';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.css']
})
export class UserFormComponent {
  @Input() initialUser!: IUser;
  @Input() isModalVisible: boolean = false;

  @Output() toggleModal = new EventEmitter();

  nameRegex: RegExp = /^[a-záàâãéèêíïóôõöúçñ ]+$/i
  phoneRegex: RegExp = /^\(?[1-9]{2}\)? ?(?:[2-8]|9[1-9])[0-9]{3}\-?[0-9]{4}$/
  cpfRegex: RegExp = /^[0-9]{3}[\.]{1}[0-9]{3}[\.]{1}[0-9]{3}[-]{1}[0-9]{2}$/
  passwordRegex: RegExp = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[#$@!%&*?]).{4,}/
  cepRegex: RegExp = /[0-9]{5}-?[0-9]{3}/

  isEdit: boolean = false;

  formErrors: any = {
    cpf: "",
    email: "",
  }

  loading: boolean = false;

  constructor(private userService: UsersService, private fb: UntypedFormBuilder) {

    const cepRegex = /[0-9]{5}-?[0-9]{3}/

    this.validateForm = this.fb.group({

      name: ['', [Validators.required, Validators.pattern(this.nameRegex)]],
      cpf: ['', [Validators.required, Validators.pattern(this.cpfRegex), this.cpfValidator()]],
      email: ['', [Validators.email, Validators.required]],
      phoneNumber: ['', [Validators.required, Validators.pattern(this.phoneRegex)]],
      password: ['', [Validators.required, Validators.pattern(this.passwordRegex)]],

      addresses: this.fb.array([
        this.fb.group({
          cep: ['', [Validators.required, Validators.minLength(9), Validators.maxLength(9), Validators.pattern(cepRegex)]],
          estado: ['', [Validators.required]],
          cidade: ['', [Validators.required]],
          endereco: ['', [Validators.required]],
        }),
      ], [this.uniqueAdressesValidator()]),
    });
  }

  ngOnInit() {

    if (this.initialUser.cpf) {
      this.isEdit = true

      this.validateForm.get('cpf')?.setValue(this.initialUser.cpf)
      this.validateForm.get('name')?.setValue(this.initialUser.name)
      this.validateForm.get('email')?.setValue(this.initialUser.email)
      this.validateForm.get('phoneNumber')?.setValue(this.initialUser.phoneNumber)

      this.validateForm.get('password')?.setValidators([Validators.pattern(this.passwordRegex)])

      this.addressForm.clear();
      let addresses = this.initialUser.addresses;

      for (let i = 0; i < addresses.length; i++) {
        this.addressForm.push(this.fb.group({
          cep: [addresses[i].cep, [Validators.required, Validators.minLength(9), Validators.maxLength(9), Validators.pattern(this.cepRegex)]],
          estado: [addresses[i].estado, [Validators.required]],
          cidade: [addresses[i].cidade, [Validators.required]],
          endereco: [addresses[i].endereco, [Validators.required]],
        }))
      }

      this.validateForm.markAsPristine();
    }
  }

  get addressForm() {
    return this.validateForm.get('addresses') as FormArray
  }

  addNewAddress() {
    this.addressForm.push(this.fb.group({
      cep: ['', [Validators.required, Validators.minLength(9), Validators.maxLength(9), Validators.pattern(this.cepRegex)]],
      estado: ['', [Validators.required]],
      cidade: ['', [Validators.required]],
      endereco: ['', [Validators.required]],
    }))
    console.log(this.addressForm.errors)
  }

  removeAddressField(i: number) {
    this.addressForm.removeAt(i);
    this.validateForm.markAsDirty();
  }

  closeModal(event: any) {
    this.toggleModal.emit(event);
  }

  validateForm: UntypedFormGroup;

  formatPhoneNumber(phone: string) {
    let phoneFormatted = phone.replaceAll(/[ ]|[-]|[()]/g, "")

    let ddd = phoneFormatted.slice(0, 2)
    let firstNumbers = phoneFormatted.slice(2, 7)
    let secondNumbers = phoneFormatted.slice(7)

    return `(${ddd}) ${firstNumbers}-${secondNumbers}`
  }

  uniqueAdressesValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: string } | null => {
      for (let i = 0; i < control.value.length; i++) {
        for (let j = 1; j < control.value.length; j++) {
          if (JSON.stringify(control.value[i]) == JSON.stringify(control.value[j]) && j != i) {
            return {
              hasDuplicateAddress: `Endereços: ${i + 1} e ${j + 1} são iguais` }
          }
        }
      }
      return null
    }
  }

  cpfValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {

      if (control.value.length < 13) return null

      const cpf = control.value.toString().replaceAll(".", "").split("-");

      let digits = cpf[0];
      let validationNumbers = cpf[1];

      let firstDigitValidationSum = 0;
      let secondDigitValidationSum = 0;

      for (let i = 0; i < 9; i++) {
        firstDigitValidationSum += parseInt(digits[i]) * (10 - i);
      }

      for (let i = 0; i < 10; i++) {
        if (i == 9) {
          secondDigitValidationSum += parseInt(validationNumbers[0]) * 2;
        }

        else secondDigitValidationSum += parseInt(digits[i]) * (11 - i);
      }

      let firstDigitValidation = firstDigitValidationSum % 11;
      let secondDigitValidation = secondDigitValidationSum % 11;

      let firstValidation = (firstDigitValidation > 2 ? 11 - firstDigitValidation : 0) == parseInt(validationNumbers[0]);

      let secondValidation = (secondDigitValidation > 2 ? 11 - secondDigitValidation : 0) == parseInt(validationNumbers[1]);

      return firstValidation && secondValidation ? null : { invalidCpf: true };
    }
  }

  submitForm(): void {

    this.loading = true

    const userPayload = this.validateForm.value

    userPayload.phoneNumber = this.formatPhoneNumber(userPayload.phoneNumber)

    if (this.isEdit) {
      this.userService.putUpdateUser(this.initialUser.cpf, userPayload).subscribe({
        next: () => {
          this.loading = false
          this.closeModal('Submitted');
          window.location.reload();
        },
        error: error => {
          if (error.status == 404) {
            this.validateForm.controls?.['cpf'].setErrors({ cpf: "Usúario não encontrado." })
          }
          else if (error.status == 400) {
            console.log(error)
            if (error.error == "Usuário com este Email, já existe.") {
              this.validateForm.controls?.['email'].setErrors({ alreadyTaken: "Este e-mail está sendo usado por outro usuário." })
            }
            if (error.error == "Usuário com este CPF, já existe.") {
              this.validateForm.controls?.['cpf'].setErrors({ alreadyTaken: "Este CPF está sendo usado por outro usuário." })
            }
          }
          else console.log(error)
        }
      });

    } else this.userService.postCreateUser(userPayload).subscribe(
      {
        next: () => {
          this.loading = false
          this.closeModal('Submitted');
          window.location.reload();
        },
        error: error => {
          if (error.status == 404) {
            this.validateForm.controls?.['cpf'].setErrors({ cpf: "Usúario não encontrado." })
          }
          else if (error.status == 400) {
            if (error.error == "Usuário com este Email, já existe.") {
              this.validateForm.controls?.['email'].setErrors({ alreadyTaken: "Este e-mail está sendo usado por outro usuário." })
            }
            if (error.error == "Usuário com este CPF, já existe.") {
              this.validateForm.controls?.['cpf'].setErrors({ alreadyTaken: "Este CPF está sendo usado por outro usuário." })
            }
          }
          else console.log(error)
        }
      });
  }
}
