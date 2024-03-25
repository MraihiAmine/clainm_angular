import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Role } from '../user/user.types';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root',
})
export class RoleService {
    private _role: any;
    constructor(private _httpClient: HttpClient) {}

    get(): Observable<Role> {
        return this._httpClient.get<Role>('api/common/user');
    }

    getRoles(): Observable<Role[]> {
        return this._httpClient.get<Role[]>('http://localhost:9000/roles');
    }

    updateRole(role: Role) {
        return this._httpClient.put<Role[]>(
            'http://localhost:9000/updateRole',
            role
        );
    }

    addRole(role: Role) {
        return this._httpClient.post<Role[]>(
            'http://localhost:9000/addRole',
            role
        );
    }
}
