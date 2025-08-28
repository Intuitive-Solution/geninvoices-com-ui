export interface Employee {
  id: string;
  name: string;
  emp_id: string;
  department: string;
  designation: string;
  email: string;
  is_deleted: boolean;
  archived_at: number | null; // Updated to support EntityState - null when active, timestamp when archived
  user_id: string;
  created_at: number;
  updated_at: number;
}

export interface EmployeeFormData {
  name: string;
  emp_id: string;
  department: string;
  designation: string;
  email: string;
}