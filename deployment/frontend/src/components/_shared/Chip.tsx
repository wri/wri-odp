import { ReactNode } from 'react'

export default function Chip({ text, className = "ml-2" }: { text: string, className?: string }) {
    return (
        <div>
            <span className={`${className} px-3 py-1 text-xs font-light border border-wri-light-gray opacity-50 rounded-2xl`}>
                {text}
            </span>
        </div>
    )
}
