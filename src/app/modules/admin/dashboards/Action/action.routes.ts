import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { UserService } from 'app/core/user/user.service';
import { RoleService } from 'app/core/role/role.service';
import { ClaimService } from 'app/core/claim/claim.service';
import { ActionComponent } from './action.component';

export default [
    {
        path: '',
        component: ActionComponent,
        resolve: {
            data: () => inject(ClaimService).getClaims(),
        },
    },
] as Routes;
