import { useState, type SubmitEvent } from "react";
import { useAuth } from "../hooks/useAuth";
import { useEmployee } from "../hooks/useEmployee";

export function EmployeesPage() {
  const { isAuthenticated } = useAuth();
  const {
    employees,
    loading,
    mutating,
    error,
    createEmployee,
    updateEmployee,
    deleteEmployee } = useEmployee(isAuthenticated);
  const [fullName, setFullName] = useState("");
  const [department, setDepartment] = useState("");
  const [gender, setGender] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const resetForm = () => {
    setFullName("");
    setDepartment("");
    setGender("");
    setEditingId(null);
  };

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload = {
      fullName: fullName.trim(),
      department: department.trim(),
      gender: gender.trim(),
    };

    if (!payload.fullName || !payload.department || !payload.gender) {
      return;
    }

    if (editingId) {
      await updateEmployee(editingId, payload);
    } else {
      await createEmployee(payload);
    }

    resetForm();
  };

  const startEdit = (id: string, name: string, dept: string, gen: string) => {
    setEditingId(id);
    setFullName(name);
    setDepartment(dept);
    setGender(gen);
  };

  return (
    <section className="card">
      <h1>Employees</h1>
      <form className="form-grid" onSubmit={(event) => void handleSubmit(event)}>
        <input
          type="text"
          placeholder="Full name"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Department"
          value={department}
          onChange={(event) => setDepartment(event.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Gender"
          value={gender}
          onChange={(event) => setGender(event.target.value)}
          required
        />
        <div className="row-actions">
          <button type="submit" disabled={mutating}>
            {editingId ? "Update" : "Add"}
          </button>
          {editingId ? (
            <button type="button" className="ghost-btn" onClick={resetForm} disabled={mutating}>
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      {loading ? <p>Loading employees...</p> : null}
      {error ? <p className="error">{error}</p> : null}

      {!loading && !error ? (
        <table className="employee-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Full Name</th>
              <th>Department</th>
              <th>Gender</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <tr key={employee.id}>
                <td>{employee.id}</td>
                <td>{employee.fullName}</td>
                <td>{employee.department}</td>
                <td>{employee.gender}</td>
                <td>
                  <div className="row-actions">
                    <button
                      type="button"
                      onClick={() =>
                        startEdit(employee.id, employee.fullName, employee.department, employee.gender)
                      }
                      disabled={mutating}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => void deleteEmployee(employee.id)}
                      disabled={mutating}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </section>
  );
}
