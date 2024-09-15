export interface User {
  id: string;
  email: string;
  name: string;
  gymId: string | null;
  currentWorkoutLogId: string | null;
  queueItem: QueueItem | null;
}

export interface Machine {
  id: string;
  name: string;
  type: string;
  location: [number, number, number]; // [floor, x, y]
  currentWorkoutLogId: string | null;
  queueSize: number;
  maximumQueueSize: number;
}

export interface QueueItem {
  id: string;
  userId: string;
  machineId: string;
  timeEnqueued: Date;
  timeReachedFront: Date | null;
  position: number;
}