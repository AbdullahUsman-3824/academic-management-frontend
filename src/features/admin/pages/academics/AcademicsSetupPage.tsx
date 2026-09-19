import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSetupAcademic } from "../../hooks/useAcademicQueries";
import type { AcademicSetupPayload } from "../../api/academic";
import { isValidRange, inputStyle } from "./helpers";

const STEPS = ["Academic Year", "Sessions (2)", "Review"];

export default function AcademicsSetupPage() {
  const navigate = useNavigate();
  const setup = useSetupAcademic();

  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Year fields
  const [yearName, setYearName] = useState("");
  const [yearStart, setYearStart] = useState("");
  const [yearEnd, setYearEnd] = useState("");

  // Session fields
  const [s1Name, setS1Name] = useState("Session 1");
  const [s1Start, setS1Start] = useState("");
  const [s1End, setS1End] = useState("");
  const [s2Name, setS2Name] = useState("Session 2");
  const [s2Start, setS2Start] = useState("");
  const [s2End, setS2End] = useState("");

  const validateStep = (): boolean => {
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
        setError("Each session end must be after its start");
        return false;
      }
      const yS = new Date(yearStart),
        yE = new Date(yearEnd);
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
    return true;
  };

  const next = () => {
    if (validateStep()) setStep((s) => s + 1);
  };
  const back = () => {
    setError(null);
    setStep((s) => s - 1);
  };

  const submit = () => {
    if (!validateStep()) return;
    const payload: AcademicSetupPayload = {
      year: { name: yearName, startDate: yearStart, endDate: yearEnd },
      sessions: [
        { name: s1Name, startDate: s1Start, endDate: s1End },
        { name: s2Name, startDate: s2Start, endDate: s2End },
      ],
    };
    setup.mutate(payload, {
      onSuccess: () => navigate("/academics"),
      onError: (err: any) =>
        setError(
          err?.response?.data?.message ?? err?.message ?? "Setup failed",
        ),
    });
  };

  return (
    <div className="card">
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="card-head">
        <div>
          <h2>Set Up New Academic Year</h2>
          <span className="meta">
            Complete all steps to create a year, two sessions, and a batch.
          </span>
        </div>
        <button
          type="button"
          className="btn secondary"
          onClick={() => navigate("/academics")}
        >
          ← Back to Overview
        </button>
      </div>

      <div className="card-body">
        {/* ── Stepper ─────────────────────────────────────────── */}
        <div className="acad-stepper">
          {STEPS.map((label, i) => {
            const done = i < step;
            const active = i === step;
            return (
              <div key={label} className="acad-stepper__item">
                {/* connector line */}
                {i > 0 && (
                  <div
                    className={`acad-stepper__line${done || active ? " acad-stepper__line--done" : ""}`}
                  />
                )}
                {/* circle */}
                <div
                  className={`acad-stepper__circle${done ? " acad-stepper__circle--done" : active ? " acad-stepper__circle--active" : ""}`}
                >
                  {done ? "✓" : i + 1}
                </div>
                {/* label */}
                <div
                  className={`acad-stepper__label${active ? " acad-stepper__label--active" : done ? " acad-stepper__label--done" : ""}`}
                >
                  {label}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Error banner ────────────────────────────────────── */}
        {error && (
          <div className="notice error" style={{ marginBottom: 16 }}>
            {error}
          </div>
        )}

        {/* ── Step 0: Academic Year ────────────────────────────── */}
        {step === 0 && (
          <div className="profile-fields">
            <div className="profile-field">
              <div className="profile-field__label">Year Name</div>
              <input
                value={yearName}
                onChange={(e) => setYearName(e.target.value)}
                placeholder="e.g. 2026"
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

        {/* ── Step 1: Sessions ────────────────────────────────── */}
        {step === 1 && (
          <div className="profile-fields">
            <div className="subj-title" style={{ padding: "8px 18px 4px" }}>
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

            <div className="subj-title" style={{ padding: "16px 18px 4px" }}>
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

        {/* ── Step 2: Review ──────────────────────────────────── */}
        {step === 2 && (
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
          </div>
        )}

        {/* ── Navigation buttons ──────────────────────────────── */}
        <div className="action-row" style={{ marginTop: 24 }}>
          {step > 0 && (
            <button
              type="button"
              className="btn secondary"
              onClick={back}
              disabled={setup.isPending}
            >
              Back
            </button>
          )}
          {step < 2 ? (
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
    </div>
  );
}
