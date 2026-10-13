import { getProducts, getSales } from './storage.js';

document.addEventListener('DOMContentLoaded', () => {
  const products = getProducts();
  const sales = getSales();
  const criticalProducts = products.filter(product => product.stock <= product.stockMinimo);
  const totalSales = sales.reduce((sum, sale) => sum + Number(sale.total), 0);
  const estimatedMargin = products.reduce(
    (sum, product) => sum + ((Number(product.precioVenta) - Number(product.precioCosto)) * Number(product.stock)),
    0
  );

  document.getElementById('kpiTotalProds').textContent = products.length;
  document.getElementById('kpiStockBajo').textContent = criticalProducts.length;
  document.getElementById('kpiTotalVentas').textContent = money(totalSales);
  document.getElementById('kpiMargen').textContent = money(estimatedMargin);

  renderUrgentProducts(criticalProducts);
  renderChart({
    canvasId: 'chartVentas',
    emptyId: 'chartVentasEmpty',
    labels: getSalesLabels(sales),
    values: getSalesValues(sales),
    type: 'bar',
    colors: '#2563eb',
    emptyMessage: 'Aún no hay ventas para mostrar.'
  });

  const categoryCounts = new Map();
  products.forEach(product => {
    categoryCounts.set(product.categoria, (categoryCounts.get(product.categoria) || 0) + 1);
  });
  renderChart({
    canvasId: 'chartCategorias',
    emptyId: 'chartCategoriasEmpty',
    labels: [...categoryCounts.keys()],
    values: [...categoryCounts.values()],
    type: 'doughnut',
    colors: ['#2563eb', '#16a34a', '#d97706', '#dc2626', '#38bdf8', '#8b5cf6'],
    emptyMessage: 'Aún no hay productos para mostrar.'
  });
});

function getSalesLabels(sales) {
  const quantities = new Map();
  sales.forEach(sale => {
    sale.productos.forEach(product => {
      quantities.set(product.nombre, (quantities.get(product.nombre) || 0) + Number(product.cantidad));
    });
  });
  return [...quantities.keys()];
}

function getSalesValues(sales) {
  const quantities = new Map();
  sales.forEach(sale => {
    sale.productos.forEach(product => {
      quantities.set(product.nombre, (quantities.get(product.nombre) || 0) + Number(product.cantidad));
    });
  });
  return [...quantities.values()];
}

function renderChart({ canvasId, emptyId, labels, values, type, colors, emptyMessage }) {
  const canvas = document.getElementById(canvasId);
  const emptyState = document.getElementById(emptyId);

  if (labels.length === 0) {
    canvas.hidden = true;
    emptyState.textContent = emptyMessage;
    emptyState.hidden = false;
    return;
  }

  if (!window.Chart) {
    emptyState.textContent = 'No se pudo cargar la biblioteca de gráficos. Verifica tu conexión a internet.';
    emptyState.hidden = false;
    console.error('Chart.js no está disponible; no se pudieron mostrar los gráficos del dashboard.');
    return;
  }

  new window.Chart(canvas, {
    type,
    data: {
      labels,
      datasets: [{
        label: type === 'bar' ? 'Unidades vendidas' : 'Productos',
        data: values,
        backgroundColor: colors,
        borderRadius: type === 'bar' ? 4 : undefined
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: type !== 'bar' } },
      scales: type === 'bar' ? { y: { beginAtZero: true, ticks: { precision: 0 } } } : undefined
    }
  });
}

function renderUrgentProducts(products) {
  const tbody = document.getElementById('tablaUrgentes');
  tbody.replaceChildren();

  if (products.length === 0) {
    const row = document.createElement('tr');
    const message = document.createElement('td');
    message.colSpan = 6;
    message.className = 'empty-state';
    message.textContent = 'No hay productos registrados para analizar.';
    row.append(message);
    tbody.append(row);
    return;
  }

  products.forEach(product => {
    const row = document.createElement('tr');
    [product.codigo, product.nombre, product.categoria, `${product.stock} u.`, `${product.stockMinimo} u.`]
      .forEach(value => {
        const cell = document.createElement('td');
        cell.textContent = value;
        row.append(cell);
      });

    const statusCell = document.createElement('td');
    const badge = document.createElement('span');
    badge.className = `badge ${product.stock === 0 ? 'badge-danger' : 'badge-warning'}`;
    badge.textContent = product.stock === 0 ? 'Agotado' : 'Crítico';
    statusCell.append(badge);
    row.append(statusCell);
    tbody.append(row);
  });
}

function money(amount) {
  return `C$${amount.toFixed(2)}`;
}
