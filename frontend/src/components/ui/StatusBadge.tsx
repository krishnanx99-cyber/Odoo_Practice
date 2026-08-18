import Badge from "./Badge";

type StatusBadgeTone = "primary" | "secondary" | "tertiary" | "error" | "neutral";

const statusMap: Record<string, { label: string; tone: StatusBadgeTone }> = {
  pending: { label: "Pending", tone: "tertiary" },
  approved: { label: "Approved", tone: "primary" },
  rejected: { label: "Rejected", tone: "error" },
  cancelled: { label: "Cancelled", tone: "neutral" },
  completed: { label: "Completed", tone: "secondary" },
  draft: { label: "Draft", tone: "neutral" },
  published: { label: "Published", tone: "primary" },
  active: { label: "Available", tone: "primary" },
  inactive: { label: "Inactive", tone: "neutral" },
  maintenance: { label: "Maintenance", tone: "error" },
};

interface StatusBadgeProps {
  status: string;
}

function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusMap[status] ?? { label: status, tone: "neutral" as const };
  return <Badge tone={config.tone}>{config.label}</Badge>;
}

export default StatusBadge;