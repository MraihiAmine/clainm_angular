import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { UserService } from 'app/core/user/user.service';
import { RoleService } from 'app/core/role/role.service';
import { RolesComponent } from './roles.component';

export default [
    {
        path: '',
        component: RolesComponent,
        resolve: {
            data: () => inject(UserService).getUsers(),
            roles: () => inject(RoleService).getRoles(),
        },
    },
] as Routes;
