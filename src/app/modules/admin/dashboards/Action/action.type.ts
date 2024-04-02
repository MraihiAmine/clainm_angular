import { Claim } from '../Claim/claim.type';

export interface Action {
    id?: number;
    actionName: string;
    description: string;
    dateCreation: Date;
    dateUpdate?: Date | null;
    dateClosure?: Date | null;
    state: any; // You need to specify the type for state
    year: number;
    reclamationEntity?: Claim; // Assuming ReclamationEntity interface exists
}
