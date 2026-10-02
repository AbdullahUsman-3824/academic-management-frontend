import type { StudentFormProps } from "./student.types";
import { useState } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  TextField,
  MenuItem,
  Button,
  Grid,
  Stack,
  CircularProgress,
  Typography,
  Divider,
  Box,
  Avatar,
} from "@mui/material";

const MAX_IMAGE_SIZE_MB = 2;

// Colors the required-field "*" red instead of MUI's default muted grey.
const requiredAsteriskSx = {
  "& .MuiFormLabel-asterisk": { color: "error.main" },
};

export function StudentForm({
  mode,
  values,
  batches,
  batchesLoading,
  sections,
  sectionsLoading,
  academicSessions,
  academicSessionsLoading,
  onChange,
  onCancel,
  onSubmit,
  submitting,
}: StudentFormProps) {
  const regReadOnly = mode === "edit";
  const [imageError, setImageError] = useState("");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic validation
    if (!file.type.startsWith("image/")) {
      setImageError("Please select an image file.");
      e.target.value = "";
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      setImageError(`Image must be smaller than ${MAX_IMAGE_SIZE_MB} MB.`);
      e.target.value = "";
      return;
    }

    setImageError("");

    // Convert to base64 data URL and store it in form values
    const reader = new FileReader();
    reader.onload = () => {
      onChange("profileImageUrl", reader.result as string);
    };
    reader.readAsDataURL(file);

    // Reset so selecting the same file again still triggers onChange
    e.target.value = "";
  };

  const handleRemoveImage = () => {
    setImageError("");
    onChange("profileImageUrl", "");
  };

  const handleSemesterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === "") {
      onChange("semesterNumber", "");
      return;
    }
    const num = Number(raw);
    if (Number.isNaN(num)) return;
    const clamped = Math.min(8, Math.max(1, Math.trunc(num)));
    onChange("semesterNumber", String(clamped));
  };

  return (
    <Card variant="outlined">
      <CardHeader
        title={
          mode === "create" ? "Register Student" : "Update Student Profile"
        }
        sx={{ borderBottom: 1, borderColor: "divider", py: 1.5 }}
      />

      <CardContent sx={{ pt: 2 }}>
        {/* ─────────────────────────────────────────────── */}
        {/* SECTION 1: Registration Information              */}
        {/* ─────────────────────────────────────────────── */}
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
          Registration Information
        </Typography>

        <Grid container spacing={1.5} sx={{ mb: 3 }}>
          {/* Registration Number */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              required
              label="Registration Number"
              value={values.stdRegNumber}
              onChange={(e) => onChange("stdRegNumber", e.target.value)}
              disabled={regReadOnly}
              sx={requiredAsteriskSx}
              slotProps={{
                input: { readOnly: regReadOnly },
              }}
            />
          </Grid>

          {/* Batch */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              fullWidth
              size="small"
              required
              label="Batch"
              value={values.batchId}
              onChange={(e) => onChange("batchId", e.target.value)}
              disabled={batchesLoading}
              sx={requiredAsteriskSx}
              slotProps={{
                select: { displayEmpty: true },
                inputLabel: { shrink: true },
              }}
            >
              <MenuItem value="">
                <em>{batchesLoading ? "Loading batches…" : "Select batch"}</em>
              </MenuItem>
              {batches.map((batch) => (
                <MenuItem key={batch.id} value={batch.id}>
                  {batch.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Section */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="Section"
              value={values.sectionId}
              onChange={(e) => onChange("sectionId", e.target.value)}
              disabled={!values.batchId || sectionsLoading}
              slotProps={{
                select: { displayEmpty: true },
                inputLabel: { shrink: true },
              }}
            >
              <MenuItem value="">
                <em>
                  {!values.batchId
                    ? "Select a batch first"
                    : sectionsLoading
                      ? "Loading sections…"
                      : "AUTO"}
                </em>
              </MenuItem>
              {sections.map((sec) => (
                <MenuItem key={sec.id} value={sec.id}>
                  {sec.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Semester */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              type="number"
              label="Semester"
              value={values.semesterNumber}
              onChange={handleSemesterChange}
              slotProps={{
                htmlInput: { min: 1, max: 8 },
                inputLabel: { shrink: true },
              }}
            />
          </Grid>

          {/* Academic Session */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="Academic Session"
              value={values.academicSessionId}
              onChange={(e) => onChange("academicSessionId", e.target.value)}
              disabled={academicSessionsLoading}
              slotProps={{
                select: { displayEmpty: true },
                inputLabel: { shrink: true },
              }}
            >
              <MenuItem value="">
                <em>
                  {academicSessionsLoading
                    ? "Loading sessions…"
                    : "Select session"}
                </em>
              </MenuItem>
              {academicSessions.map((sess) => (
                <MenuItem key={sess.id} value={sess.id}>
                  {sess.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Admission Date */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="Admission Date"
              value={values.admissionDate}
              onChange={(e) => onChange("admissionDate", e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>
        </Grid>

        <Divider sx={{ mb: 3 }} />

        {/* ─────────────────────────────────────────────── */}
        {/* SECTION 2: Student Details                       */}
        {/* ─────────────────────────────────────────────── */}
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
          Student Details
        </Typography>

        <Grid container spacing={1.5}>
          {/* First Name */}
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              size="small"
              required
              label="First Name"
              value={values.firstName}
              onChange={(e) => onChange("firstName", e.target.value)}
              sx={requiredAsteriskSx}
            />
          </Grid>

          {/* Middle Name */}
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              size="small"
              label="Middle Name"
              value={values.middleName}
              onChange={(e) => onChange("middleName", e.target.value)}
            />
          </Grid>

          {/* Last Name */}
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              size="small"
              label="Last Name"
              value={values.lastName}
              onChange={(e) => onChange("lastName", e.target.value)}
            />
          </Grid>

          {/* Email */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              type="email"
              label="Email"
              value={values.email}
              onChange={(e) => onChange("email", e.target.value)}
            />
          </Grid>

          {/* Phone */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              label="Phone"
              value={values.phone}
              onChange={(e) => onChange("phone", e.target.value)}
            />
          </Grid>

          {/* Date of Birth */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="Date of Birth"
              value={values.dateOfBirth}
              onChange={(e) => onChange("dateOfBirth", e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>

          {/* Gender */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="Gender"
              value={values.gender}
              onChange={(e) => onChange("gender", e.target.value)}
              slotProps={{
                select: { displayEmpty: true },
                inputLabel: { shrink: true },
              }}
            >
              <MenuItem value="">
                <em>Select gender</em>
              </MenuItem>
              <MenuItem value="male">Male</MenuItem>
              <MenuItem value="female">Female</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </TextField>
          </Grid>

          {/* CNIC */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              label="CNIC"
              placeholder="35202-1234567-1"
              value={values.cnic}
              onChange={(e) => onChange("cnic", e.target.value)}
            />
          </Grid>

          {/* City */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              label="City"
              value={values.city}
              onChange={(e) => onChange("city", e.target.value)}
            />
          </Grid>

          {/* Address */}
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              size="small"
              label="Address"
              value={values.address}
              onChange={(e) => onChange("address", e.target.value)}
            />
          </Grid>

          {/* Profile Picture: upload + preview (stored as base64) */}
          <Grid size={{ xs: 12 }}>
            <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
              <Avatar
                src={values.profileImageUrl || undefined}
                alt="Profile preview"
                sx={{ width: 64, height: 64 }}
              />

              <Box>
                <Stack direction="row" spacing={1}>
                  <Button
                    component="label"
                    variant="outlined"
                    size="small"
                    className="btn secondary"
                  >
                    {values.profileImageUrl
                      ? "Change Picture"
                      : "Upload Picture"}
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={handleImageChange}
                    />
                  </Button>

                  {values.profileImageUrl && (
                    <Button
                      variant="text"
                      size="small"
                      color="error"
                      onClick={handleRemoveImage}
                    >
                      Remove
                    </Button>
                  )}
                </Stack>

                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    mt: 0.5,
                    color: imageError ? "error.main" : "text.secondary",
                  }}
                >
                  {imageError || `Max size ${MAX_IMAGE_SIZE_MB} MB`}
                </Typography>
              </Box>
            </Stack>
          </Grid>

          {/* Guardian section heading */}
          <Grid size={{ xs: 12 }}>
            <Box sx={{ mt: 1, mb: 0.5 }}>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, color: "text.secondary" }}
              >
                Guardian Information
              </Typography>
            </Box>
          </Grid>

          {/* Guardian Name */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              label="Guardian Name"
              value={values.guardianName}
              onChange={(e) => onChange("guardianName", e.target.value)}
            />
          </Grid>

          {/* Guardian Relation */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              label="Guardian Relation"
              value={values.guardianRelation}
              onChange={(e) => onChange("guardianRelation", e.target.value)}
            />
          </Grid>

          {/* Guardian Phone */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              label="Guardian Phone"
              value={values.guardianPhone}
              onChange={(e) => onChange("guardianPhone", e.target.value)}
            />
          </Grid>

          {/* Guardian CNIC */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              label="Guardian CNIC"
              value={values.guardianCnic}
              onChange={(e) => onChange("guardianCnic", e.target.value)}
            />
          </Grid>
        </Grid>

        {/* Actions */}
        <Stack direction="row" spacing={1.5} sx={{ mt: 3 }}>
          <Button
            variant="contained"
            size="small"
            onClick={onSubmit}
            disabled={submitting}
            startIcon={
              submitting ? <CircularProgress size={14} color="inherit" /> : null
            }
            className="btn"
          >
            {submitting
              ? mode === "create"
                ? "Saving…"
                : "Updating…"
              : mode === "create"
                ? "Save Student"
                : "Update Student"}
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={onCancel}
            disabled={submitting}
            className="btn secondary"
          >
            Cancel
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}