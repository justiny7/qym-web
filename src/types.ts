export interface User {
  id: string;
  email: string;
  name: string;
  gymId: string | null;
  currentWorkoutLogId: string | null;
}

export interface Machine {
  id: string;
  name: string;
  type: string;
  location: [number, number, number]; // [floor, x, y]
  currentWorkoutLogId: string | null;
}
