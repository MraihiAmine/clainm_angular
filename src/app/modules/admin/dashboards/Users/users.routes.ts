import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { UserComponent } from './users.component';
import { UserService } from 'app/core/user/user.service';

export default [
    {
        path: '',
        component: UserComponent,
        resolve: {
            data: () => inject(UserService).getUsers(),
        },
    },
] as Routes;
