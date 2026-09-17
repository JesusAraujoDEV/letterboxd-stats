export type SegmentedToggleValue = "allTime" | "logged";

const SegmentedToggle = ({
  value,
  onChange,
}: {
  value: SegmentedToggleValue;
  onChange: (next: SegmentedToggleValue) => void;
}) => (
  <div className="inline-flex rounded-full border border-border bg-background/40 p-1">
    <button
      type="button"
      onClick={() => onChange("allTime")}
      className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
        value === "allTime" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      All Time
    </button>
    <button
      type="button"
      onClick={() => onChange("logged")}
      className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
        value === "logged" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      Logged
    </button>
  </div>
);

export default SegmentedToggle;
