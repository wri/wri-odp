import { type ReactNode } from 'react';

type Props = {
    children: ReactNode;
    banner?: ReactNode;
};

export default function DatasetV2Layout({ children, banner }: Props) {
    return (
        <div className="flex flex-col min-h-screen">
            {banner && (
                <div className="sticky top-0 z-[110] flex items-center bg-slate-100 shadow-sm">
                    {banner}
                </div>
            )}
            <main className="flex-1">{children}</main>
        </div>
    );
}
