import { ReactNode } from 'react'

export default function Chip({ text }: { text: string }) {
    return (
        <div>
            <span className="ml-2 px-3 py-1 text-xs font-light border border-wri-light-gray opacity-50 rounded-2xl">
                {text}
            </span>
        </div>
    )
}
