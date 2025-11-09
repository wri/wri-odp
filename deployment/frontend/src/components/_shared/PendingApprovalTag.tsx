import { useSession } from "next-auth/react"
import Chip from "./Chip"
import { api } from "@/utils/api"
import { WriDataset } from "@/schema/ckan.schema"

export default function PendingApprovalTag({
  dataset
}: {
    dataset: WriDataset
}) {
  const session = useSession()
  const userCapacity = api.user.getUserCapacity.useQuery(undefined, {
    enabled: !!session?.data?.user,
  })
  if (!session?.data?.user) return <></>
  const adminOfDatasetOrg = userCapacity.data?.adminOrg.some(o => o.id === dataset.owner_org) ?? false
  if (!adminOfDatasetOrg) return <></>
  if (dataset.approval_status === 'approved') return <></>
  if (dataset.approval_status === 'rejected') return <Chip text="Rejected" />
  return (
    <Chip text="Pending Approval" />
  )
}
