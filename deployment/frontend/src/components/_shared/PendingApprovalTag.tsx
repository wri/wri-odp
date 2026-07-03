import { useSession } from "next-auth/react";
import Chip from "./Chip";
import { api } from "@/utils/api";
import { type WriDataset } from "@/schema/ckan.schema";

function StatusChip({ status }: { status?: string }) {
  if (!status) return <></>;
  if (status === 'approved') return <></>;
  if (status === 'rejected') return <Chip text="Rejected" />;
  return (
    <Chip text="Pending Approval" />
  );
}

export default function PendingApprovalTag({
  dataset
}: {
  dataset: Pick<WriDataset, 'creator_user_id' | 'approval_status' | 'owner_org'>
}) {
  const session = useSession();
  const userCapacity = api.user.getUserCapacity.useQuery(undefined, {
    enabled: !!session?.data?.user,
  });
  if (!session?.data?.user) return <></>;
  const userId = session.data.user.id;
  if (userId === dataset.creator_user_id) {
    return <StatusChip status={dataset.approval_status} />;
  }
  const adminOfDatasetOrg = userCapacity.data?.adminOrg.some(o => o.id === dataset.owner_org) ?? false;
  if (!adminOfDatasetOrg) return <></>;
  return <StatusChip status={dataset.approval_status} />;
}
