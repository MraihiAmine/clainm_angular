export interface Claim {
    id?: number;
    name: string;
    description: string;
    dateCreation: Date;
    dateUpdate?: Date | null;
    dateClosure?: Date | null;
    state: any;
    year: number;
    actionEntities?: any;
}
