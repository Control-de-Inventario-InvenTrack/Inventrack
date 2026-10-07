import { Storage } from './storage.js';

function inicializar() {
    const productos = Storage.getProductos();
    const select = document.getElementById('select-producto');

    select.innerHTML =
        '<option value="">Seleccione un producto...</option>';

    productos.forEach(p => {
        if (p.stock > 0) {
            const opt = document.createElement('option');

            opt.value = p.id;
            opt.textContent =
                `${p.nombre} - $${p.precio} (Stock: ${p.stock})`;

            select.appendChild(opt);
        }
    });

    cargarHistorialVentas();
}

function cargarHistorialVentas() {
    const ventas = Storage.getVentas();
    const tbody = document.getElementById('tabla-ventas');

    tbody.innerHTML = '';

    ventas.reverse().forEach(v => {
        const tr = document.createElement('tr');

        tr.innerHTML = `
            <td>${new Date(v.fecha).toLocaleString()}</td>
            <td>${v.nombreProducto}</td>
            <td>${v.cantidad}</td>
            <td>$${v.total.toFixed(2)}</td>
        `;

        tbody.appendChild(tr);
    });
}

document.getElementById('form-venta').addEventListener('submit', (e) => {
    e.preventDefault();

    const prodId =
        document.getElementById('select-producto').value;

    const cantidad =
        parseInt(document.getElementById('venta-cantidad').value);

    let productos = Storage.getProductos();

    const prod = productos.find(p => p.id === prodId);

    if (!prod || prod.stock < cantidad) {
        alert('Stock insuficiente para realizar la venta.');
        return;
    }

    prod.stock -= cantidad;

    Storage.guardarProductos(productos);

    Storage.guardarVenta({
        id: Date.now().toString(),
        productoId: prod.id,
        nombreProducto: prod.nombre,
        cantidad: cantidad,
        total: prod.precio * cantidad,
        fecha: new Date().toISOString()
    });

    e.target.reset();

    inicializar();
});

document.addEventListener('DOMContentLoaded', inicializar);