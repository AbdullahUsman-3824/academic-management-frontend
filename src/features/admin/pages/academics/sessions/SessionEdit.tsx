import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  useSession,
  useUpdateSession,
  useYears,
} from "../../../hooks/useAcademicQueries";
import { SessionForm } from "../../../components/academic/SessionForm";
import { adminPaths } from "../../../data/navData";
import {
  EMPTY_SESSION_FORM,
  toInputDate,
  validateSessionForm,
} from "../../../helpers/academic.helpers";
import type { SessionFormValues } from "../../../helpers/academic.helpers";
import { extractErrorMessage } from "../../../helpers/student.helpers";

export default function SessionEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: session, isLoading, isError } = useSession(id ?? null);
  const { data: yearsData } = useYears("all");
  const update = useUpdateSession();

  const [values, setValues] = useState<SessionFormValues>(EMPTY_SESSION_FORM);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session) {
      setValues({
        name: session.name,
        academicYearId: session.academicYearId,
        startDate: toInputDate(session.startDate),
        endDate: toInputDate(session.endDate),
      });
    }
  }, [session]);

  const goBack = () =>
    navigate(
      id ? adminPaths.academicsSessionView(id) : adminPaths.academicsSessions,
    );

  const submit = () => {
    if (!id) return;
    const problem = validateSessionForm(values);
    if (problem) return setError(problem);
    setError(null);

    // NOTE: no status here — use Activate / Complete on the sessions list.
    update.mutate(
      {
        id,
        dto: {
          name: values.name.trim(),
          academicYearId: values.academicYearId,
          startDate: values.startDate,
          endDate: values.endDate,
        },
      },
      {
        onSuccess: goBack,
        onError: (err) =>
          setError(extractErrorMessage(err, "Failed to update session.")),
      },
    );
  };

  return (
    <div className="card" style={{ margin: 16 }}>
      <div className="card-head">
        <h2>Edit Session</h2>
        <button type="button" className="btn secondary" onClick={goBack}>
          ← Back
        </button>
      </div>
      <div className="card-body">
        {isError ? (
          <p style={{ color: "crimson" }}>Failed to load session.</p>
        ) : isLoading || !session ? (
          <p style={{ color: "var(--ink-faint)" }}>Loading…</p>
        ) : (
          <SessionForm
            values={values}
            years={yearsData ?? []}
            onChange={(field, value) =>
              setValues((prev) => ({ ...prev, [field]: value }))
            }
            onSubmit={submit}
            onCancel={goBack}
            submitting={update.isPending}
            error={error}
          />
        )}
      </div>
    </div>
  );
}