import { ApplicationStatus } from '@/lib/types';
import { cn } from '@/lib/utils';

const config: Record<ApplicationStatus, { badge: string; dot: string; label: string }> = {
  Watching:  { badge: 'badge-watching',  dot: 'dot-watching',  label: 'Watching'  },
  Applied:   { badge: 'badge-applied',   dot: 'dot-applied',   label: 'Applied'   },
  Interview: { badge: 'badge-interview', dot: 'dot-interview', label: 'Interview' },
  Offer:     { badge: 'badge-offer',     dot: 'dot-offer',     label: 'Offer'     },
  Rejected:  { badge: 'badge-rejected',  dot: 'dot-rejected',  label: 'Rejected'  },
  Ghosted:   { badge: 'badge-ghosted',   dot: 'dot-ghosted',   label: 'Ghosted'   },
  Closed:    { badge: 'badge-closed',    dot: 'dot-closed',    label: 'Closed'    },
  Custom:    { badge: 'badge-custom',    dot: 'dot-custom',    label: 'Custom'    },
};

interface Props {
  status: ApplicationStatus;
  customStatus?: string;
  className?: string;
}

export default function StatusBadge({ status, customStatus, className }: Props) {
  const c = config[status] ?? config.Custom;
  const label = status === 'Custom' ? (customStatus || 'Custom') : c.label;

  return (
    <span className={cn('badge', c.badge, className)}>
      <span className={cn('badge-dot', c.dot)} />
      {label}
    </span>
  );
}
