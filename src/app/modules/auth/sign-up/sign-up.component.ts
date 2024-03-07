import { NgIf } from '@angular/common';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import {
    FormsModule,
    NgForm,
    ReactiveFormsModule,
    UntypedFormBuilder,
    UntypedFormGroup,
    Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOption, MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { Router, RouterLink } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertComponent, FuseAlertType } from '@fuse/components/alert';
import { AuthService } from 'app/core/auth/auth.service';

@Component({
    selector: 'auth-sign-up',
    templateUrl: './sign-up.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
    standalone: true,
    imports: [
        RouterLink,
        NgIf,
        FuseAlertComponent,
        MatSelectModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatOptionModule,
        MatCheckboxModule,
        MatProgressSpinnerModule,
    ],
})
export class AuthSignUpComponent implements OnInit {
    @ViewChild('signUpNgForm') signUpNgForm: NgForm;

    alert: { type: FuseAlertType; message: string } = {
        type: 'success',
        message: '',
    };
    signUpForm: UntypedFormGroup;
    showAlert: boolean = false;

    /**
     * Constructor
     */
    constructor(
        private _authService: AuthService,
        private _formBuilder: UntypedFormBuilder,
        private _router: Router
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Create the form
        this.signUpForm = this._formBuilder.group({
            userName: ['', Validators.required],
            userFirstName: ['', Validators.required],
            userLastName: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            userPassword: ['', Validators.required],
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Sign up
     */
    signUp(): void {
        // Do nothing if the form is invalid
        if (this.signUpForm.invalid) {
            if (this.signUpForm.invalid) {
                // Iterate over the form controls
                for (const controlName in this.signUpForm.controls) {
                    if (this.signUpForm.controls[controlName].invalid) {
                        console.log(`Field '${controlName}' is invalid.`);
                    }
                }
                return;
            }

            return;
        }

        // Disable the form
        this.signUpForm.disable();

        // Hide the alert
        this.showAlert = false;

        // Sign up
        this._authService.signUp(this.signUpForm.value).subscribe(
            (response) => {
                // Navigate to the confirmation required page
                this._router.navigateByUrl('/confirmation-required');
            },
            (errorResponse) => {
                // Re-enable the form
                this.signUpForm.enable();

                // Reset the form
                this.signUpNgForm.resetForm();

                // Check if the error response indicates that the user already exists
                if (
                    errorResponse.error &&
                    errorResponse.error.message ===
                        'User with this email already exists'
                ) {
                    // Set the alert for user existence
                    this.alert = {
                        type: 'error',
                        message:
                            'An account with this email already exists. Please use a different email or try logging in.',
                    };
                } else {
                    // Set the default error message
                    this.alert = {
                        type: 'error',
                        message: 'Something went wrong, please try again.',
                    };
                }

                // Show the alert
                this.showAlert = true;
            }
        );
    }
}
