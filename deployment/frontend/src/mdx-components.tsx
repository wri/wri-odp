import type { MDXComponents } from 'mdx/types'
import Image, { ImageProps } from 'next/image'

// function Hs(props) {
//     return (
//         <>
//             <a id={props.children?.toString().replaceAll(' ', '-')} />
//             <h1>{props.children}</h1>
//         </>
//     )
// }

export function useMDXComponents(components: MDXComponents): MDXComponents {
    return {
        // Allows customizing built-in components, e.g. to add styling.
        h1: (props) => (
            <>
                <a id={props.children?.toString().replaceAll(' ', '-')} />
                <h1>{props.children}</h1>
            </>
        ),
        h2: (props) => (
            <>
                <a id={props.children?.toString().replaceAll(' ', '-')} />
                <h2>{props.children}</h2>
            </>
        ),
        h3: (props) => (
            <>
                <a id={props.children?.toString().replaceAll(' ', '-')} />
                <h3>{props.children}</h3>
            </>
        ),
        h4: (props) => (
            <>
                <a id={props.children?.toString().replaceAll(' ', '-')} />
                <h4>{props.children}</h4>
            </>
        ),
        h5: (props) => (
            <>
                <a id={props.children?.toString().replaceAll(' ', '-')} />
                <h5>{props.children}</h5>
            </>
        ),
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
