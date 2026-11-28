import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

type Props = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmationDialog({
  open,
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <Dialog
      open={open}
      disablePortal
      onClose={onCancel}
      fullWidth
      maxWidth="xs"
      aria-labelledby="confirmation-dialog-title"
      aria-describedby="confirmation-dialog-description"
      slotProps={{
        paper: {
          sx: {
            border: "1px solid var(--line)",
            borderRadius: 2,
            boxShadow: "0 18px 56px rgba(20, 42, 30, 0.2)",
            backgroundColor: "var(--card)",
            backgroundImage: "none",
            color: "var(--ink)",
            fontFamily: "inherit",
          },
        },
        backdrop: {
          sx: { backgroundColor: "rgba(18, 33, 26, 0.45)" },
        },
      }}
    >
      <DialogTitle
        id="confirmation-dialog-title"
        sx={{
          color: "var(--green-900)",
          fontSize: 18,
          fontWeight: 700,
          borderBottom: "1px solid var(--line)",
        }}
      >
        {title}
      </DialogTitle>
      <DialogContent sx={{ pt: 2.5 }}>
        <DialogContentText
          id="confirmation-dialog-description"
          sx={{ color: "var(--ink-soft)" }}
        >
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 2.5, pb: 2 }}>
        <button type="button" className="btn secondary" onClick={onCancel}>
          Cancel
        </button>
        <button
          type="button"
          className="btn"
          onClick={onConfirm}
          style={{
            backgroundColor: "var(--red)",
            borderColor: "var(--red)",
            color: "white",
          }}
        >
          {confirmLabel}
        </button>
      </DialogActions>
    </Dialog>
  );
}
