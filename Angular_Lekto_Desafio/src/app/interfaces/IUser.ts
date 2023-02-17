export interface IUser {
  cpf: string,
  name: string,
  email: string,
  phoneNumber: string,
  addresses: {
    cep: string,
    estado: string,
    cidade: string,
    endereco: string,
  }[]
}

export interface IUserPassword extends IUser {
  password: string,
}
