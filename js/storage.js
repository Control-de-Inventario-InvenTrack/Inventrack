const STORAGE_KEYS = {
    PRODUCTOS: 'inventario_productos',
    VENTAS: 'inventario_ventas'
};

export const Storage = {
    getProductos: () => {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTOS)) || [];
    },

    guardarProductos: (productos) => {
        localStorage.setItem(STORAGE_KEYS.PRODUCTOS, JSON.stringify(productos));
    },

    getVentas: () => {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.VENTAS)) || [];
    },
    
    guardarVenta: (venta) => {
        const ventas = this.getVentas();
        ventas.push(venta);
        localStorage.setItem(STORAGE_KEYS.VENTAS, JSON.stringify(ventas));
    }
};
