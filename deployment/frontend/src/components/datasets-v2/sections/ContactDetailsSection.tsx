import {
    getThemedBorderWidth,
    getThemedColor,
    getThemedFontSize,
    getThemedRadius,
    getThemedSpacing,
} from '@worldresources/wri-design-systems';
import { type WriDataset } from '@/schema/ckan.schema';
import { hasValue } from '../utils/text';

export type ContactEntry = {
    name?: string;
    email?: string;
};

type Props = {
    dataset: WriDataset;
};

export function getContactEntries(dataset: WriDataset): {
    authors: ContactEntry[];
    maintainers: ContactEntry[];
} {
    const authors = [
        ...(dataset.authors ?? []).map((author) => ({
            name: author.name,
            email: author.email,
        })),
        ...(dataset.author || dataset.author_email
            ? [
                  {
                      name: dataset.author,
                      email: dataset.author_email,
                  },
              ]
            : []),
    ].filter((entry) => hasValue(entry.name) || hasValue(entry.email));

    const maintainers = [
        ...(dataset.maintainers ?? []).map((maintainer) => ({
            name: maintainer.name,
            email: maintainer.email,
        })),
        ...(dataset.maintainer || dataset.maintainer_email
            ? [
                  {
                      name: dataset.maintainer,
                      email: dataset.maintainer_email,
                  },
              ]
            : []),
    ].filter((entry) => hasValue(entry.name) || hasValue(entry.email));

    return { authors, maintainers };
}

export function hasContactDetails(dataset: WriDataset): boolean {
    const { authors, maintainers } = getContactEntries(dataset);

    return authors.length > 0 || maintainers.length > 0;
}

function ContactCard({ entry, role }: { entry: ContactEntry; role: string }) {
    if (!hasValue(entry.name) && !hasValue(entry.email)) {
        return null;
    }

    return (
        <div
            style={{
                padding: getThemedSpacing(400),
                borderRadius: getThemedRadius(300),
                border: `${getThemedBorderWidth(100)} solid ${getThemedColor('neutral', 300)}`,
            }}
        >
            <div className="pt-2">
                {hasValue(entry.name) && <p>{entry.name}</p>}
                <div
                    style={{
                        color: getThemedColor('neutral', 600),
                        fontSize: getThemedFontSize(300),
                    }}
                >
                    {role}
                </div>
                {hasValue(entry.email) && (
                    <div
                        style={{
                            color: getThemedColor('secondary', 800),
                        }}
                    >
                        {entry.email}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function ContactDetailsSection({ dataset }: Props) {
    const { authors, maintainers } = getContactEntries(dataset);

    const cards = [
        ...authors.map((entry, index) => ({
            key: `author-${index}`,
            role: 'Author',
            entry,
        })),
        ...maintainers.map((entry, index) => ({
            key: `maintainer-${index}`,
            role: 'Maintainer',
            entry,
        })),
    ];

    return (
        <section id="contact-details">
            <h2
                style={{
                    fontSize: getThemedFontSize(700),
                    fontWeight: 700,
                    paddingBottom: getThemedSpacing(300),
                }}
            >
                Contact details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {cards.map((card) => (
                    <ContactCard key={card.key} entry={card.entry} role={card.role} />
                ))}
            </div>
        </section>
    );
}
