# Inventrack — Sistema de control de inventario y ventas

Aplicación web responsiva para administrar productos, existencias y ventas. Los datos se guardan en el almacenamiento local del navegador.

## Uso local

1. Abre la carpeta del proyecto en VS Code.
2. Inicia un servidor local, por ejemplo, con la extensión Live Server.
3. Abre `index.html` desde ese servidor. Se requiere un servidor local porque la aplicación carga módulos JavaScript.

## Áreas del sistema

- **Análisis:** indicadores, gráficos de ventas y categorías, y alertas de stock.
- **Inventario:** registro, edición, búsqueda, filtrado y eliminación de productos.
- **Ventas:** carrito, validación de existencias, descuento automático del stock e historial.

La aplicación inicia sin productos ni ventas de ejemplo. Las áreas muestran estados vacíos hasta que se agreguen productos o se registren ventas. Los datos que se ingresen se conservan en el navegador utilizado.