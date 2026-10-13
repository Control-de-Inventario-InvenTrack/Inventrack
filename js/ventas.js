import { getProducts, getSales, saveProducts, saveSales } from './storage.js';

let ticket = [];
const productSelect = document.getElementById('selectProd');
const ticketBody = document.getElementById('ticketBody');

document.addEventListener('DOMContentLoaded', () => {
  loadProductSelector();
  renderTicket();
  renderSalesHistory();

  productSelect.addEventListener('change', updateDisplayedPrice);
  document.getElementById('btnAgregar').addEventListener('click', addToTicket);
  document.getElementById('btnVaciar').addEventListener('click', () => {
    ticket = [];
    renderTicket();
  });
  document.getElementById('btnProcesar').addEventListener('click', processSale);
  ticketBody.addEventListener('click', removeFromTicket);
});

function loadProductSelector() {
  const availableProducts = getProducts().filter(product => product.stock > 0);
  productSelect.replaceChildren();

  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = availableProducts.length
    ? 'Seleccionar producto'
    : 'No hay productos disponibles';
  productSelect.append(placeholder);
  productSelect.disabled = availableProducts.length === 0;
  document.getElementById('btnAgregar').disabled = availableProducts.length === 0;
  document.getElementById('ventasAyuda').textContent = availableProducts.length
    ? 'Selecciona un producto y la cantidad que deseas agregar.'
    : 'Registra productos con existencias en el inventario para comenzar.';

  availableProducts.forEach(product => {
    const option = document.createElement('option');
    option.value = product.id;
    option.textContent = `${product.nombre} · ${money(product.precioVenta)} · Stock: ${product.stock}`;
    productSelect.append(option);
  });

  updateDisplayedPrice();
}

function updateDisplayedPrice() {
  const product = getProducts().find(item => item.id === productSelect.value);
  document.getElementById('precioDisp').value = product ? money(product.precioVenta) : 'C$0.00';
}

function addToTicket() {
  const productId = productSelect.value;
  const quantity = Number(document.getElementById('cantInput').value);

  if (!productId || !Number.isInteger(quantity) || quantity <= 0) {
    window.alert('Selecciona un producto e ingresa una cantidad válida.');
    return;
  }

  const product = getProducts().find(item => item.id === productId);
  if (!product) {
    window.alert('El producto seleccionado ya no existe en el inventario.');
    loadProductSelector();
    return;
  }

  const ticketItem = ticket.find(item => item.id === productId);
  const requestedTotal = (ticketItem ? ticketItem.cantidad : 0) + quantity;
  if (requestedTotal > product.stock) {
    window.alert(`Stock insuficiente. Solo hay ${product.stock} unidades disponibles de ${product.nombre}.`);
    return;
  }

  if (ticketItem) {
    ticketItem.cantidad = requestedTotal;
    ticketItem.subtotal = ticketItem.cantidad * ticketItem.precio;
  } else {
    ticket.push({
      id: product.id,
      nombre: product.nombre,
      precio: product.precioVenta,
      cantidad: quantity,
      subtotal: product.precioVenta * quantity
    });
  }

  document.getElementById('cantInput').value = '1';
  renderTicket();
}

function renderTicket() {
  ticketBody.replaceChildren();

  if (ticket.length === 0) {
    const row = document.createElement('tr');
    const message = document.createElement('td');
    message.colSpan = 5;
    message.className = 'empty-state';
    message.textContent = 'El ticket está vacío. Agrega productos para registrar una venta.';
    row.append(message);
    ticketBody.append(row);
  } else {
    ticket.forEach(item => {
      const row = document.createElement('tr');
      [item.nombre, money(item.precio), item.cantidad, money(item.subtotal)].forEach(value => {
        const cell = document.createElement('td');
        cell.textContent = value;
        row.append(cell);
      });
      const actionCell = document.createElement('td');
      const removeButton = document.createElement('button');
      removeButton.type = 'button';
      removeButton.className = 'btn btn-sm btn-danger';
      removeButton.dataset.id = item.id;
      removeButton.textContent = 'Quitar';
      actionCell.append(removeButton);
      row.append(actionCell);
      ticketBody.append(row);
    });
  }

  const total = ticket.reduce((sum, item) => sum + item.subtotal, 0);
  document.getElementById('lblSubtotal').textContent = money(total);
  document.getElementById('lblTotal').textContent = money(total);
  document.getElementById('btnProcesar').disabled = ticket.length === 0;
}

function removeFromTicket(event) {
  const button = event.target.closest('button[data-id]');
  if (!button) return;
  ticket = ticket.filter(item => item.id !== button.dataset.id);
  renderTicket();
}

function processSale() {
  if (ticket.length === 0) {
    window.alert('Agrega al menos un producto antes de procesar la venta.');
    return;
  }

  const products = getProducts();
  for (const item of ticket) {
    const product = products.find(entry => entry.id === item.id);
    if (!product || product.stock < item.cantidad) {
      window.alert(`No hay existencias suficientes de "${item.nombre}". Actualiza el ticket antes de continuar.`);
      loadProductSelector();
      return;
    }
  }

  const total = ticket.reduce((sum, item) => sum + item.subtotal, 0);
  const sale = {
    id: `V-${Date.now().toString().slice(-6)}`,
    fecha: new Date().toISOString(),
    cliente: document.getElementById('selectCliente').value.trim() || 'Cliente general',
    total,
    productos: ticket.map(item => ({
      id: item.id,
      nombre: item.nombre,
      cantidad: item.cantidad,
      precio: item.precio
    }))
  };

  ticket.forEach(item => {
    const product = products.find(entry => entry.id === item.id);
    product.stock -= item.cantidad;
  });

  saveProducts(products);
  saveSales([...getSales(), sale]);
  ticket = [];
  renderTicket();
  loadProductSelector();
  renderSalesHistory();
  window.alert(`Venta registrada por ${money(total)}.`);
}

function renderSalesHistory() {
  const tbody = document.getElementById('tablaHistorial');
  const sales = [...getSales()].reverse().slice(0, 10);
  tbody.replaceChildren();

  if (sales.length === 0) {
    const row = document.createElement('tr');
    const message = document.createElement('td');
    message.colSpan = 5;
    message.className = 'empty-state';
    message.textContent = 'No hay ventas registradas.';
    row.append(message);
    tbody.append(row);
    return;
  }

  sales.forEach(sale => {
    const row = document.createElement('tr');
    const date = new Date(sale.fecha);
    const summary = sale.productos.map(product => `${product.cantidad} × ${product.nombre}`).join(', ');
    [sale.id, Number.isNaN(date.getTime()) ? sale.fecha : date.toLocaleString('es'), sale.cliente, summary, money(Number(sale.total))]
      .forEach(value => {
        const cell = document.createElement('td');
        cell.textContent = value;
        row.append(cell);
      });
    tbody.append(row);
  });
}

function money(amount) {
  return `C$${Number(amount).toFixed(2)}`;
}
