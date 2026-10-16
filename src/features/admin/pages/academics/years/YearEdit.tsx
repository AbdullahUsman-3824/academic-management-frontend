import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useYear, useUpdateYear } from "../../../hooks/useAcademicQueries";
import { YearForm } from "../../../components/academic/YearForm";
import { adminPaths } from "../../../data/navData";
import {
  EMPTY_YEAR_FORM,
  toInputDate,
  validateYearForm,
} from "../../../helpers/academic.helpers";
import type { YearFormValues } from "../../../helpers/academic.helpers";
import { extractErrorMessage } from "../../../helpers/student.helpers";

export default function YearEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: year, isLoading, isError } = useYear(id ?? null);
  const update = useUpdateYear();

  const [values, setValues] = useState<YearFormValues>(EMPTY_YEAR_FORM);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (year) {
      setValues({
        name: year.name,
        startDate: toInputDate(year.startDate),
        endDate: toInputDate(year.endDate),
      });
    }
  }, [year]);

  const goBack = () =>
    navigate(id ? adminPaths.academicsYearView(id) : adminPaths.academicsYears);

  const submit = () => {
    if (!id) return;
    const problem = validateYearForm(values);
    if (problem) return setError(problem);
    setError(null);

    update.mutate(
      {
        id,
        dto: {
          name: values.name.trim(),
          startDate: values.startDate,
          endDate: values.endDate,
        },
      },
      {
        onSuccess: goBack,
        onError: (err) =>
          setError(extractErrorMessage(err, "Failed to update academic year.")),
      },
    );
  };

  return (
    <div className="card" style={{ margin: 16 }}>
      <div className="card-head">
        <h2>Edit Year</h2>
        <button type="button" className="btn secondary" onClick={goBack}>
          ← Back
        </button>
      </div>
      <div className="card-body">
        {isError ? (
          <p style={{ color: "crimson" }}>Failed to load year.</p>
        ) : isLoading || !year ? (
          <p style={{ color: "var(--ink-faint)" }}>Loading…</p>
        ) : (
          <YearForm
            values={values}
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