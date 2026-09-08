import { Badge } from '@/components/ui/Badge';
import { ADMIN_STATUS_LABELS, ADMIN_STATUS_TONES } from '@/constants/admin/adminLabels';
import type { ContentStatus } from '@/lib/prisma-types';

export function AdminStatusBadge({ status }: { status: ContentStatus }) {
  return <Badge tone={ADMIN_STATUS_TONES[status]}>{ADMIN_STATUS_LABELS[status]}</Badge>;
}
