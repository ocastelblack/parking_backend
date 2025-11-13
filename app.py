from flask import Flask, request, jsonify
from datetime import datetime, timedelta
from flasgger import Swagger
from sqlalchemy.exc import IntegrityError
from models import db, Vehicle
from config import Config
from utils.error_handlers import register_error_handlers

app = Flask(__name__)
app.config.from_object(Config)
db.init_app(app)
swagger = Swagger(app)
register_error_handlers(app)  #Control global de errores


# ---- Constantes ----
RATE_MOTO = 62
RATE_CAR = 120
DISCOUNT = 0.25
SLOTS = {"moto": 6, "carro": 5}


# ---- Funciones auxiliares ----
def calcular_costo(vehiculo):
    salida = vehiculo.exit_time or datetime.now()
    horas = (salida - vehiculo.entry_time).total_seconds() / 3600
    tarifa = RATE_MOTO if vehiculo.type == 'moto' else RATE_CAR
    total = horas * tarifa
    if vehiculo.is_electric:
        total *= (1 - DISCOUNT)
    return round(total, 2)


# ---- Endpoints ----

@app.route('/vehiculos', methods=['POST'])
def ingresar_vehiculo():
    """
    Registrar ingreso de un vehículo
    ---
    tags:
      - Vehículos
    """
    data = request.get_json()
    tipo = data.get('type')
    if tipo not in ['moto', 'carro']:
        return jsonify({"error": "Tipo inválido. Usa 'moto' o 'carro'"}), 400

    plate = data.get('plate', '').upper()

    # Evitar duplicados activos
    existente = Vehicle.query.filter_by(plate=plate, exit_time=None).first()
    if existente:
        return jsonify({
            "error": f"El vehículo con placa {plate} ya está dentro del parqueadero."
        }), 400

    ocupados = Vehicle.query.filter_by(type=tipo, exit_time=None).count()
    if ocupados >= SLOTS[tipo]:
        return jsonify({"error": "No hay cupos disponibles"}), 400

    nuevo = Vehicle(
        plate=plate,
        type=tipo,
        is_electric=data.get('is_electric', False),
        slot=ocupados + 1
    )

    try:
        db.session.add(nuevo)
        db.session.commit()
        return jsonify(nuevo.to_dict()), 201
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": f"La placa {plate} ya existe en el sistema."}), 400


@app.route('/vehiculos', methods=['GET'])
def listar_vehiculos():
    """
    Listar todos los vehículos registrados
    ---
    tags:
      - Vehículos
    responses:
      200:
        description: Lista de vehículos
    """
    vehiculos = Vehicle.query.all()
    return jsonify([v.to_dict() for v in vehiculos])


@app.route('/vehiculos/<int:id>', methods=['PUT'])
def actualizar_vehiculo(id):
    """
    Actualizar información de un vehículo
    ---
    tags:
      - Vehículos
    parameters:
      - name: id
        in: path
        type: integer
        required: true
      - name: body
        in: body
        required: true
        schema:
          type: object
          properties:
            plate: {type: string}
            type: {type: string}
            is_electric: {type: boolean}
            entry_time: {type: string}
            exit_time: {type: string}
            slot: {type: integer}
    responses:
      200:
        description: Vehículo actualizado
    """
    vehiculo = Vehicle.query.get_or_404(id)
    data = request.get_json()

    for campo in ['plate', 'type', 'is_electric', 'entry_time', 'exit_time', 'slot']:
        if campo in data:
            setattr(vehiculo, campo, data[campo])

    if vehiculo.exit_time:
        vehiculo.cost = calcular_costo(vehiculo)

    db.session.commit()
    return jsonify(vehiculo.to_dict())


@app.route('/vehiculos/<int:id>', methods=['DELETE'])
def eliminar_vehiculo(id):
    """
    Eliminar un vehículo (falso positivo)
    ---
    tags:
      - Vehículos
    parameters:
      - name: id
        in: path
        type: integer
        required: true
    responses:
      200:
        description: Vehículo eliminado
    """
    vehiculo = Vehicle.query.get_or_404(id)
    db.session.delete(vehiculo)
    db.session.commit()
    return jsonify({"msg": "Vehículo eliminado"}), 200


@app.route('/salida/<plate>', methods=['PUT'])
def salida_vehiculo(plate):
    """
    Registrar la salida de un vehículo
    ---
    tags:
      - Vehículos
    parameters:
      - name: plate
        in: path
        type: string
        required: true
    responses:
      200:
        description: Vehículo actualizado con costo
      404:
        description: No encontrado
    """
    vehiculo = Vehicle.query.filter_by(plate=plate.upper(), exit_time=None).first()
    if not vehiculo:
        return jsonify({"error": "Vehículo no encontrado o ya salió"}), 404

    vehiculo.exit_time = datetime.now()
    vehiculo.cost = calcular_costo(vehiculo)
    db.session.commit()
    return jsonify(vehiculo.to_dict())


@app.route('/ganancias/cierre', methods=['GET'])
def cierre_dia():
    """
    Cerrar el día y calcular ganancias totales
    ---
    tags:
      - Reportes
    responses:
      200:
        description: Total de ganancias del día
    """
    total = 0
    vehiculos = Vehicle.query.all()
    for v in vehiculos:
        if not v.exit_time:
            v.exit_time = datetime.now()
            v.cost = calcular_costo(v)
        total += v.cost or 0
    db.session.commit()
    return jsonify({
        "mensaje": "Cierre de día completado",
        "ganancia_total": round(total, 2)
    })


@app.route('/initdata', methods=['POST'])
def inicializar_datos():
    """
    Crear datos de prueba
    ---
    tags:
      - Utilidades
    responses:
      200:
        description: Datos de prueba creados
    """
    db.drop_all()
    db.create_all()

    now = datetime.now()

    demo = [
        Vehicle(plate="AAA111", type="moto", is_electric=False,
                entry_time=now - timedelta(hours=2), exit_time=now, slot=1),
        Vehicle(plate="BBB222", type="moto", is_electric=True,
                entry_time=now - timedelta(hours=3), exit_time=now, slot=2),
        Vehicle(plate="CCC333", type="carro", is_electric=False,
                entry_time=now - timedelta(hours=5), exit_time=None, slot=1),
        Vehicle(plate="DDD444", type="carro", is_electric=True,
                entry_time=now - timedelta(hours=1), exit_time=None, slot=2),
    ]

    for v in demo:
        v.cost = calcular_costo(v)
        db.session.add(v)

    db.session.commit()
    return jsonify({"msg": "Datos de prueba insertados", "count": len(demo)})


# ---- Inicialización ----
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
