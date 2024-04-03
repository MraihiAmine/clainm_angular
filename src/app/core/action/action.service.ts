import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Action } from 'app/modules/admin/dashboards/Action/action.type';

@Injectable({
    providedIn: 'root',
})
export class ActionService {
    constructor(private _httpClient: HttpClient) {}

    getActions(): Observable<Action[]> {
        return this._httpClient.get<Action[]>(
            'http://localhost:9000/actions/'
        );
    }

    updateAction(action: Action) {
        return this._httpClient.put<Action[]>(
            `http://localhost:9000/actions/updateAction/${action.id}`,
            action
        );
    }

    addAction(role: Action) {
        return this._httpClient.post<Action[]>(
            'http://localhost:9000/actions/addAction',
            role
        );
    }

    delelte(id: number) {
        const headers = new HttpHeaders().set(
            'Content-Type',
            'text/plain; charset=utf-8'
        );

        return this._httpClient.delete<String>(
            `http://localhost:9000/actions/deleteAction/${id}`,
            { headers, responseType: 'text' as 'json' }
        );
    }
}
