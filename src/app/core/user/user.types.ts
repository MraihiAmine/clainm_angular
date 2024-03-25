export interface User {
    aboutMe?: any;
    status?: string;
    id?: number;
    address?: string;
    photo?: string;
    userFirstName?: string;
    userLastName?: string;
    userName?: string;
    username?: string;
    email: string;
    password?: string;
    userPassword?: string;
    role: Role[];
    active?: any;
    isEditMode?: boolean;
}

export interface Role {
    id?: string;
    roleName?: string;
    roleDescription?: string;
}
