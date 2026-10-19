import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  useBatch,
  useUpdateBatch,
  useYears,
} from "../../../hooks/useAcademicQueries";
import { BatchForm } from "../../../components/academics/BatchForm";
import { adminPaths } from "../../../data/navData";
import {
  EMPTY_BATCH_FORM,
  validateBatchForm,
} from "../../../helpers/academic.helpers";
import type { BatchFormValues } from "../../../helpers/academic.helpers";
import { extractErrorMessage } from "../../../helpers/student.helpers";

export default function BatchEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: batch, isLoading, isError } = useBatch(id ?? null);
  const { data: yearsData } = useYears("all");
  const update = useUpdateBatch();

  const [values, setValues] = useState<BatchFormValues>(EMPTY_BATCH_FORM);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (batch) {
      setValues({
        name: batch.name,
        entryYearId: batch.entryYearId,
        programDuration: String(batch.programDuration ?? ""),
        sectionCapacity: String(batch.sectionCapacity ?? ""),
      });
    }
  }, [batch]);

  const goBack = () =>
    navigate(
      id ? adminPaths.academicsBatchView(id) : adminPaths.academicsBatches,
    );

  const submit = () => {
    if (!id) return;
    const problem = validateBatchForm(values);
    if (problem) return setError(problem);
    setError(null);

    // NOTE: no startDate/endDate (derived by backend) and no status
    // (use Activate) — matches UpdateBatchDto.
    update.mutate(
      {
        id,
        dto: {
          name: values.name.trim(),
          entryYearId: values.entryYearId,
          programDuration: Number(values.programDuration),
          sectionCapacity: Number(values.sectionCapacity),
        },
      },
      {
        onSuccess: goBack,
        onError: (err) =>
          setError(extractErrorMessage(err, "Failed to update batch.")),
      },
    );
  };

  return (
    <div className="card" style={{ margin: 16 }}>
      <div className="card-head">
        <h2>Edit Batch</h2>
        <button type="button" className="btn secondary" onClick={goBack}>
          ← Back
        </button>
      </div>
      <div className="card-body">
        {isError ? (
          <p style={{ color: "crimson" }}>Failed to load batch.</p>
        ) : isLoading || !batch ? (
          <p style={{ color: "var(--ink-faint)" }}>Loading…</p>
        ) : (
          <BatchForm
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