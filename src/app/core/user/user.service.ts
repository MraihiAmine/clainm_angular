import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from 'app/core/user/user.types';
import {
    BehaviorSubject,
    catchError,
    map,
    Observable,
    of,
    ReplaySubject,
    switchMap,
    take,
    tap,
    throwError,
} from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService {
    addUser(updatedUser: any): Observable<any> {
        // Update the user on the server using HTTP PUT
        const apiUrl = `http://localhost:9000/registerNewUser`;

        return this._httpClient.post(apiUrl, updatedUser).pipe(
            catchError((error) => {
                // Handle the error (e.g., log or display a message)
                console.error('Failed to update user on the server:', error);
                return throwError(error);
            })
        );
    }
    private _user: ReplaySubject<User> = new ReplaySubject<User>(1);

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for user
     *
     * @param value
     */
    set user(value: User) {
        // Store the value
        this._user.next(value);
    }

    get user$(): Observable<User> {
        // return this.getUserById(localStorage.getItem('userId'));
        return this._user.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get the current logged in user data
     */
    get(): Observable<User> {
        return this._httpClient.get<User>('api/common/user').pipe(
            tap((user) => {
                this._user.next(user);
            })
        );
    }

    /**
     * Update the user
     *
     * @param user
     */
    update(user: User): Observable<any> {
        return this._httpClient.patch<User>('api/common/user', { user }).pipe(
            map((response) => {
                this._user.next(response);
            })
        );
    }

    private _users: BehaviorSubject<User[] | null> = new BehaviorSubject(null);

    constructor(private _httpClient: HttpClient) {}

    get users$(): Observable<User[]> {
        return this._users.asObservable();
    }

    deleteUser(userId: any): Observable<void> {
        return this._httpClient
            .delete(`http://localhost:3000/users/delete/${userId}`, {
                responseType: 'text',
            })
            .pipe(
                switchMap((response) => {
                    const users = this._users.value; // Get the current users
                    const index = users.findIndex((e) => e.id === userId); // Use a different variable name (e) instead of 'user'

                    if (index !== -1) {
                        users.splice(index, 1); // Remove the deleted user from the array
                        this._users.next([...users]); // Update the users array
                    }
                    return of(undefined); // Return an observable of void
                })
            );
    }

    updateUserWithImage(userId: number, formData: FormData): Observable<any> {
        const endpoint = `http://localhost:3000/users/update/${userId}`;
        return this._httpClient.put(endpoint, formData);
    }

    updateUser(updatedUser: any): Observable<any> {
        // Update the user on the server using HTTP PUT
        const apiUrl = `http://localhost:9000/updateUser`;

        return this._httpClient.put(apiUrl, updatedUser).pipe(
            catchError((error) => {
                // Handle the error (e.g., log or display a message)
                console.error('Failed to update user on the server:', error);
                return throwError(error);
            })
        );
    }

    createUser(userParam = null): Observable<User> {
        // Get the current date as default values
        const currentDate = new Date();

        // Define default values for the user
        const defaultUser: User = userParam ?? {
            username: 'default name to update',
            password: 'default password to update',
            email: 'defaultMailToModify@mail.com',
            role: 'user',
        };

        return this.users$.pipe(
            take(1),
            switchMap((users) =>
                this._httpClient
                    .post<User>('http://localhost:3000/users/add', defaultUser)
                    .pipe(
                        map((addedUser) => {
                            this._users.next([addedUser, ...users]); // Update the users array with the new user at the beginning
                            return addedUser;
                        })
                    )
            )
        );
    }

    getUserById(userId): Observable<User> {
        return this._httpClient
            .get<User>(`http://localhost:3000/users/findById/${userId}`)
            .pipe(
                tap((e) => {
                    console.log('User was retrieved', e);
                    // No need to update the subject here
                })
            );
    }

    getUsers(): Observable<User[]> {
        return this._httpClient.get<User[]>('http://localhost:9000/users').pipe(
            tap((users) => {
                this._users.next(users);
            })
        );
    }
}
