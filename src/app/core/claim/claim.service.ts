import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
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
            `http://localhost:9000/reclamations/updateClaim?id=${claim.id}`,
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
        return this._httpClient.delete<Claim[]>(
            `http://localhost:9000/reclamations/delete?id=${id}`
        );
    }
}
