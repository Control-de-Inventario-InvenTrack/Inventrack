import { getProducts, saveProducts } from './storage.js';

const form = document.getElementById('formProducto');
const tbody = document.getElementById('tablaProductos');

document.addEventListener('DOMContentLoaded', () => {
  renderProductosTable();
  form.addEventListener('submit', guardarProducto);
  document.getElementById('buscarInput').addEventListener('input', filtrarTabla);
  document.getElementById('filtroCategoria').addEventListener('change', filtrarTabla);
  document.getElementById('btnNuevo').addEventListener('click', resetFormulario);
  document.getElementById('btnCancelar').addEventListener('click', resetFormulario);
  tbody.addEventListener('click', manejarAccionTabla);
});

function guardarProducto(event) {
  event.preventDefault();

  const id = document.getElementById('prodId').value || Date.now().toString();
  const producto = {
    id,
    codigo: document.getElementById('codigo').value.trim(),
    nombre: document.getElementById('nombre').value.trim(),
    categoria: document.getElementById('categoria').value,
    stock: Number(document.getElementById('stock').value),
    stockMinimo: Number(document.getElementById('stockMinimo').value),
    precioCosto: Number(document.getElementById('precioCosto').value),
    precioVenta: Number(document.getElementById('precioVenta').value),
    vencimiento: document.getElementById('vencimiento').value
  };
  const products = getProducts();
  const codigoDuplicado = products.some(item => item.codigo.toLowerCase() === producto.codigo.toLowerCase() && item.id !== id);

  if (codigoDuplicado) {
    window.alert('Ya existe un producto con ese código.');
    document.getElementById('codigo').focus();
    return;
  }

  const index = products.findIndex(item => item.id === id);
  if (index === -1) {
    products.push(producto);
  } else {
    products[index] = producto;
  }

  saveProducts(products);
  resetFormulario();
  renderProductosTable();
}

function renderProductosTable(lista = getProducts()) {
  tbody.replaceChildren();

  if (lista.length === 0) {
    const row = document.createElement('tr');
    const message = document.createElement('td');
    message.colSpan = 8;
    message.className = 'empty-state';
    message.textContent = getProducts().length === 0
      ? 'No hay productos registrados. Agrega un producto para comenzar.'
      : 'No se encontraron productos con esos filtros.';
    row.append(message);
    tbody.append(row);
    return;
  }

  lista.forEach(product => {
    const row = document.createElement('tr');
    const status = product.stock === 0
      ? ['badge-danger', 'Agotado']
      : product.stock <= product.stockMinimo
        ? ['badge-warning', 'Crítico']
        : ['badge-success', 'Normal'];

    [
      product.codigo,
      product.nombre,
      product.categoria,
      `${product.stock} u.`,
      money(product.precioCosto),
      money(product.precioVenta)
    ].forEach(value => {
      const cell = document.createElement('td');
      cell.textContent = value;
      row.append(cell);
    });

    const statusCell = document.createElement('td');
    const badge = document.createElement('span');
    badge.className = `badge ${status[0]}`;
    badge.textContent = status[1];
    statusCell.append(badge);
    row.append(statusCell);

    const actions = document.createElement('td');
    const editButton = createActionButton('Editar', 'edit', product.id, 'btn btn-sm btn-secondary');
    const deleteButton = createActionButton('Eliminar', 'delete', product.id, 'btn btn-sm btn-danger');
    actions.append(editButton, document.createTextNode(' '), deleteButton);
    row.append(actions);
    tbody.append(row);
  });
}

function createActionButton(label, action, id, className) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  button.dataset.action = action;
  button.dataset.id = id;
  button.textContent = label;
  return button;
}

function manejarAccionTabla(event) {
  const button = event.target.closest('button[data-action]');
  if (!button) return;

  if (button.dataset.action === 'edit') {
    cargarParaEditar(button.dataset.id);
  } else if (button.dataset.action === 'delete') {
    eliminarProducto(button.dataset.id);
  }
}

function cargarParaEditar(id) {
  const product = getProducts().find(item => item.id === id);
  if (!product) return;

  document.getElementById('prodId').value = product.id;
  document.getElementById('codigo').value = product.codigo;
  document.getElementById('nombre').value = product.nombre;
  document.getElementById('categoria').value = product.categoria;
  document.getElementById('stock').value = product.stock;
  document.getElementById('stockMinimo').value = product.stockMinimo;
  document.getElementById('precioCosto').value = product.precioCosto;
  document.getElementById('precioVenta').value = product.precioVenta;
  document.getElementById('vencimiento').value = product.vencimiento || '';
  document.getElementById('formTitle').textContent = '✏️ Editar producto';
  form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function eliminarProducto(id) {
  const product = getProducts().find(item => item.id === id);
  if (!product || !window.confirm(`¿Eliminar "${product.nombre}" del inventario?`)) return;

  saveProducts(getProducts().filter(item => item.id !== id));
  renderProductosTable();
}

function resetFormulario() {
  form.reset();
  document.getElementById('prodId').value = '';
  document.getElementById('formTitle').textContent = '📝 Registro de producto';
}

function filtrarTabla() {
  const search = document.getElementById('buscarInput').value.trim().toLocaleLowerCase();
  const category = document.getElementById('filtroCategoria').value;
  const filtered = getProducts().filter(product => {
    const matchesText = product.nombre.toLocaleLowerCase().includes(search)
      || product.codigo.toLocaleLowerCase().includes(search);
    return matchesText && (!category || product.categoria === category);
  });

  renderProductosTable(filtered);
}

function money(amount) {
  return `C$${Number(amount).toFixed(2)}`;
}
