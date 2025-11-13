from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Vehicle(db.Model):
    __tablename__ = 'vehicles'

    id = db.Column(db.Integer, primary_key=True)
    plate = db.Column(db.String(10), unique=True, nullable=False)
    type = db.Column(db.String(20), nullable=False)  # moto / carro
    is_electric = db.Column(db.Boolean, default=False)
    entry_time = db.Column(db.DateTime, default=datetime.now)
    exit_time = db.Column(db.DateTime, nullable=True)
    slot = db.Column(db.Integer, nullable=False)
    cost = db.Column(db.Float, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "plate": self.plate,
            "type": self.type,
            "is_electric": self.is_electric,
            "entry_time": self.entry_time.isoformat() if self.entry_time else None,
            "exit_time": self.exit_time.isoformat() if self.exit_time else None,
            "slot": self.slot,
            "cost": self.cost
        }