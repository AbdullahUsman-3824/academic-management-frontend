import { useState, useEffect } from "react";
import {
  useCreateFaculty,
  useUpdateFaculty,
  useFacultyById,
} from "../../hooks/useFacultyQueries";

type Props = {
  mode: "create" | "edit";
  facultyId?: string;
  onClose: () => void;
};

export default function FacultyForm({ mode, facultyId, onClose }: Props) {
  const [employeeNumber, setEmployeeNumber] = useState("");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [cnic, setCnic] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [designation, setDesignation] = useState("");
  const [qualification, setQualification] = useState("");
  const [joiningDate, setJoiningDate] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const { data: faculty } = useFacultyById(
    mode === "edit" && facultyId ? facultyId : null,
  );
  const createMutation = useCreateFaculty();
  const updateMutation = useUpdateFaculty();

  useEffect(() => {
    if (mode === "edit" && faculty) {
      setEmployeeNumber(faculty.employeeNumber);
      setFirstName(faculty.firstName);
      setMiddleName(faculty.middleName || "");
      setLastName(faculty.lastName || "");
      setEmail(faculty.email || "");
      setPhone(faculty.phone || "");
      setCnic(faculty.cnic || "");
      setDateOfBirth(
        faculty.dateOfBirth ? faculty.dateOfBirth.split("T")[0] : "",
      );
      setGender(faculty.gender || "");
      setAddress(faculty.address || "");
      setCity(faculty.city || "");
      setDesignation(faculty.designation || "");
      setQualification(faculty.qualification || "");
      setJoiningDate(
        faculty.joiningDate ? faculty.joiningDate.split("T")[0] : "",
      );
    }
  }, [mode, faculty]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      firstName,
      middleName: middleName || undefined,
      lastName: lastName || undefined,
      email: email || undefined,
      phone: phone || undefined,
      cnic: cnic || undefined,
      dateOfBirth: dateOfBirth || undefined,
      gender: gender || undefined,
      address: address || undefined,
      city: city || undefined,
      designation: designation || undefined,
      qualification: qualification || undefined,
      joiningDate: joiningDate || undefined,
    };

    try {
      if (mode === "create") {
        await createMutation.mutateAsync({
          employeeNumber,
          ...payload,
          username: username || undefined,
          password: password || undefined,
        });
      } else if (facultyId) {
        await updateMutation.mutateAsync({
          id: facultyId,
          payload,
        });
      }
      onClose();
    } catch (err) {
      alert(`Failed: ${(err as Error).message}`);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: 700, maxHeight: "90vh", overflow: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
            {mode === "create" ? "New Faculty Member" : "Edit Faculty Member"}
          </h2>
          <button
            type="button"
            className="btn secondary"
            onClick={onClose}
            style={{ padding: "4px 12px" }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Basic Information */}
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
              Basic Information
            </h3>

            {mode === "create" && (
              <div style={{ marginBottom: 16 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 500,
                    marginBottom: 6,
                  }}
                >
                  Employee Number <span style={{ color: "var(--red)" }}>*</span>
                </label>
                <input
                  type="text"
                  value={employeeNumber}
                  onChange={(e) => setEmployeeNumber(e.target.value)}
                  required
                  placeholder="FAC-001"
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: 5,
                    border: "1px solid var(--line)",
                    fontSize: 13,
                  }}
                />
              </div>
            )}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 12,
                marginBottom: 16,
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 500,
                    marginBottom: 6,
                  }}
                >
                  First Name <span style={{ color: "var(--red)" }}>*</span>
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: 5,
                    border: "1px solid var(--line)",
                    fontSize: 13,
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 500,
                    marginBottom: 6,
                  }}
                >
                  Middle Name
                </label>
                <input
                  type="text"
                  value={middleName}
                  onChange={(e) => setMiddleName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: 5,
                    border: "1px solid var(--line)",
                    fontSize: 13,
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 500,
                    marginBottom: 6,
                  }}
                >
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: 5,
                    border: "1px solid var(--line)",
                    fontSize: 13,
                  }}
                />
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                marginBottom: 16,
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 500,
                    marginBottom: 6,
                  }}
                >
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: 5,
                    border: "1px solid var(--line)",
                    fontSize: 13,
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 500,
                    marginBottom: 6,
                  }}
                >
                  Phone
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: 5,
                    border: "1px solid var(--line)",
                    fontSize: 13,
                  }}
                />
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 12,
                marginBottom: 16,
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 500,
                    marginBottom: 6,
                  }}
                >
                  CNIC
                </label>
                <input
                  type="text"
                  value={cnic}
                  onChange={(e) => setCnic(e.target.value)}
                  placeholder="35202-1234567-1"
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: 5,
                    border: "1px solid var(--line)",
                    fontSize: 13,
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 500,
                    marginBottom: 6,
                  }}
                >
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: 5,
                    border: "1px solid var(--line)",
                    fontSize: 13,
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 500,
                    marginBottom: 6,
                  }}
                >
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: 5,
                    border: "1px solid var(--line)",
                    fontSize: 13,
                  }}
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr",
                gap: 12,
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 500,
                    marginBottom: 6,
                  }}
                >
                  Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: 5,
                    border: "1px solid var(--line)",
                    fontSize: 13,
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 500,
                    marginBottom: 6,
                  }}
                >
                  City
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: 5,
                    border: "1px solid var(--line)",
                    fontSize: 13,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
              Professional Information
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                marginBottom: 16,
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 500,
                    marginBottom: 6,
                  }}
                >
                  Designation
                </label>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="Professor / Associate Professor"
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: 5,
                    border: "1px solid var(--line)",
                    fontSize: 13,
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 500,
                    marginBottom: 6,
                  }}
                >
                  Joining Date
                </label>
                <input
                  type="date"
                  value={joiningDate}
                  onChange={(e) => setJoiningDate(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: 5,
                    border: "1px solid var(--line)",
                    fontSize: 13,
                  }}
                />
              </div>
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 500,
                  marginBottom: 6,
                }}
              >
                Qualification
              </label>
              <input
                type="text"
                value={qualification}
                onChange={(e) => setQualification(e.target.value)}
                placeholder="PhD in Law"
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  borderRadius: 5,
                  border: "1px solid var(--line)",
                  fontSize: 13,
                }}
              />
            </div>
          </div>

          {/* Account Information (Create mode only) */}
          {mode === "create" && (
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
                Account Information
              </h3>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 13,
                      fontWeight: 500,
                      marginBottom: 6,
                    }}
                  >
                    Username (Optional)
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Leave blank to use employee number"
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: 5,
                      border: "1px solid var(--line)",
                      fontSize: 13,
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 13,
                      fontWeight: 500,
                      marginBottom: 6,
                    }}
                  >
                    Password (Optional)
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Leave blank for default"
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: 5,
                      border: "1px solid var(--line)",
                      fontSize: 13,
                    }}
                  />
                </div>
              </div>

              <p
                style={{
                  fontSize: 11,
                  color: "var(--ink-faint)",
                  marginTop: 8,
                  marginBottom: 0,
                }}
              >
                If left blank, username will be the employee number and password
                will be the default.
              </p>
            </div>
          )}

          <div
            style={{
              display: "flex",
              gap: 8,
              justifyContent: "flex-end",
              paddingTop: 16,
              borderTop: "1px solid var(--line)",
            }}
          >
            <button
              type="button"
              className="btn secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn" disabled={isSubmitting}>
              {isSubmitting
                ? mode === "create"
                  ? "Creating..."
                  : "Updating..."
                : mode === "create"
                  ? "Create Faculty"
                  : "Update Faculty"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
