import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { ReclamationComponent } from './claim.component';
import { UserService } from 'app/core/user/user.service';
import { RoleService } from 'app/core/role/role.service';
import { ClaimService } from 'app/core/claim/claim.service';

export default [
    {
        path: '',
        component: ReclamationComponent,
        resolve: {
            data: () => inject(ClaimService).getClaims(),
        },
    },
] as Routes;
