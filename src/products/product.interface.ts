export interface Product {
    name : String,
    price : number,
    quantity : number;
    image : string;
}

export interface UnitProduct extends Product {
    id : string
}

export interface Products{
    [key : string] : UnitProduct
}