import { axiosClient } from "./axiosClient";
import type { CrudService } from "../types/crud";
import type { Employee, EmployeePayload } from "../types/user";

export const userService: CrudService<Employee, EmployeePayload, EmployeePayload, string> = {
  getAll: async (options): Promise<Employee[]> => {
    const { data } = await axiosClient.get<Employee[]>("/employees", {
      signal: options?.signal,
    });
    return data;
  },
  create: async (payload: EmployeePayload): Promise<Employee> => {
    const { data } = await axiosClient.post<Employee>("/employees", payload);
    return data;
  },
  update: async (id: string, payload: EmployeePayload): Promise<Employee> => {
    const { data } = await axiosClient.put<Employee>(`/employees/${id}`, payload);
    return data;
  },
  remove: async (id: string): Promise<void> => {
    await axiosClient.delete(`/employees/${id}`);
  },
};
