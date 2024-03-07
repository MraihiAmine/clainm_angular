import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { CriteriaComponent } from './criteria.component';
import { CriteriaService } from './criteria.service';
import { EvalTypeService } from '../EvalType/evalType.service';

export default [
    {
        path: '',
        component: CriteriaComponent,
        resolve: {
            evalTypes: () => inject(EvalTypeService).getEvalTypes(),
            data: () => inject(CriteriaService).getCriterias(),
        },
    },
] as Routes;
