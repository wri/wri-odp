interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode
}

export default function IconButton({ children, ...props }: IconButtonProps) {

    return <button {...props} className={`${props?.className ?? ""} bg-white hover:bg-gray-100 transition w-12 h-12 flex items-center justify-center shadow`} >{children}</button>
}
