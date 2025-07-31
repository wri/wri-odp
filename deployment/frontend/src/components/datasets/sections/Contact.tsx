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
            <div>
                <h3 className="text-lg font-semibold mb-5">Authors</h3>
                {dataset.authors?.map((author, index) => (
                    <TeamMember
                        key={`author-${index}`}
                        name={author.name ?? ''}
                        img="/images/placeholders/user/userdefault.png"
                        title="Author"
                        email={author.email ?? ''}
                        highlighted={(field) => highlighted(`authors[${index}].${field}`)}
                    />
                ))}
            </div>
            <div>
                <h3 className="text-lg font-semibold mb-5">Maintainers</h3>
                {dataset.maintainers?.map((maintainer, index) => (
                    <TeamMember
                        key={`maintainer-${index}`}
                        name={maintainer.name ?? ''}
                        img="/images/placeholders/user/userdefault.png"
                        title="Maintainer"
                        email={maintainer.email ?? ''}
                        highlighted={(field) => highlighted(`maintainers[${index}].${field}`)}
                    />
                ))}
            </div>
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
                <div className="text-sm font-semibold text-black">{title}</div>
                <div
                    className={classNames(
                        'text-sm font-normal text-black',
                        highlighted('name')
                    )}
                >
                    {name}
                </div>
                <div
                    className={classNames(
                        'text-sm font-normal text-black',
                        highlighted('email')
                    )}
                >
                    {email}
                </div>
            </div>
        </div>
    )
}
