import { WriDataset } from '@/schema/ckan.schema'
import classNames from '@/utils/classnames'
import Image from 'next/image'

export function Contact({
    dataset,
    isCurrentVersion,
    diffFields,
}: {
    dataset: WriDataset
    isCurrentVersion?: boolean
    diffFields: string[]
}) {
    const highlighted = (field: string) => {
        if (diffFields && !isCurrentVersion) {
            if (diffFields.find((f) => f.includes(field))) {
                return 'bg-yellow-200'
            }
        }
        return ''
    }
    return (
        <div className="grid grid-cols-2 gap-4 min-h-[300px] items-start">
            <TeamMember
                name={dataset.author ?? ''}
                img="/images/placeholders/user/userdefault.png"
                title="Author"
                email={dataset.author_email ?? ''}
                highlighted={(type) => highlighted(`author${type}`)}
            />
            <TeamMember
                name={dataset.maintainer ?? ''}
                img="/images/placeholders/user/userdefault.png"
                title="Maintainer"
                email={dataset.maintainer_email ?? ''}
                highlighted={(type) => highlighted(`maintainer${type}`)}
            />
        </div>
    )
}

interface TeamMemberProps {
    name: string
    img: string
    title: string
    email: string
    highlighted: (field: string) => string
}

function TeamMember({ name, img, title, email, highlighted }: TeamMemberProps) {
    return (
        <div className="mb-2 flex flex-wrap">
            <div>
                <div className="relative col-span-1 aspect-square h-12 sm:h-24 w-12 sm:w-24 sm:w-auto">
                    <Image alt={`${name} Avatar`} fill src={img} />
                </div>
            </div>
            <div className="col-span-2 flex flex-col justify-center font-acumin sm:ml-2">
                <div className='text-sm font-semibold text-black'>
                    {title}
                </div>
                <div className={classNames("text-sm font-normal text-black", highlighted(''))}>{name}</div>
                <div className={classNames("text-sm font-normal text-black", highlighted('_email'))}>{email}</div>
            </div>
        </div>
    )
}
