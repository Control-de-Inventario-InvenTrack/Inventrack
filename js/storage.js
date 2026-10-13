const STORAGE_KEYS = {
  PRODUCTS: 'inventrack_productos_v2',
  SALES: 'inventrack_ventas_v2'
};

function readCollection(key) {
  const stored = localStorage.getItem(key);

  if (stored === null) {
    localStorage.setItem(key, '[]');
    return [];
  }

  const collection = JSON.parse(stored);
  if (!Array.isArray(collection)) {
    throw new TypeError(`Los datos guardados en "${key}" no tienen un formato válido.`);
  }

  return collection;
}

export function getProducts() {
  return readCollection(STORAGE_KEYS.PRODUCTS);
}

export function saveProducts(products) {
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
}

export function getSales() {
  return readCollection(STORAGE_KEYS.SALES);
}

export function saveSales(sales) {
  localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
}
