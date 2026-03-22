import { Reservation } from '../models/Reservation';
import { ReservationStatus } from '../enums';

export class ReservationRepository {
  private reservations: Map<string, Reservation> = new Map();

  public save(reservation: Reservation): void {
    this.reservations.set(reservation.id, reservation);
  }

  public findById(id: string): Reservation | null {
    return this.reservations.get(id) || null;
  }

  public findByReservationNumber(reservationNumber: string): Reservation | null {
    for (const reservation of this.reservations.values()) {
      if (reservation.reservationNumber === reservationNumber) {
        return reservation;
      }
    }
    return null;
  }

  public getReservationsByCustomer(customerId: string): Reservation[] {
    return Array.from(this.reservations.values()).filter(r => r.customerId === customerId);
  }

  public getReservationsByCar(carId: string): Reservation[] {
    return Array.from(this.reservations.values()).filter(r => r.carId === carId);
  }

  public getReservationsByStatus(status: ReservationStatus): Reservation[] {
    return Array.from(this.reservations.values()).filter(r => r.status === status);
  }

  public getAllReservations(): Reservation[] {
    return Array.from(this.reservations.values());
  }

  public getReservationsByDateRange(startDate: Date, endDate: Date): Reservation[] {
    return Array.from(this.reservations.values()).filter(
      r => r.startDate >= startDate && r.endDate <= endDate && r.status !== ReservationStatus.CANCELLED
    );
  }

  public getActiveReservations(): Reservation[] {
    return Array.from(this.reservations.values()).filter(
      r => r.status === ReservationStatus.ACTIVE || r.status === ReservationStatus.CONFIRMED
    );
  }

  public getConflictingReservations(carId: string, startDate: Date, endDate: Date): Reservation[] {
    return Array.from(this.reservations.values()).filter(
      r =>
        r.carId === carId &&
        (r.status === ReservationStatus.CONFIRMED ||
          r.status === ReservationStatus.ACTIVE) &&
        !(r.endDate <= startDate || r.startDate >= endDate)
    );
  }

  public update(reservation: Reservation): void {
    if (this.reservations.has(reservation.id)) {
      this.reservations.set(reservation.id, reservation);
    }
  }

  public delete(reservationId: string): boolean {
    return this.reservations.delete(reservationId);
  }

  public clear(): void {
    this.reservations.clear();
  }
}
