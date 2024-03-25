import { TextFieldModule } from '@angular/cdk/text-field';
import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Inject,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import {
    FormArray,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    UntypedFormBuilder,
    UntypedFormGroup,
    Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
    MatCheckboxChange,
    MatCheckboxModule,
} from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { FuseValidators } from '@fuse/validators';
import { Role } from 'app/core/user/user.types';
import {
    Board,
    Card,
    Label,
} from 'app/modules/admin/apps/scrumboard/scrumboard.models';
import { ScrumboardService } from 'app/modules/admin/apps/scrumboard/scrumboard.service';
import { assign } from 'lodash-es';
import { DateTime } from 'luxon';
import { debounceTime, Subject, takeUntil, tap } from 'rxjs';

@Component({
    selector: 'scrumboard-card-details',
    templateUrl: './details.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        MatButtonModule,
        MatIconModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        TextFieldModule,
        NgClass,
        NgIf,
        MatDatepickerModule,
        NgFor,
        MatCheckboxModule,
        DatePipe,
    ],
})
export class DetailsComponent implements OnInit, OnDestroy {
    rolesForm: FormGroup;
    isLoading: boolean = true;
    togglePasswordVisibility(): void {
        this.hidePassword = !this.hidePassword;
    }
    @ViewChild('labelInput') labelInput: ElementRef<HTMLInputElement>;
    board: Board;
    card: Card;
    cardForm: UntypedFormGroup;
    labels: Label[];
    filteredLabels: Label[];

    // Private
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    userForm: UntypedFormGroup;
    hidePassword: any;

    /**
     * Constructor
     */
    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        public matDialogRef: MatDialogRef<DetailsComponent>,
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: UntypedFormBuilder
    ) {
        this.isLoading = true;
        this.rolesForm = this._formBuilder.group({
          roleDescription: [data?.roleDescription || '', Validators.required],
        });

        if (data.addRole) {
            this.rolesForm.addControl(
                'roleName',
                this._formBuilder.control('', Validators.required)
            );
        }

        this.isLoading = false;

        this._changeDetectorRef.markForCheck();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------
    /**
     * On init
     */
    ngOnInit(): void {
        // Get the card details
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Check if the given date is overdue
     */
    isOverdue(date: string): boolean {
        return (
            DateTime.fromISO(date).startOf('day') <
            DateTime.now().startOf('day')
        );
    }

    submitForm(): void {
        if (this.rolesForm.valid) {
            this.matDialogRef.close(this.rolesForm.value);

            // Handle form submission
        } else {
            // Form is not valid, do something (e.g., show error messages)
        }
    }
}
