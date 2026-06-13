const STATUS_MAP = {
  CONFIRMED: { variant: 'success', label: 'Confirmed' },
  PENDING: { variant: 'warning', label: 'Pending' },
  CANCELLED: { variant: 'danger', label: 'Cancelled' },
};

const StatusBadge = ({ status }) => {
  const mapped = STATUS_MAP[status?.toUpperCase()] || { variant: 'info', label: status };

  return (
    <span className={`badge badge-${mapped.variant}`}>
      <span className="badge-dot" />
      {mapped.label}
    </span>
  );
};

export default StatusBadge;
