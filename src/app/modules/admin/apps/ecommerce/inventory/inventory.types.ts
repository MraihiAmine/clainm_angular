export interface InventoryProduct {
    id: string;
    category?: string;
    name: string;
    description?: string;
    tags?: string[];
    sku?: string | null;
    barcode?: string | null;
    brand?: string | null;
    vendor: string | null;
    stock: number;
    reserved: number;
    cost: number;
    basePrice: number;
    taxPercent: number;
    price: number;
    weight: number;
    thumbnail: string;
    images: string[];
    active: boolean;
}

export interface InventoryPagination {
    length: number;
    size: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}

export interface InventoryCategory {
    id: string;
    parentId: string;
    name: string;
    slug: string;
}

export interface InventoryBrand {
    id: string;
    name: string;
    slug: string;
}

export interface InventoryTag {
    id?: string;
    title?: string;
}

export interface InventoryVendor {
    id: string;
    name: string;
    slug: string;
}
export interface ProgramResponse {
    id: string;
    label: string;
    description: string;
    start_date: string; // This should be a Date type if you can parse it
    end_date: string; // This should be a Date type if you can parse it
    createdAt: string; // This should be a Date type if you can parse it
    updatedAt: string; // This should be a Date type if you can parse it
    Pmos: PMO[]; // Assuming PMO is another interface
    Startups: Startup[]; // Assuming Startup is another interface
    Experts: Expert[]; // Assuming Expert is another interface
}

export interface PMO {
    id: number;
    name: string;
    email: string;
    telephone: number;
    address: string;
    join_date: string; // This should be a Date type if you can parse it
    last_seen: string; // This should be a Date type if you can parse it
    photo: string | null; // Assuming photo is a URL or null
    createdAt: string | null; // This should be a Date type if you can parse it
    updatedAt: string; // This should be a Date type if you can parse it
    organisation: Organisation; // Assuming Organisation is another interface
}

export interface Organisation {
    id: number;
    createdAt: string; // This should be a Date type if you can parse it
    updatedAt: string; // This should be a Date type if you can parse it
    programId: number;
    pmoId: number;
}

export interface Startup {
    // Define properties for the Startup interface if needed
}

export interface Expert {
    // Define properties for the Expert interface if needed
}
