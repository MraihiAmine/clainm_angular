import {
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
    FormBuilder,
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Claim } from '../claim.type';
import {
    NgIf,
    NgFor,
    NgTemplateOutlet,
    NgClass,
    AsyncPipe,
    CurrencyPipe,
} from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule, MatRippleModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatDatepickerModule } from '@angular/material/datepicker';

@Component({
    selector: 'app-claim-details',
    templateUrl: './details.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        NgIf,
        MatProgressBarModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        FormsModule,
        MatDatepickerModule,
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
export class ClaimDetails implements OnInit, OnDestroy {
    claimForm: FormGroup;
    isLoading: boolean = true;
    @ViewChild('labelInput') labelInput: ElementRef<HTMLInputElement>;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: Claim,
        public matDialogRef: MatDialogRef<ClaimDetails>,
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: FormBuilder
    ) {}

    ngOnInit(): void {
        this.initForm();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    initForm(): void {
        this.claimForm = this._formBuilder.group({
            id: [this.data?.id || null],
            name: [this.data?.name || '', Validators.required],
            description: [this.data?.description || '', Validators.required],
            dateCreation: [this.data?.dateCreation || '', Validators.required],
            dateUpdate: [this.data?.dateUpdate || null],
            dateClosure: [this.data?.dateClosure || null],
            state: [this.data?.state || '', Validators.required],
            actionEntities: [this.data?.actionEntities || null],
        });
        this.isLoading = false;
        this._changeDetectorRef.markForCheck();
    }

    submitForm(): void {
        if (this.claimForm.valid) {
            this.matDialogRef.close(this.claimForm.value);
        } else {
            // Form is not valid, do something (e.g., show error messages)
        }
    }
}
