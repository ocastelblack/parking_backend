# Parking Backend - Flask

Sistema básico de gestión de parqueadero desarrollado con **Flask + SQLAlchemy**.

## Características
- Registro de ingreso/salida de vehículos
- Cálculo automático del costo
- Descuento ambiental (25% para eléctricos/híbridos)
- Cierre de día con cálculo total
- CRUD completo (listar, actualizar, eliminar)
- Swagger para documentación
- Control global de errores JSON

---

## Requisitos
- Python 3.9+
- pip

---

## Instalación

```bash
git clone https://github.com/ocastelblack/parking_backend
cd parking_backend
pip install -r requirements.txt
python app.py
