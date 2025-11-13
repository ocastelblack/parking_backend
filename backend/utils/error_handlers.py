from flask import jsonify
from sqlalchemy.exc import IntegrityError

def register_error_handlers(app):
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({"error": "Recurso no encontrado"}), 404

    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({"error": "Petición inválida"}), 400

    @app.errorhandler(IntegrityError)
    def integrity_error(error):
        return jsonify({"error": "Violación de integridad de datos"}), 400

    @app.errorhandler(Exception)
    def internal_error(error):
        return jsonify({
            "error": "Error interno del servidor",
            "detalle": str(error)
        }), 500
