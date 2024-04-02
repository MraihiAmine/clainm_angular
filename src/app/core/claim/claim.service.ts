import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Claim } from 'app/modules/admin/dashboards/Claim/claim.type';

@Injectable({
    providedIn: 'root',
})
export class ClaimService {
    constructor(private _httpClient: HttpClient) {}

    getClaims(): Observable<Claim[]> {
        return this._httpClient.get<Claim[]>(
            'http://localhost:9000/reclamations/'
        );
    }

    updateClaim(claim: Claim) {
        return this._httpClient.put<Claim[]>(
            `http://localhost:9000/reclamations/updateClaim/${claim.id}`,
            claim
        );
    }

    addClaim(role: Claim) {
        return this._httpClient.post<Claim[]>(
            'http://localhost:9000/reclamations/addClaim',
            role
        );
    }

    delelte(id: number) {
        const headers = new HttpHeaders().set(
            'Content-Type',
            'text/plain; charset=utf-8'
        );

        return this._httpClient.delete<String>(
            `http://localhost:9000/reclamations/deleteClaim/${id}`,
            { headers, responseType: 'text' as 'json' }
        );
    }
}
