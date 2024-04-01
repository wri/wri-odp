import Link from 'next/link'
import { HttpMethodChip } from './HttpMethodChip'
import { DefaultTooltip } from '@/components/_shared/Tooltip'
import { Button } from '@/components/_shared/Button'
import { DocumentDuplicateIcon } from '@heroicons/react/24/outline'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'

export const QueryEndpoint = ({
    description,
    url,
    method = 'GET',
    body = '',
    lang = '',
    headers = {},
}: {
    description: string
    url: string
    method?: string
    body?: string
    lang?: string
    headers?: Record<string, string>
}) => {
    return (
        <div className="mb-10 pr-5">
            <div className="font-acumin text-base font-normal text-zinc-800">
                {description}
            </div>
            <div className="rounded-sm border border-zinc-300 bg-white px-5 py-4 my-5">
                <div className="font-acumin text-base font-light text-stone-500 flex justify-between">
                    <div className="flex justify-between w-full space-x-2">
                        <div className="flex items-center">
                            <div className="">
                                <HttpMethodChip className="mr-5">
                                    {method}
                                </HttpMethodChip>
                            </div>
                            <Link target="_blank" href={url}>
                                {url}
                            </Link>
                        </div>
                        <div>
                            <CopyButton content={url} />
                        </div>
                    </div>
                </div>
            </div>
            {Object.keys(headers).length > 0 && (
                <div className="mb-4 bg-slate-50 p-4">
                    {Object.entries(headers).map(([key, value]) => (
                        <div key={key} className="flex items-center mt-2">
                            <div className="font-medium mr-2">{key}:</div>
                            <div>{value}</div>
                        </div>
                    ))}
                </div>
            )}
            {body && body != '' && (
                <div className="relative">
                    <div className="absolute right-5 top-5">
                        <CopyButton content={body} />
                    </div>
                    <SyntaxHighlighter language={lang}>
                        {body}
                    </SyntaxHighlighter>
                </div>
            )}
        </div>
    )
}

export const SnippetEndpoint = ({
    description,
    snippet,
    language,
}: {
    description: string
    snippet: string
    language: 'javascript' | 'python' | 'r'
}) => {
    return (
        <div className="mb-10 pr-5">
            <div className="font-acumin text-base font-normal text-zinc-800">
                {description}
            </div>
            {snippet && snippet != '' && (
                <div className="relative">
                    <div className="absolute right-5 top-5">
                        <CopyButton content={snippet} />
                    </div>
                    <SyntaxHighlighter language={language}>
                        {snippet}
                    </SyntaxHighlighter>
                </div>
            )}
        </div>
    )
}

const CopyButton = ({ content }: { content: string }) => {
    return (
        <DefaultTooltip content="Copy to clipboard">
            <Button
                className=" h-auto rounded-full p-2"
                onClick={() => {
                    navigator.clipboard.writeText(content)
                }}
            >
                <DocumentDuplicateIcon className="w-3 text-white" />
            </Button>
        </DefaultTooltip>
    )
}

export const getJsSnippet = (
    url: string,
    method: string = 'GET',
    body: string = ''
) => {
    return `const response = await fetch(
    \`${url}\`, 
    { 
        method: "${method}",${
            body
                ? `\n\t\tbody: JSON.stringify(${body}),\n\t\theaders: {\n\t\t\t"Content-Type": "application/json"\n\t\t}`
                : ''
        }
    }
);

const data = await response.json();

console.log(data);
`
}

export const getPythonSnippet = (
    url: string,
    method: string = 'GET',
    body: string = ''
) => {
    return `import requests

response = requests.request(
    "${method}",
    "${url}",
    ${body ? `data=${body}, headers={"Content-Type": "application/json"}` : ''}
)

data = response.json()

print(data)
`
}

export const getRSnippet = (
    url: string,
    method: string = 'GET',
    body: string = ''
) => {
    return `library(httr)

response <- httr::VERB(
    "${method}",
    "${url}",
    ${
        body
            ? `body = toJSON(${body}), add_headers("Content-Type" = "application/json")`
            : ''
    }
)

data <- httr::content(response, "parsed")

print(data)
`
}
