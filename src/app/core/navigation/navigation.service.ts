import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Navigation } from 'app/core/navigation/navigation.types';
import { Observable, ReplaySubject, of, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NavigationService {
    private _navigation: ReplaySubject<Navigation> =
        new ReplaySubject<Navigation>(1);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for navigation
     */
    get navigation$(): Observable<Navigation> {
        return this._navigation.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get all navigation data
     */
    /*     get() {
        this._navigation = JSON.parse(localStorage.getItem('navigation'));
        return of(this._navigation);
    } */

    get(): Observable<Navigation> {
        return this._httpClient.get<Navigation>('api/common/navigation').pipe(
            tap((navigation) => {
                const navigationByUserStr = localStorage.getItem('navigation');
                const navigationByUser = JSON.parse(navigationByUserStr);
                let finalNavigation: Navigation = navigationByUser;
                finalNavigation.compact = navigationByUser.compact;
                finalNavigation.default = navigationByUser.defaultItems;
                finalNavigation.futuristic = navigationByUser.futuristic;
                finalNavigation.horizontal = navigationByUser.horizontal;
                this._navigation.next(finalNavigation);
            })
        );
    }
}
