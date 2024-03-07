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
    take,
    takeUntil,
} from 'rxjs';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';

@Component({
    selector: 'user',
    templateUrl: './users.component.html',
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
export class UserComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;
    selectedFileName: string | undefined;
    users$: Observable<User[]>;

    flashMessage: 'success' | 'error' | null = null;
    isLoading: boolean = false;
    searchInputControl: UntypedFormControl = new UntypedFormControl();
    selectedUser: User | null = null;
    selectedUserForm: UntypedFormGroup;
    tagsEditMode: boolean = false;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    selectedFile: any;
    user: User;
    // In your component class
    roles: string[] = ['pmo', 'user', 'expert', 'admin', 'startupStaff'];

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseConfirmationService: FuseConfirmationService,
        private _formBuilder: UntypedFormBuilder,
        private _userService: UserService,
    ) {}

    findQuestionDescription(questionId: number){
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */

    canDeleteOrDisableSlide() {
        return (
            this.selectedUser.id == 1 || this.selectedUser.id == this.user.id
        );
    }
    ngOnInit(): void {
        // Create the selected user form
        this.selectedUserForm = this._formBuilder.group({
            id: [null], // Use the default ID value (assuming it's a number)
            photo: [''], // Optional field, assuming it's a string
            username: ['', [Validators.required, Validators.minLength(3)]], // Username validation added
            email: ['', [Validators.required, Validators.email]], // Email validation added
            password: [''], // Match the field name with the interface
            evaltypeId: [''],
            startupId: [''],
            role: [''], // Match the field name with the interface
            expertise_field: [''], // Match the field name with the interface
            position: [''], // Match the field name with the interface
            isActive: [false], // Match the field name with the interface, set a default value
        });

        this._userService.user$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((user: User) => {
                this.user = user;
            });

        console.log('hohoho this users is selected', this.users$);

        this.searchInputControl.valueChanges
            .pipe(
                takeUntil(this._unsubscribeAll),
                debounceTime(300),
                switchMap((query) => {
                    this.closeDetails();
                    this.isLoading = true;
                    return this._userService.getUsers();
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

            // Get users if sort or page changes
            merge(this._sort.sortChange, this._paginator.page)
                .pipe(
                    switchMap(() => {
                        this.closeDetails();
                        this.isLoading = true;
                        return this._userService.getUsers();
                    }),
                    map(() => {
                        this.isLoading = false;
                    })
                )
                .subscribe();
        }
    }

    private updateUser(): void {
        const user_elt = this.selectedUserForm.getRawValue();
        const file = this.selectedFile;
        this._userService
            .updateUser(user_elt, file)
            .subscribe((updatedUserRes) => {
                // Update the local state first
                this.users$.pipe(take(1)).subscribe((users) => {
                    const index = users.findIndex(
                        (item) => item.id === updatedUserRes.user.id
                    );

                    if (index !== -1) {
                        users[index] = {
                            ...users[index],
                            ...updatedUserRes.user,
                        };
                    }
                });
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

    onFileSelected(event: any): void {
        const fileInput = event.target;
        if (fileInput.files && fileInput.files.length > 0) {
            this.selectedFileName = fileInput.files[0].name;
            this.selectedFile = fileInput.files[0];
        }
    }

    toggleDetails(userId: any): void {
        // If the user_elt is already selected...
        if (this.selectedUser && this.selectedUser.id === userId) {
            // Close the details
            this.closeDetails();
            return;
        }

        // Get the user_elt by id
        this._userService.getUserById(userId).subscribe((user_elt) => {
            // Set the selected user_elt
            this.selectedUser = user_elt;
            // this.selectedUserForm.setValue(user_elt);
            // Fill the form
            this.selectedUserForm.patchValue(user_elt);
            if (
                this.selectedUser.id == 1 ||
                this.selectedUser.id == this.user.id
            )
                this.selectedUserForm.get('isActive').disable();
            else this.selectedUserForm.get('isActive').enable();

            // Mark for check
            this._changeDetectorRef.markForCheck();
        });
    }

    /**
     * Close the details
     */
    closeDetails(): void {
        this.selectedUser = null;
    }

    createUser(): void {
        // Create the user
        this._userService.createUser().subscribe((newUser) => {
            // Go to new user
            this.selectedUser = newUser;

            // Fill the form
            this.selectedUserForm.patchValue(newUser);

            // Mark for check
            this._changeDetectorRef.markForCheck();
        });
    }

    /**
     * Delete the selected user using the form data
     */

    deleteSelectedUser(): void {
        if (this.selectedUser.id == 1 || this.user.id == this.selectedUser.id) {
            this._fuseConfirmationService.open({
                title: 'Delete actual user is forbidden',
                message: 'You cant delete this user',
            });
        } else {
            const confirmation = this._fuseConfirmationService.open({
                title: 'Delete user',
                message:
                    'Are you sure you want to remove this user_elt? This action cannot be undone!',
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
                    // Get the user_elt object
                    const user_elt = this.selectedUserForm.getRawValue();

                    // Delete the user_elt on the server
                    this._userService.deleteUser(user_elt.id).subscribe(() => {
                        // Close the details
                        this.closeDetails();
                    });
                }
            });
        }
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
