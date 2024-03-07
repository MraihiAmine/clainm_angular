import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
    BehaviorSubject,
    map,
    Observable,
    of,
    switchMap,
    take,
    tap,
} from 'rxjs';
import { Criteria } from './criteria.types';

@Injectable({ providedIn: 'root' })
export class CriteriaService {
    private _criterias: BehaviorSubject<Criteria[] | null> =
        new BehaviorSubject(null);

    constructor(private _httpClient: HttpClient) {}

    get criterias$(): Observable<Criteria[]> {
        return this._criterias.asObservable();
    }

    deleteCriteria(criteriaId: number): Observable<void> {
        return this._httpClient
            .delete(`http://localhost:3000/criterias/delete/${criteriaId}`, {
                responseType: 'text',
            })
            .pipe(
                switchMap((response) => {
                    const criterias = this._criterias.value; // Get the current criterias
                    const index = criterias.findIndex(
                        (e) => e.id === criteriaId
                    ); // Use a different variable name (e) instead of 'criteria'

                    if (index !== -1) {
                        criterias.splice(index, 1); // Remove the deleted criteria from the array
                        this._criterias.next([...criterias]); // Update the criterias array
                    }
                    return of(undefined); // Return an observable of void
                })
            );
    }

    updateCriteria(
        criteriaId: string,
        updatedCriteria: Criteria
    ): Observable<Criteria> {
        const updatedCriteriaId = updatedCriteria.id;

        // Ensure that criterias$ emits the array of criterias directly
        return this.criterias$.pipe(
            take(1),
            map((criterias) => {
                console.log('updated in map', updatedCriteria);
                const index = criterias.findIndex(
                    (item) => item.id === updatedCriteriaId
                );

                console.log('hohoho', index);

                if (index !== -1) {
                    criterias[index] = updatedCriteria;
                    console.log('updated', updatedCriteria);
                    console.log('criterias', criterias);

                    // Update the criteriauation session on the server using HTTP PUT
                    const apiUrl = `http://localhost:3000/criterias/update/${updatedCriteriaId}`;
                    this._httpClient
                        .put(apiUrl, updatedCriteria)
                        .subscribe((response) => {
                            console.log('Updated on server', response);
                        });

                    this._criterias.next([...criterias]); // Use spread operator to create a new array to trigger change detection
                }
                return updatedCriteria;
            })
        );
    }

    createCriteria(): Observable<Criteria> {
        // Get the current date as default values
        const currentDate = new Date();

        // Define default values for the criteria
        const defaultCriteria: Criteria = {
            id: null,
            label: 'Default Criteria label',
            description: 'Default Criteria description',
            questions: null,
            percentage: 0,
        };

        return this.criterias$.pipe(
            take(1),
            switchMap((criterias) =>
                this._httpClient
                    .post<Criteria>(
                        'http://localhost:3000/criterias/add',
                        defaultCriteria
                    )
                    .pipe(
                        map((addedCriteria) => {
                            this._criterias.next([addedCriteria, ...criterias]); // Update the criterias array with the new criteria at the beginning
                            return addedCriteria;
                        })
                    )
            )
        );
    }

    getCriteriaById(criteriaId): Observable<Criteria> {
        return this._httpClient
            .get<Criteria>(
                `http://localhost:3000/criterias/findById/${criteriaId}`
            )
            .pipe(
                tap((e) => {
                    console.log('Criteria was retrieved', e);
                    // No need to update the subject here
                })
            );
    }
    getCriteriaByEvaltypeId(evaltypeId: number): Observable<Criteria[]> {
        return this._httpClient
            .get<Criteria[]>(
                `http://localhost:3000/criterias/findByEvaltypeId/${evaltypeId}`
            )
            .pipe(
                tap((criteria: Criteria[]) => {
                    console.log('Criteria was retrieved', criteria);
                    // If you want to update a subject, emit the criteria array here
                })
            );
    }

    getCriterias(): Observable<Criteria[]> {
        return this._httpClient
            .get<Criteria[]>('http://localhost:3000/criterias')
            .pipe(
                tap((criterias) => {
                    console.log('Criterias was called hohoho', criterias);

                    this._criterias.next(criterias);
                })
            );
    }
}
