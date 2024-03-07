import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { UserService } from 'app/core/user/user.service';
import { catchError, Observable, of, switchMap, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private _authenticated: boolean = false;

    /**
     * Constructor
     */
    constructor(
        private _httpClient: HttpClient,
        private _userService: UserService
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for access token
     */
    set accessToken(token: string) {
        localStorage.setItem('accessToken', token);
    }

    get accessToken(): string {
        return localStorage.getItem('accessToken') ?? '';
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Forgot password
     *
     * @param email
     */
    forgotPassword(email: string): Observable<any> {
        return this._httpClient.post('api/auth/forgot-password', email);
    }

    /**
     * Reset password
     *
     * @param password
     */
    resetPassword(password: string): Observable<any> {
        return this._httpClient.post('api/auth/reset-password', password);
    }

    /**
     * Sign in
     *
     * @param credentials
     */
    signIn(credentials: any): Observable<any> {
        // Throw error, if the user is already logged in
        if (this._authenticated) {
            return throwError('User is already logged in.');
        }

        return this._httpClient
            .post('http://localhost:9000/authenticate', credentials)
            .pipe(
                switchMap((response: any) => {
                    // Store the access token in the local storage
                    /* this.accessToken = response.jwtToken;

                    // Set the authenticated flag to true
                    
                    // Store the user on the user service
                    this._userService.user = response.user; */
                    
                    localStorage.setItem('user', JSON.stringify(response.user));
                    localStorage.setItem('navigation', JSON.stringify(response.navigation));
                    
                    // Return a new observable with the response
                    this._authenticated = true;
                    return of(response);
                })
            );
    }

    /**
     * Sign in using the access token
     */
    signInUsingToken(): Observable<any> {
        // Sign in using the token
        return this._httpClient
            .post('http://localhost:3000/users/login-with-token', {
                accessToken: this.accessToken,
            })
            .pipe(
                catchError(() =>
                    // Return false
                    of(false)
                ),
                switchMap((response: any) => {
                    // Replace the access token with the new one if it's available on
                    // the response object.
                    //
                    // This is an added optional step for better security. Once you sign
                    // in using the token, you should generate a new one on the server
                    // side and attach it to the response object. Then the following
                    // piece of code can replace the token with the refreshed one.
                    if (response.accessToken) {
                        this.accessToken = response.accessToken;
                    }

                    // Set the authenticated flag to true
                    this._authenticated = true;

                    // Store the user on the user service
                    this._userService.user = response.user;
                    localStorage.setItem('userId', response.user.id);
                    localStorage.setItem('role', response.user.role);

                    // Return true
                    return of(true);
                })
            );
    }

    /**
     * Sign out
     */
    signOut(): Observable<any> {
        // Remove the access token from the local storage
        localStorage.removeItem('accessToken');

        // Set the authenticated flag to false
        this._authenticated = false;

        // Return the observable
        return of(true);
    }

    updateUserWithImage(userId: number, formData: FormData): Observable<any> {
        const endpoint = `http://localhost:3000/users/update/${userId}`;
        return this._httpClient.put(endpoint, formData);
    }

    addUser(
        userId: number,
        updatedUser: any,
        file: any,
        fileName: any
    ): Observable<any> {
        const updatedUserId = updatedUser.id;

        // Update the user on the server using HTTP PUT
        const apiUrl = `http://localhost:3000/users/update/${updatedUserId}`;
        return this._httpClient.put(apiUrl, updatedUser).pipe(
            switchMap(() => {
                // If an image file is provided, update the user image
                if (file) {
                    const formData = new FormData();
                    formData.append('photo', file, fileName);
                    return this.updateUserWithImage(userId, formData);
                } else {
                    return of(updatedUser);
                }
            }),
            catchError((error) => {
                // Handle the error (e.g., log or display a message)
                console.error('Failed to update user on the server:', error);
                return throwError(error);
            })
        );
    }

    /**
     * Sign up
     *
     * @param user
     */
    signUp(user: any): Observable<any> {
        return this._httpClient.post(
            'http://localhost:9000/registerNewUser',
            user
        );
    }

    /**
     * Unlock session
     *
     * @param credentials
     */
    unlockSession(credentials: {
        email: string;
        password: string;
    }): Observable<any> {
        return this._httpClient.post('api/auth/unlock-session', credentials);
    }

    /**
     * Check the authentication status
     */
    check(): Observable<boolean> {
        // Check if the user is logged in
        if (this._authenticated) {
            return of(true);
        }

        // Check the access token availability
        if (!this.accessToken) {
            return of(false);
        }

        // Check the access token expire date
        if (AuthUtils.isTokenExpired(this.accessToken)) {
            return of(false);
        }

        // If the access token exists, and it didn't expire, sign in using it
        return this.signInUsingToken();
    }
}
