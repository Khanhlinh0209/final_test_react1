export type Employee = {
  id: string;
  fullName: string;
  department: string;
  gender: string;
};

export type EmployeePayload = Omit<Employee, "id">;
