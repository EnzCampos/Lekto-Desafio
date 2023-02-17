import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ILoginUser } from '../interfaces/ILoginModel';
import { IUser, IUserPassword } from '../interfaces/IUser';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  baseUrl = "https://localhost:7127/users/";

  constructor(private http: HttpClient) { }

  getUsers() {
    return this.http.get<IUser[]>(this.baseUrl, this.getHttpOptions());
  }

  putUpdateUser(cpf: string,user: IUserPassword) {
    return this.http.put(this.baseUrl + cpf, user, this.getHttpOptions());
  }

  postCreateUser(user: IUserPassword) {
    return this.http.post(this.baseUrl, user, this.getHttpOptions());
  }

  deleteUser(cpf: string) {
    return this.http.delete(this.baseUrl + cpf, this.getHttpOptions());
  }

  getHttpOptions() {
    const userString = localStorage.getItem('user');

    if (!userString) return

    const user : ILoginUser = JSON.parse(userString);

    return {
      headers: new HttpHeaders({
        Authorization: "Bearer " + user.token
      })
    }
  }
}
