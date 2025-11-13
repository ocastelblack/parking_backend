# Parking Backend

Este proyecto implementa el backend de un sistema de gestión de parqueadero utilizando Flask y SQLAlchemy.  
Permite el registro, control y cierre diario de ingresos y salidas de vehículos, aplicando reglas de negocio para el cálculo de tarifas, control de cupos y descuentos por tipo de vehículo.

---

## Descripción General

El sistema permite:
- Registrar el ingreso de vehículos con información básica: placa, tipo, hora de entrada y si aplica descuento ambiental.
- Calcular el costo de parqueo en función del tiempo, tipo de vehículo y descuentos aplicables.
- Controlar la capacidad máxima disponible para cada tipo de vehículo.
- Registrar la salida de vehículos y generar el monto a cobrar.
- Calcular el cierre del día para obtener la ganancia total del parqueadero.
- Gestionar actualizaciones y eliminaciones de registros (falsos positivos o correcciones).
- Consultar y probar todos los endpoints mediante documentación Swagger.

---

## Características del Sistema

**Tipos de vehículos admitidos**
- Motocicletas: costo por hora de **62 pesos**.
- Vehículos ligeros: costo por hora de **120 pesos**.

**Descuento ambiental**
- Vehículos eléctricos o híbridos reciben un **25% de descuento** en el costo total.

**Capacidad del parqueadero**
- 6 plazas disponibles para motocicletas.
- 5 plazas disponibles para vehículos ligeros.

**Cierre del día**
- Al finalizar el día se pueden forzar las salidas pendientes y calcular la ganancia total acumulada.

---

## Tecnologías Utilizadas

- Python 3.11+
- Flask
- Flask-SQLAlchemy
- Flasgger (Swagger UI)
- Flask-CORS
- SQLite (por defecto)

---

## Instalación y Ejecución

### 1. Clonar el repositorio
```bash
git clone https://github.com/ocastelblack/parking_backend.git
cd parking_backend

## Crear entorno virtual
python -m venv venv
source venv/bin/activate     # En macOS/Linux
venv\Scripts\activate        # En Windows

## Instalar dependencias
pip install -r requirements.txt

## Configurar el entorno

En el archivo config.py se definen las variables básicas de configuración, incluyendo la conexión a base de datos.
Por defecto utiliza SQLite local (sqlite:///parking.db).

## Iniciar el servidor
flask run
Por defecto el servidor se ejecutará en:
http://127.0.0.1:5000

Documentación Swagger

Una vez en ejecución, la documentación interactiva de la API estará disponible en:

http://127.0.0.1:5000/apidocs

Endpoints Principales
Método	Ruta	Descripción
POST	/vehiculos	Registrar ingreso de un vehículo
GET	/vehiculos	Listar todos los vehículos
PUT	/vehiculos/<id>	Actualizar información de un vehículo
DELETE	/vehiculos/<id>	Eliminar un vehículo (falso positivo)
PUT	/salida/<plate>	Registrar salida y calcular el costo
GET	/ganancias/cierre	Cerrar el día y calcular la ganancia total
POST	/initdata	Crear datos de prueba
Ejemplo de Flujo de Uso

Registrar un nuevo vehículo:

POST /vehiculos
{
  "plate": "XYZ123",
  "type": "carro",
  "is_electric": true
}


Consultar todos los registros:

GET /vehiculos


Registrar la salida de un vehículo:

PUT /salida/XYZ123


Calcular el cierre diario:

GET /ganancias/cierre

Estructura del Proyecto
parking_backend/
├── app.py                # Punto de entrada principal del servidor Flask
├── models.py             # Definición del modelo Vehicle y configuración ORM
├── config.py             # Configuración general de la aplicación
├── utils/
│   └── error_handlers.py # Manejo centralizado de errores HTTP
├── requirements.txt      # Dependencias del proyecto
└── README.md             # Documentación general

Consideraciones Técnicas

Los tiempos de entrada y salida se almacenan como objetos datetime.

El costo se calcula automáticamente al registrar la salida.

Si un vehículo no ha registrado salida al realizar el cierre del día, se fuerza la salida y se calcula el costo correspondiente.

No se permite registrar un vehículo con la misma placa que ya esté dentro del parqueadero.

El sistema valida que no se excedan los cupos disponibles por tipo de vehículo.

Autor

Oscar Castelblanco
Desarrollador Backend
https://github.com/ocastelblack
