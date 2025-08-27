export interface Employee {
  id: string;
  name: string;
  emp_id: string;
  department: string;
  designation: string;
  email: string;
  status: 'active' | 'inactive';
  is_deleted: boolean;
  user_id: string;
  created_at: number;
  updated_at: number;
  archived_at: number;
}

export interface EmployeeFormData {
  name: string;
  emp_id: string;
  department: string;
  designation: string;
  email: string;
  status: 'active' | 'inactive';
}