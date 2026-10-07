import { Storage } from './storage.js';

function cargarTabla() {
    const productos = Storage.getProductos();
    const tbody = document.getElementById('tabla-productos');

    tbody.innerHTML = '';

    productos.forEach(p => {
        const tr = document.createElement('tr');

        tr.innerHTML = `
            <td>${p.sku}</td>
            <td>${p.nombre}</td>
            <td>$${Number(p.precio).toFixed(2)}</td>
            <td>
                <span class="badge ${p.stock <= 5 ? 'bg-danger' : 'bg-success'}">
                    ${p.stock}
                </span>
            </td>
            <td>
                <button class="btn btn-danger" onclick="eliminar('${p.id}')">
                    Eliminar
                </button>
            </td>
        `;

        tbody.appendChild(tr);
    });
}

document.getElementById('form-producto').addEventListener('submit', (e) => {
    e.preventDefault();

    const productos = Storage.getProductos();

    const nuevo = {
        id: Date.now().toString(),
        sku: document.getElementById('prod-sku').value,
        nombre: document.getElementById('prod-nombre').value,
        precio: parseFloat(document.getElementById('prod-precio').value),
        stock: parseInt(document.getElementById('prod-stock').value)
    };

    productos.push(nuevo);

    Storage.guardarProductos(productos);

    e.target.reset();

    cargarTabla();
});

window.eliminar = (id) => {
    let productos = Storage.getProductos()
        .filter(p => p.id !== id);

    Storage.guardarProductos(productos);

    cargarTabla();
};

document.addEventListener('DOMContentLoaded', cargarTabla);