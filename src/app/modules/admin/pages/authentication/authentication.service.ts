import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, switchMap, take, tap } from 'rxjs';
import { Startup } from '../../dashboards/startup/startup.types';

@Injectable({ providedIn: 'root' })
export class StartupService {
    private _startups: BehaviorSubject<Startup[] | null> = new BehaviorSubject(
        null
    );

    constructor(private _httpClient: HttpClient) {}

    get startups$(): Observable<Startup[]> {
        return this._startups.asObservable();
    }

    deleteStartup(startupId: any): Observable<void> {
        return this._httpClient
            .delete(`http://localhost:3000/startups/delete/${startupId}`, {
                responseType: 'text',
            })
            .pipe(
                take(1),
                map((response) => {
                    const startups = this._startups.value; // Get the current startups
                    const index = startups.findIndex(
                        (startup) => startup.id === startupId
                    );

                    if (index !== -1) {
                        startups.splice(index, 1); // Remove the deleted startup from the array
                        this._startups.next([...startups]); // Update the startups array
                    }
                })
            );
    }

    updateStartup(formData: FormData): Observable<Startup> {
        const headers = new HttpHeaders();
        headers.append('Content-Type', 'multipart/form-data');
        return this._httpClient.put<Startup>(
            `http://localhost:3000/startups/update`,
            formData,
            { headers: headers }
        );
    }

    submitStartupData(formData: FormData): Observable<any> {
        return this._httpClient.post(
            `http://localhost:3000/startups/add`,
            formData
        );
    }
    createStartup(): Observable<Startup> {
        // Get the current date as default values
        const currentDate = new Date().toISOString();

        // Define default values for the startup
        const defaultStartup: Startup = {
            id: 0, // Provide a default value for id_startup
            name: 'Default Startup Name',
            logo: 'Default Logo URL',
            email: 'Default Email',
            telephone: 'Default Telephone',
            address: 'Default Address',
            sector: 'Default Sector',
            product: 'Default Product',
            description: 'Default Description',
            maturity: '',
            Responses: null,
        };

        return this.startups$.pipe(
            take(1),
            switchMap((startups) =>
                this._httpClient
                    .post<Startup>(
                        'http://localhost:3000/startups/add',
                        defaultStartup
                    )
                    .pipe(
                        map((addedStartup) => {
                            this._startups.next([addedStartup, ...startups]); // Update the startups array with the new startup at the beginning
                            return addedStartup;
                        })
                    )
            )
        );
    }

    getStartupById(startupId): Observable<Startup> {
        return this._httpClient
            .get<Startup>(
                `http://localhost:3000/startups/findById/${startupId}`
            )
            .pipe(
                tap((startup) => {
                    console.log('Startup was retrieved', startup);
                    // No need to update the subject here
                })
            );
    }

    getStartups(): Observable<Startup[]> {
        return this._httpClient
            .get<Startup[]>('http://localhost:3000/startups')
            .pipe(
                tap((startups) => {
                    console.log('Startups was called hohoho', startups);

                    this._startups.next(startups);
                })
            );
    }

    getStartupByWithResponses(startupId: any): any {
        return this._httpClient.get<Startup>(
            `http://localhost:3000/startups/getWithResponses/${startupId}`
        );
    }
    getMaturityStatistics(): Observable<any> {
        return this._httpClient.get<Startup>(
            `http://localhost:3000/startups/maturityStatistics`
        );
    }
}
