import {
    AsyncPipe,
    CurrencyPipe,
    NgClass,
    NgFor,
    NgIf,
    NgTemplateOutlet,
} from '@angular/common';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import {
    FormsModule,
    ReactiveFormsModule,
    UntypedFormBuilder,
    UntypedFormControl,
    UntypedFormGroup,
    Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
    MatCheckboxChange,
    MatCheckboxModule,
} from '@angular/material/checkbox';
import { MatOptionModule, MatRippleModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import {
    debounceTime,
    map,
    merge,
    Observable,
    Subject,
    switchMap,
    takeUntil,
} from 'rxjs';
import { CriteriaService } from './criteria.service';
import { Criteria } from './criteria.types';
import { EvalTypeService } from '../EvalType/evalType.service';
import { EvalType } from '../EvalType/evalType.types';

@Component({
    selector: 'criteria',
    templateUrl: './criteria.component.html',
    styles: [
        /* language=SCSS */
        `
            .inventory-grid {
                display: grid;
                grid-template-columns: repeat(
                    auto-fill,
                    minmax(100%, 1fr)
                ); /* Updated */
                gap: 1rem;

                @media (min-width: 640px) {
                    grid-template-columns: repeat(
                        auto-fill,
                        minmax(150px, 1fr)
                    );
                }

                @media (min-width: 768px) {
                    grid-template-columns: repeat(
                        auto-fill,
                        minmax(300px, 1fr)
                    );
                }
            }
        `,
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: fuseAnimations,
    standalone: true,
    imports: [
        NgIf,
        MatProgressBarModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatSortModule,
        NgFor,
        NgTemplateOutlet,
        MatPaginatorModule,
        NgClass,
        MatSlideToggleModule,
        MatSelectModule,
        MatOptionModule,
        MatCheckboxModule,
        MatRippleModule,
        AsyncPipe,
        CurrencyPipe,
    ],
})
export class CriteriaComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;

    criterias$: Observable<Criteria[]>;

    flashMessage: 'success' | 'error' | null = null;
    isLoading: boolean = false;
    searchInputControl: UntypedFormControl = new UntypedFormControl();
    selectedCriteria: Criteria | null = null;
    selectedCriteriaForm: UntypedFormGroup;
    tagsEditMode: boolean = false;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    evalTypes: EvalType[];

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseConfirmationService: FuseConfirmationService,
        private _formBuilder: UntypedFormBuilder,
        private _evalTypeService: EvalTypeService,
        private _criteriaService: CriteriaService
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Create the selected criteria form
        this.selectedCriteriaForm = this._formBuilder.group({
            id: [''], // Assuming this is a hidden field or for reference
            description: [''],
            evaltypeId: [''],
            label: [''],
            percentage: [''],
        });
        this.criterias$ = this._criteriaService.criterias$;

        this._evalTypeService.evalTypes$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((evalTypes: EvalType[]) => {
                this.evalTypes = evalTypes;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        this.searchInputControl.valueChanges
            .pipe(
                takeUntil(this._unsubscribeAll),
                debounceTime(300),
                switchMap((query) => {
                    this.closeDetails();
                    this.isLoading = true;
                    return this._criteriaService.getCriterias();
                }),
                map(() => {
                    this.isLoading = false;
                })
            )
            .subscribe();
    }

    /**
     * After view init
     */
    ngAfterViewInit(): void {
        if (this._sort && this._paginator) {
            // Set the initial sort
            this._sort.sort({
                id: 'name',
                start: 'asc',
                disableClear: true,
            });

            // Mark for check
            this._changeDetectorRef.markForCheck();

            // If the user changes the sort order...
            this._sort.sortChange
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe(() => {
                    // Reset back to the first page
                    this._paginator.pageIndex = 0;

                    // Close the details
                    this.closeDetails();
                });

            // Get criterias if sort or page changes
            merge(this._sort.sortChange, this._paginator.page)
                .pipe(
                    switchMap(() => {
                        this.closeDetails();
                        this.isLoading = true;
                        return this._criteriaService.getCriterias();
                    }),
                    map(() => {
                        this.isLoading = false;
                    })
                )
                .subscribe();
        }
    }

    updateSelectedCriteria(): void {
        // Get the criteria_elt object
        const criteria_elt = this.selectedCriteriaForm.getRawValue();
        console.log('raw values of the criteria_elt:', criteria_elt);
        // Remove the currentImageIndex field

        // Update the criteria_elt on the server
        this._criteriaService
            .updateCriteria(criteria_elt.id, criteria_elt)
            .subscribe(() => {
                // Show a success message
                this.showFlashMessage('success');
            });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    toggleDetails(criteriaId: number): void {
        // If the criteria_elt is already selected...
        if (this.selectedCriteria && this.selectedCriteria.id === criteriaId) {
            // Close the details
            this.closeDetails();
            return;
        }

        // Get the criteria_elt by id
        this._criteriaService
            .getCriteriaById(criteriaId)
            .subscribe((criteria_elt) => {
                // Set the selected criteria_elt
                this.selectedCriteria = criteria_elt;

                // Fill the form
                this.selectedCriteriaForm.patchValue(criteria_elt);

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    /**
     * Close the details
     */
    closeDetails(): void {
        this.selectedCriteria = null;
    }

    createCriteria(): void {
        // Create the criteria
        this._criteriaService.createCriteria().subscribe((newCriteria) => {
            // Go to new criteria
            this.selectedCriteria = newCriteria;

            // Fill the form
            this.selectedCriteriaForm.patchValue(newCriteria);

            // Mark for check
            this._changeDetectorRef.markForCheck();
        });
    }

    /**
     * Delete the selected criteria using the form data
     */

    deleteSelectedCriteria(): void {
        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title: 'Delete criteria_elt',
            message:
                'Are you sure you want to remove this criteria_elt? This action cannot be undone!',
            actions: {
                confirm: {
                    label: 'Delete',
                },
            },
        });

        // Subscribe to the confirmation dialog closed action
        confirmation.afterClosed().subscribe((result) => {
            // If the confirm button pressed...
            if (result === 'confirmed') {
                // Get the criteria_elt object
                const criteria_elt = this.selectedCriteriaForm.getRawValue();

                // Delete the criteria_elt on the server
                this._criteriaService
                    .deleteCriteria(criteria_elt.id)
                    .subscribe(() => {
                        // Close the details
                        this.closeDetails();
                    });
            }
        });
    }

    /**
     * Show flash message
     */
    showFlashMessage(type: 'success' | 'error'): void {
        // Show the message
        this.flashMessage = type;

        // Mark for check
        this._changeDetectorRef.markForCheck();

        // Hide it after 3 seconds
        setTimeout(() => {
            this.flashMessage = null;

            // Mark for check
            this._changeDetectorRef.markForCheck();
        }, 3000);
    }

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
