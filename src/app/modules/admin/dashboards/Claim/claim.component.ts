import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Claim } from './claim.type';
import { ClaimService } from 'app/core/claim/claim.service';
import { ClaimDetails } from './details/details.component';
import {
    NgIf,
    NgFor,
    NgTemplateOutlet,
    NgClass,
    AsyncPipe,
    CurrencyPipe,
} from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule, MatRippleModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSortModule } from '@angular/material/sort';

@Component({
    selector: 'app-reclamation',
    templateUrl: './claim.component.html',
    standalone: true,
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
export class ReclamationComponent implements OnInit, OnDestroy {
    dataSource: MatTableDataSource<Claim>;
    displayedColumns: string[] = ['name', 'description', 'state', 'actions'];
    @ViewChild(MatPaginator) paginator: MatPaginator;
    private unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private dialog: MatDialog,
        private _claimService: ClaimService
    ) {}

    ngOnInit(): void {
        this.loadReclamations();
    }

    ngOnDestroy(): void {
        this.unsubscribeAll.next(null);
        this.unsubscribeAll.complete();
    }

    loadReclamations(): void {
        this._claimService
            .getClaims()
            .pipe(takeUntil(this.unsubscribeAll))
            .subscribe((reclamations) => {
                this.dataSource = new MatTableDataSource<Claim>(reclamations);
                this.dataSource.paginator = this.paginator;
            });
    }

    openReclamationDetails(reclamation: Claim | null): void {
        const dialogRef = this.dialog.open(ClaimDetails, {
            autoFocus: false,
            data: reclamation ? { ...reclamation } : null,
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                if (result.id) {
                    // Update existing reclamation
                    this._claimService
                        .updateClaim(result)
                        .pipe(takeUntil(this.unsubscribeAll))
                        .subscribe(() => {
                            this.loadReclamations();
                        });
                } else {
                    // Create new reclamation
                    this._claimService
                        .addClaim(result)
                        .pipe(takeUntil(this.unsubscribeAll))
                        .subscribe(() => {
                            this.loadReclamations();
                        });
                }
            }
        });
    }

    deleteReclamation(reclamation: Claim): void {
        const confirmDelete = window.confirm(
            'Are you sure you want to delete this reclamation?'
        );
        if (confirmDelete) {
            this._claimService
                .delelte(reclamation.id)
                .pipe(takeUntil(this.unsubscribeAll))
                .subscribe(() => {
                    this.loadReclamations();
                });
        }
    }

    applyFilter(filterValue: string) {
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }
}
