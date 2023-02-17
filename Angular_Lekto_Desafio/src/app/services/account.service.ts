import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ILoginModel, ILoginUser } from '../interfaces/ILoginModel';
import { BehaviorSubject, map, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class AccountService {
  baseUrl = "https://localhost:7127/users/";

  loggedIn: boolean = false;

  private loggedInObserver: Subject<boolean> = new Subject<boolean>();

  private currentUserSource = new BehaviorSubject<ILoginUser | null>(null);

  currentUser$ = this.currentUserSource.asObservable();

  constructor(private http: HttpClient) {
    this.loggedInObserver.subscribe((value) => {
      this.loggedIn = value
    });
  }

  login(model: ILoginModel) {
    return this.http.post<ILoginUser>(this.baseUrl + "login", model).pipe(
      map((response: ILoginUser) => {
        const user = response;

        if (user) {
          localStorage.setItem('user', JSON.stringify(user))
          this.loggedInObserver.next(true)
          this.currentUserSource.next(user);
        }
      })
    )
  }

  setCurrentUser(user: ILoginUser) {
    this.currentUserSource.next(user);
  }

  logout() {
    localStorage.removeItem('user');
    this.loggedInObserver.next(false);
    this.currentUserSource.next(null);
  }
}
