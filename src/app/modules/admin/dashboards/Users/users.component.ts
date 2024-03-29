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
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
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
import { Role, User } from 'app/core/user/user.types';
import { MatDialog } from '@angular/material/dialog';
import { UserDetails } from './details/details.component';
import { RoleService } from 'app/core/role/role.service';
import _ from 'lodash';

@Component({
    selector: 'user',
    templateUrl: './users.component.html',
    styles: [
        /* language=SCSS */
        `
            .add-button-container {
                display: flex;
                justify-content: flex-end;
                margin-top: 10px; /* adjust margin-top as needed */
                margin-right: 10px; /* adjust margin-right to move the button to the right */
            }
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
        MatTableModule,
        MatSlideToggleModule,
        MatSelectModule,
        MatOptionModule,
        MatCheckboxModule,
        MatRippleModule,
        AsyncPipe,
        CurrencyPipe,
    ],
})
export class UserComponent implements OnInit, OnDestroy {
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;
    selectedFileName: string | undefined;
    users$: Observable<User[]>;

    dataSource: MatTableDataSource<any>;
    displayedColumns: string[] = [
        'userName',
        'userFirstName',
        'userLastName',
        'actions',
    ];

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

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
    roles: Role[];

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseConfirmationService: FuseConfirmationService,
        private _formBuilder: UntypedFormBuilder,
        private _matDialog: MatDialog,
        private _userService: UserService,
        private _roleService: RoleService
    ) {
        this._userService.getUsers().subscribe((users) => {
            this.dataSource = new MatTableDataSource(users);
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */

    ngOnInit(): void {
        this._roleService.getRoles().subscribe((roles) => {
            this.roles = roles;
        });
    }

    openModal(user: User) {
        const dataToSend = {
            userFirstName: user.userFirstName,
            userLastName: user.userLastName,
            email: user.email,
            active: user.active,
            userRoles: user.role,
            roles: this.roles,
        };

        this._matDialog
            .open(UserDetails, {
                autoFocus: false,
                data: dataToSend,
            })
            .afterClosed()
            .subscribe((res: User) => {
                if (res) {
                    const userRolesTmp = this.roles.filter(
                        (elt) => res[elt.roleName]
                    );
                    user.role = userRolesTmp;

                    user.active = +res.active;
                    user.email = res.email;
                    user.userFirstName = res.userFirstName;
                    user.userLastName = res.userLastName;

                    this._userService
                        .updateUser(user)
                        .subscribe((updatedRes) => {
                            this.dataSource = new MatTableDataSource(
                                updatedRes
                            );
                            this.dataSource.paginator = this.paginator;
                            this.dataSource.sort = this.sort;
                        });
                }
            });
    }

    addUser() {
        let dataToSend = {
            roles: this.roles,
            addUser: true,
        };
        this._matDialog
            .open(UserDetails, {
                autoFocus: false,
                data: dataToSend,
            })
            .afterClosed()
            .subscribe((res: User) => {
                if (res) {
                    const userRolesTmp = this.roles.filter(
                        (elt) => res[elt.roleName]
                    );

                    let user: User = {
                        role: userRolesTmp,
                        userName: res.userName,
                        active: +res.active,
                        email: res.email,
                        userPassword: res.password,
                        userFirstName: res.userFirstName,
                        userLastName: res.userLastName,
                    };

                    this._userService.addUser(user).subscribe((updatedRes) => {
                        this.dataSource = new MatTableDataSource(updatedRes);
                        this.dataSource.paginator = this.paginator;
                        this.dataSource.sort = this.sort;
                    });
                }
            });
    }

    editUser(user: any) {
        // Implement edit functionality here
        console.log('Edit user:', user);
        this.openModal(user);
    }

    deleteUser(user: any) {
        // Implement delete functionality here
        console.log('Delete user:', user);
    }

    applyFilter(filterValue: string) {
        this.dataSource.filter = filterValue.trim().toLowerCase();
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
