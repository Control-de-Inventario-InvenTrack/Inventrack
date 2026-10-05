import { Storage } from './storage.js';

document.addEventListener('DOMContentLoaded', () => { 
    const productos = Storage.getProductos(); 
    const ventas = Storage.getVentas(); 

    const totalProductos = productos.length;
    const valorInventario = productos.reduce((acc, p) => acc + (p.precio * p.stock), 0);
    const totalVentas = ventas.reduce((acc, v) => acc + v.total, 0);
    const stockCritico = productos.filter(p => p.stock <= 5).length;
    
    document.getElementById('kpi-total-productos').textContent = totalProductos;
    document.getElementById('kpi-valor-inventario').textContent = `$${valorInventario.toFixed(2)}`;
    document.getElementById('kpi-total-ventas').textContent = `$${totalVentas.toFixed(2)}`;
    document.getElementById('kpi-stock-critico').textContent = stockCritico;
});
