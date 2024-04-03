import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Etablissement } from 'app/modules/admin/dashboards/Etablissement/etablissement.type';

@Injectable({
    providedIn: 'root',
})
export class EtablissementService {
    constructor(private _httpClient: HttpClient) {}

    getEtablissements(): Observable<Etablissement[]> {
        return this._httpClient.get<Etablissement[]>(
            'http://localhost:9000/etablissements/'
        );
    }

    updateEtablissement(etablissement: Etablissement) {
        return this._httpClient.put<Etablissement[]>(
            `http://localhost:9000/etablissements/updateEtablissement/${etablissement.id}`,
            etablissement
        );
    }

    addEtablissement(role: Etablissement) {
        return this._httpClient.post<Etablissement[]>(
            'http://localhost:9000/etablissements/addEtablissement',
            role
        );
    }

    delelte(id: number) {
        const headers = new HttpHeaders().set(
            'Content-Type',
            'text/plain; charset=utf-8'
        );

        return this._httpClient.delete<String>(
            `http://localhost:9000/etablissements/deleteEtablissement/${id}`,
            { headers, responseType: 'text' as 'json' }
        );
    }
}
