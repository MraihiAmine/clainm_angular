import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Etablissement } from './etablissement.type';
import { EtablissementService } from 'app/core/etablissement/etablissement.service';
import { EtablissementDetails } from './details/details.component';
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
    selector: 'app-etablissement',
    templateUrl: './etablissement.component.html',
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
export class EtablissementComponent implements OnInit, OnDestroy {
    dataSource: MatTableDataSource<Etablissement>;
    displayedColumns: string[] = ['name', 'city', 'actions'];
    @ViewChild(MatPaginator) paginator: MatPaginator;
    private unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private dialog: MatDialog,
        private _etablissementService: EtablissementService
    ) {}

    ngOnInit(): void {
        this.loadEtablissements();
    }

    ngOnDestroy(): void {
        this.unsubscribeAll.next(null);
        this.unsubscribeAll.complete();
    }

    loadEtablissements(): void {
        this._etablissementService
            .getEtablissements()
            .pipe(takeUntil(this.unsubscribeAll))
            .subscribe((etablissements) => {
                this.dataSource = new MatTableDataSource<Etablissement>(
                    etablissements
                );
                this.dataSource.paginator = this.paginator;
            });
    }

    openEtablissementDetails(etablissement: Etablissement | null): void {
        const dialogRef = this.dialog.open(EtablissementDetails, {
            autoFocus: false,
            data: etablissement ? { ...etablissement } : null,
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                if (result.id) {
                    // Update existing etablissement
                    this._etablissementService
                        .updateEtablissement(result)
                        .pipe(takeUntil(this.unsubscribeAll))
                        .subscribe((resultUpdates) => {
                            this.loadEtablissements();
                        });
                } else {
                    // Create new etablissement
                    this._etablissementService
                        .addEtablissement(result)
                        .pipe(takeUntil(this.unsubscribeAll))
                        .subscribe(() => {
                            this.loadEtablissements();
                        });
                }
            }
        });
    }

    deleteEtablissement(etablissement: Etablissement): void {
        const confirmDelete = window.confirm(
            'Are you sure you want to delete this etablissement?'
        );
        if (confirmDelete) {
            this._etablissementService
                .delelte(etablissement.id)
                .pipe(takeUntil(this.unsubscribeAll))
                .subscribe((res) => {
                    this.loadEtablissements();
                });
        }
    }

    applyFilter(filterValue: string) {
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }
}
