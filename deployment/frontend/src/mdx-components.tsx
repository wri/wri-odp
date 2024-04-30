import type { MDXComponents } from 'mdx/types'
import Image, { ImageProps } from 'next/image'

export function useMDXComponents(components: MDXComponents): MDXComponents {
    return {
        // Allows customizing built-in components, e.g. to add styling.
        // h1: ({ children }) => (
        //     <h1 style={{ color: 'red', fontSize: '48px' }}>{children}</h1>
        // ),
        a: (props) => (
            <a {...props} className=" text-blue-500">
                {props.children}
            </a>
        ),
        img: (props) => (
            <Image
                sizes="100vw"
                style={{ width: '100%', height: 'auto' }}
                {...(props as ImageProps)}
            />
        ),
        ...components,
    }
}
