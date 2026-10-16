import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCreateSession, useYears } from "../../../hooks/useAcademicQueries";
import { SessionForm } from "../../../components/academic/SessionForm";
import { adminPaths } from "../../../data/navData";
import {
  EMPTY_SESSION_FORM,
  validateSessionForm,
} from "../../../helpers/academic.helpers";
import type { SessionFormValues } from "../../../helpers/academic.helpers";
import { extractErrorMessage } from "../../../helpers/student.helpers";

export default function CreateSessionPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const create = useCreateSession();
  const { data: yearsData } = useYears("all");
  const years = yearsData ?? [];

  // ?yearId=... pre-selects the year (used by "Add Session" on the year page)
  const [values, setValues] = useState<SessionFormValues>({
    ...EMPTY_SESSION_FORM,
    academicYearId: searchParams.get("yearId") ?? "",
  });
  const [error, setError] = useState<string | null>(null);

  const goBack = () => navigate(adminPaths.academicsSessions);

  const submit = () => {
    const problem = validateSessionForm(values);
    if (problem) return setError(problem);
    setError(null);

    create.mutate(
      {
        academicYearId: values.academicYearId,
        name: values.name.trim(),
        startDate: values.startDate,
        endDate: values.endDate,
      },
      {
        onSuccess: goBack,
        onError: (err) =>
          setError(extractErrorMessage(err, "Failed to create session.")),
      },
    );
  };

  return (
    <div className="card" style={{ margin: 16 }}>
      <div className="card-head">
        <h2>New Session</h2>
        <button type="button" className="btn secondary" onClick={goBack}>
          ← Back to Sessions
        </button>
      </div>
      <div className="card-body">
        <SessionForm
          values={values}
          years={years}
          onChange={(field, value) =>
            setValues((prev) => ({ ...prev, [field]: value }))
          }
          onSubmit={submit}
          onCancel={goBack}
          submitting={create.isPending}
          error={error}
          submitLabel="Create Session"
        />
      </div>
    </div>
  );
}