/**
 * SeatLockManager.ts
 * Manages seat locks to prevent double booking in concurrent scenarios.
 * Singleton pattern ensures centralized lock management.
 */

interface SeatLock {
  seatId: string;
  flightId: string;
  bookingId: string;
  lockedAt: Date;
  expiresAt: Date;
}

export class SeatLockManager {
  private static instance: SeatLockManager;
  private locks: Map<string, SeatLock> = new Map(); // key: seatId:flightId
  private readonly LOCK_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

  private constructor() {
    this.startCleanupJob();
  }

  public static getInstance(): SeatLockManager {
    if (!SeatLockManager.instance) {
      SeatLockManager.instance = new SeatLockManager();
    }
    return SeatLockManager.instance;
  }

  public tryLock(seatId: string, flightId: string, bookingId: string): boolean {
    const lockKey = this.getLockKey(seatId, flightId);
    const existing = this.locks.get(lockKey);

    if (existing) {
      if (new Date() > existing.expiresAt) {
        this.locks.delete(lockKey);
      } else {
        console.log(`[LOCK] Seat ${seatId} on flight ${flightId} is locked by booking ${existing.bookingId}`);
        return false;
      }
    }

    const now = new Date();
    this.locks.set(lockKey, {
      seatId,
      flightId,
      bookingId,
      lockedAt: now,
      expiresAt: new Date(now.getTime() + this.LOCK_TIMEOUT_MS)
    });
    console.log(`[LOCK] ✓ Acquired lock on seat ${seatId} for flight ${flightId}`);
    return true;
  }

  public releaseLock(seatId: string, flightId: string, bookingId: string): boolean {
    const lockKey = this.getLockKey(seatId, flightId);
    const lock = this.locks.get(lockKey);
    if (!lock || lock.bookingId !== bookingId) return false;
    this.locks.delete(lockKey);
    console.log(`[LOCK] ✓ Released lock on seat ${seatId} for flight ${flightId}`);
    return true;
  }

  public isLocked(seatId: string, flightId: string): boolean {
    const lockKey = this.getLockKey(seatId, flightId);
    const lock = this.locks.get(lockKey);
    if (!lock) return false;
    if (new Date() > lock.expiresAt) {
      this.locks.delete(lockKey);
      return false;
    }
    return true;
  }

  public releaseAllLocksForBooking(bookingId: string): number {
    let count = 0;
    for (const [key, lock] of this.locks.entries()) {
      if (lock.bookingId === bookingId) {
        this.locks.delete(key);
        count++;
      }
    }
    if (count > 0) console.log(`[LOCK] ✓ Released ${count} lock(s) for booking ${bookingId}`);
    return count;
  }

  public getActiveLockCount(): number {
    this.cleanupExpiredLocks();
    return this.locks.size;
  }

  public clearAllLocks(): void {
    this.locks.clear();
  }

  private getLockKey(seatId: string, flightId: string): string {
    return `${seatId}:${flightId}`;
  }

  private cleanupExpiredLocks(): void {
    const now = new Date();
    for (const [key, lock] of this.locks.entries()) {
      if (now > lock.expiresAt) this.locks.delete(key);
    }
  }

  private startCleanupJob(): void {
    setInterval(() => this.cleanupExpiredLocks(), 60000);
  }
}
