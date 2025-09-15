import TableContent from '@/contents/TableContent.mdx'
import MdxLayout from '@/components/_shared/mdx-layout'

export default function Page() {
    return (
        <MdxLayout
            label="User Guide"
            url="/user-guide"
            title="Data Explorer User Guide"
        >
            <TableContent />
        </MdxLayout>
    )
}
