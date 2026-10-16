import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateYear } from "../../../hooks/useAcademicQueries";
import { YearForm } from "../../../components/academic/YearForm";
import { adminPaths } from "../../../data/navData";
import {
  EMPTY_YEAR_FORM,
  validateYearForm,
} from "../../../helpers/academic.helpers";
import type { YearFormValues } from "../../../helpers/academic.helpers";
import { extractErrorMessage } from "../../../helpers/student.helpers";

export default function CreateYearPage() {
  const navigate = useNavigate();
  const create = useCreateYear();
  const [values, setValues] = useState<YearFormValues>(EMPTY_YEAR_FORM);
  const [error, setError] = useState<string | null>(null);

  const goBack = () => navigate(adminPaths.academicsYears);

  const submit = () => {
    const problem = validateYearForm(values);
    if (problem) return setError(problem);
    setError(null);

    create.mutate(
      {
        name: values.name.trim(),
        startDate: values.startDate,
        endDate: values.endDate,
      },
      {
        onSuccess: goBack,
        onError: (err) =>
          setError(extractErrorMessage(err, "Failed to create academic year.")),
      },
    );
  };

  return (
    <div className="card" style={{ margin: 16 }}>
      <div className="card-head">
        <h2>New Academic Year</h2>
        <button type="button" className="btn secondary" onClick={goBack}>
          ← Back to Years
        </button>
      </div>
      <div className="card-body">
        <YearForm
          values={values}
          onChange={(field, value) =>
            setValues((prev) => ({ ...prev, [field]: value }))
          }
          onSubmit={submit}
          onCancel={goBack}
          submitting={create.isPending}
          error={error}
          submitLabel="Create Year"
        />
      </div>
    </div>
  );
}