import uuid

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select, update
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import User, Vehicle
from app.schemas.vehicle import VehicleCreate, VehicleResponse, VehicleUpdate


router = APIRouter(prefix="/vehicles", tags=["Vehicles"])


def owned_vehicle_or_404(db: Session, user_id: uuid.UUID, vehicle_id: uuid.UUID) -> Vehicle:
    vehicle = db.scalar(select(Vehicle).where(Vehicle.id == vehicle_id, Vehicle.user_id == user_id))
    if not vehicle:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found")
    return vehicle


def clear_default(db: Session, user_id: uuid.UUID, except_id: uuid.UUID | None = None) -> None:
    statement = update(Vehicle).where(Vehicle.user_id == user_id, Vehicle.is_default.is_(True))
    if except_id:
        statement = statement.where(Vehicle.id != except_id)
    db.execute(statement.values(is_default=False))


@router.get("", response_model=list[VehicleResponse])
def list_vehicles(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[Vehicle]:
    return list(db.scalars(select(Vehicle).where(Vehicle.user_id == current_user.id).order_by(Vehicle.is_default.desc(), Vehicle.created_at)))


@router.post("", response_model=VehicleResponse, status_code=status.HTTP_201_CREATED)
def create_vehicle(payload: VehicleCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> Vehicle:
    has_vehicle = db.scalar(select(Vehicle.id).where(Vehicle.user_id == current_user.id).limit(1)) is not None
    values = payload.model_dump()
    values["is_default"] = payload.is_default or not has_vehicle
    if values["is_default"]:
        clear_default(db, current_user.id)
    vehicle = Vehicle(user_id=current_user.id, **values)
    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)
    return vehicle


@router.get("/{vehicle_id}", response_model=VehicleResponse)
def get_vehicle(vehicle_id: uuid.UUID, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> Vehicle:
    return owned_vehicle_or_404(db, current_user.id, vehicle_id)


@router.patch("/{vehicle_id}", response_model=VehicleResponse)
def update_vehicle(payload: VehicleUpdate, vehicle_id: uuid.UUID, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> Vehicle:
    vehicle = owned_vehicle_or_404(db, current_user.id, vehicle_id)
    values = payload.model_dump(exclude_unset=True)
    if values.get("is_default"):
        clear_default(db, current_user.id, vehicle.id)
    for field, value in values.items():
        setattr(vehicle, field, value)
    db.commit()
    db.refresh(vehicle)
    return vehicle


@router.patch("/{vehicle_id}/default", response_model=VehicleResponse)
def set_default_vehicle(vehicle_id: uuid.UUID, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> Vehicle:
    vehicle = owned_vehicle_or_404(db, current_user.id, vehicle_id)
    clear_default(db, current_user.id, vehicle.id)
    vehicle.is_default = True
    db.commit()
    db.refresh(vehicle)
    return vehicle


@router.delete("/{vehicle_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_vehicle(vehicle_id: uuid.UUID, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> Response:
    vehicle = owned_vehicle_or_404(db, current_user.id, vehicle_id)
    was_default = vehicle.is_default
    db.delete(vehicle)
    db.flush()
    if was_default:
        replacement = db.scalar(select(Vehicle).where(Vehicle.user_id == current_user.id).order_by(Vehicle.created_at).limit(1))
        if replacement:
            replacement.is_default = True
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
