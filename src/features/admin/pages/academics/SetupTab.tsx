import { useState } from "react";
import { useSetupAcademic } from "../../hooks/useAcademicQueries";
import type { AcademicSetupPayload } from "../../api/academic";
import { isValidRange, inputStyle } from "./helpers";

export function SetupTab({ onDone }: { onDone: () => void }) {
  const setup = useSetupAcademic();
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [yearName, setYearName] = useState("");
  const [yearStart, setYearStart] = useState("");
  const [yearEnd, setYearEnd] = useState("");

  const [s1Name, setS1Name] = useState("Session 1");
  const [s1Start, setS1Start] = useState("");
  const [s1End, setS1End] = useState("");
  const [s2Name, setS2Name] = useState("Session 2");
  const [s2Start, setS2Start] = useState("");
  const [s2End, setS2End] = useState("");

  const [batchName, setBatchName] = useState("");
  const [batchStart, setBatchStart] = useState("");
  const [batchEnd, setBatchEnd] = useState("");

  const validateStep = () => {
    setError(null);
    if (step === 0) {
      if (!yearName || !yearStart || !yearEnd) {
        setError("All year fields are required");
        return false;
      }
      if (!isValidRange(yearStart, yearEnd)) {
        setError("Year end must be after start");
        return false;
      }
      return true;
    }
    if (step === 1) {
      if (!s1Name || !s1Start || !s1End || !s2Name || !s2Start || !s2End) {
        setError("All session fields are required");
        return false;
      }
      if (!isValidRange(s1Start, s1End) || !isValidRange(s2Start, s2End)) {
        setError("Each session end must be after start");
        return false;
      }
      const yS = new Date(yearStart);
      const yE = new Date(yearEnd);
      if (
        new Date(s1Start) < yS ||
        new Date(s1End) > yE ||
        new Date(s2Start) < yS ||
        new Date(s2End) > yE
      ) {
        setError("Sessions must fall within the academic year");
        return false;
      }
      if (
        new Date(s1Start) < new Date(s2End) &&
        new Date(s2Start) < new Date(s1End)
      ) {
        setError("Sessions must not overlap");
        return false;
      }
      return true;
    }
    if (step === 2) {
      if (!batchName || !batchStart) {
        setError("Batch name and start date are required");
        return false;
      }
      if (batchEnd && !isValidRange(batchStart, batchEnd)) {
        setError("Batch end must be after start");
        return false;
      }
      return true;
    }
    return true;
  };

  const next = () => {
    if (!validateStep()) return;
    setStep((s) => s + 1);
  };

  const submit = () => {
    if (!validateStep()) return;
    const payload: AcademicSetupPayload = {
      year: { name: yearName, startDate: yearStart, endDate: yearEnd },
      sessions: [
        { name: s1Name, startDate: s1Start, endDate: s1End },
        { name: s2Name, startDate: s2Start, endDate: s2End },
      ],
      batch: {
        name: batchName,
        startDate: batchStart,
        endDate: batchEnd || undefined,
      },
    };
    setup.mutate(payload, {
      onSuccess: () => onDone(),
      onError: (err: any) => {
        setError(
          err?.response?.data?.message ?? err?.message ?? "Setup failed",
        );
      },
    });
  };

  const steps = ["Academic Year", "Sessions (2)", "Batch", "Review"];

  return (
    <div className="card-body">
      {/* Horizontal stepper */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 24,
          padding: "8px 4px",
        }}
      >
        {steps.map((label, i) => {
          const done = i < step;
          const active = i === step;
          return (
            <div
              key={label}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                position: "relative",
              }}
            >
              {/* connector line (left of this step) */}
              {i > 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: 14,
                    right: "50%",
                    width: "100%",
                    height: 2,
                    background:
                      done || active
                        ? "var(--brand, #1b5e3b)"
                        : "var(--line, #e0e0e0)",
                    zIndex: 0,
                  }}
                />
              )}

              {/* circle */}
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  fontWeight: 700,
                  zIndex: 1,
                  background: done || active ? "var(--brand, #1b5e3b)" : "#fff",
                  color: done || active ? "#fff" : "var(--ink-faint, #999)",
                  border:
                    done || active
                      ? "2px solid var(--brand, #1b5e3b)"
                      : "2px solid var(--line, #e0e0e0)",
                }}
              >
                {done ? "✓" : i + 1}
              </div>

              {/* title */}
              <div
                style={{
                  marginTop: 8,
                  fontSize: 12,
                  fontWeight: active ? 700 : 500,
                  color:
                    active || done
                      ? "var(--ink, #222)"
                      : "var(--ink-faint, #999)",
                  textAlign: "center",
                  lineHeight: 1.3,
                }}
              >
                {label}
              </div>
            </div>
          );
        })}
      </div>

      {error && <p style={{ color: "crimson", marginBottom: 12 }}>{error}</p>}

      {step === 0 && (
        <div className="profile-fields">
          <div className="profile-field">
            <div className="profile-field__label">Year Name</div>
            <input
              value={yearName}
              onChange={(e) => setYearName(e.target.value)}
              placeholder="e.g. 2026-27"
              style={inputStyle}
            />
          </div>
          <div className="profile-field">
            <div className="profile-field__label">Start Date</div>
            <input
              type="date"
              value={yearStart}
              onChange={(e) => setYearStart(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div className="profile-field">
            <div className="profile-field__label">End Date</div>
            <input
              type="date"
              value={yearEnd}
              onChange={(e) => setYearEnd(e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="profile-fields">
          <div className="subj-title" style={{ marginBottom: 8 }}>
            Session 1
          </div>
          <div className="profile-field">
            <div className="profile-field__label">Name</div>
            <input
              value={s1Name}
              onChange={(e) => setS1Name(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div className="profile-field">
            <div className="profile-field__label">Start</div>
            <input
              type="date"
              value={s1Start}
              onChange={(e) => setS1Start(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div className="profile-field">
            <div className="profile-field__label">End</div>
            <input
              type="date"
              value={s1End}
              onChange={(e) => setS1End(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div className="subj-title" style={{ margin: "16px 0 8px" }}>
            Session 2
          </div>
          <div className="profile-field">
            <div className="profile-field__label">Name</div>
            <input
              value={s2Name}
              onChange={(e) => setS2Name(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div className="profile-field">
            <div className="profile-field__label">Start</div>
            <input
              type="date"
              value={s2Start}
              onChange={(e) => setS2Start(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div className="profile-field">
            <div className="profile-field__label">End</div>
            <input
              type="date"
              value={s2End}
              onChange={(e) => setS2End(e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="profile-fields">
          <div className="profile-field">
            <div className="profile-field__label">Batch Name</div>
            <input
              value={batchName}
              onChange={(e) => setBatchName(e.target.value)}
              placeholder="e.g. Batch 2026"
              style={inputStyle}
            />
          </div>
          <div className="profile-field">
            <div className="profile-field__label">Start Date</div>
            <input
              type="date"
              value={batchStart}
              onChange={(e) => setBatchStart(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div className="profile-field">
            <div className="profile-field__label">End Date (optional)</div>
            <input
              type="date"
              value={batchEnd}
              onChange={(e) => setBatchEnd(e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="profile-fields">
          <div className="profile-field">
            <div className="profile-field__label">Year</div>
            <div className="profile-field__value">
              {yearName} ({yearStart} → {yearEnd})
            </div>
          </div>
          <div className="profile-field">
            <div className="profile-field__label">Session 1</div>
            <div className="profile-field__value">
              {s1Name} ({s1Start} → {s1End})
            </div>
          </div>
          <div className="profile-field">
            <div className="profile-field__label">Session 2</div>
            <div className="profile-field__value">
              {s2Name} ({s2Start} → {s2End})
            </div>
          </div>
          <div className="profile-field">
            <div className="profile-field__label">Batch</div>
            <div className="profile-field__value">
              {batchName} ({batchStart}
              {batchEnd ? ` → ${batchEnd}` : " ongoing"})
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
        {step > 0 && (
          <button
            type="button"
            className="btn secondary"
            onClick={() => {
              setError(null);
              setStep((s) => s - 1);
            }}
            disabled={setup.isPending}
          >
            Back
          </button>
        )}
        {step < 3 ? (
          <button type="button" className="btn" onClick={next}>
            Next
          </button>
        ) : (
          <button
            type="button"
            className="btn"
            onClick={submit}
            disabled={setup.isPending}
          >
            {setup.isPending ? "Creating…" : "Create Academic Setup"}
          </button>
        )}
      </div>
    </div>
  );
}
