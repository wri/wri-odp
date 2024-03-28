import React, { useCallback, useEffect, useState } from 'react'
// => Tiptap packages
import Placeholder from '@tiptap/extension-placeholder'
import {
    useEditor,
    EditorContent,
    Editor,
    BubbleMenu,
    ReactNodeViewRenderer,
} from '@tiptap/react'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import Text from '@tiptap/extension-text'
import Link from '@tiptap/extension-link'
import Bold from '@tiptap/extension-bold'
import Underline from '@tiptap/extension-underline'
import Italic from '@tiptap/extension-italic'
import Strike from '@tiptap/extension-strike'
import Code from '@tiptap/extension-code'
import BulletList from '@tiptap/extension-bullet-list'
import ListItem from '@tiptap/extension-list-item'
import History from '@tiptap/extension-history'
// Custom
import * as Icons from './Icons'
import { LinkModal } from './LinkModal'
import classNames from '@/utils/classnames'
import {
    Controller,
    FieldValues,
    Path,
    PathValue,
    UseFormReturn,
} from 'react-hook-form'
import { Button } from '@/components/_shared/Button'
import { NodeViewContent, NodeViewWrapper } from '@tiptap/react'
import { createLowlight } from 'lowlight'

import python from 'highlight.js/lib/languages/python'
import js from 'highlight.js/lib/languages/javascript'
import r from 'highlight.js/lib/languages/r'

const lowlight = createLowlight()

lowlight.register('python', python)
lowlight.register('r', r)
lowlight.register('js', js)

interface TEditorProps {
    value: string
    onChange(body: string): void
    initialContent?: string | null
    className: string
    placeholder?: string
}

interface ControlleRTEEditorProps<T extends FieldValues> {
    formObj: UseFormReturn<T>
    name: Path<T>
    defaultValue?: PathValue<T, Path<T>>
    className?: string
    placeholder?: string
}

export function SimpleEditor<T extends FieldValues>({
    formObj,
    name,
    defaultValue,
    placeholder,
    className,
}: ControlleRTEEditorProps<T>) {
    const { control, watch } = formObj
    return (
        <Controller
            control={control}
            name={name}
            render={({ field: { onChange, value } }) => (
                <TipTapEditor
                    placeholder={placeholder}
                    className={className ?? ''}
                    value={value}
                    initialContent={watch(name) ?? ''}
                    onChange={(value) => {
                        onChange(value)
                    }}
                />
            )}
        />
    )
}

function TipTapEditor({
    value,
    onChange,
    initialContent,
    className,
    placeholder,
}: TEditorProps) {
    const editor = useEditor({
        onUpdate({ editor }) {
            const value = editor.getHTML()
            onChange(value)
        },
        content: initialContent ?? '',
        extensions: [
            Document,
            History,
            Paragraph,
            Text,
            Link.configure({
                openOnClick: false,
            }),
            Bold,
            Underline,
            Italic,
            Strike,
            Code,
            CodeBlockLowlight.extend({
                addNodeView() {
                    return ReactNodeViewRenderer(CodeBlockComponent)
                },
            }).configure({ lowlight }),
            Placeholder.configure({
                // Use a placeholder:
                placeholder: placeholder ?? '',
            }),
            BulletList,
            ListItem.configure({
                HTMLAttributes: {
                    class: 'list-disc',
                },
            }),
        ],
    }) as Editor

    const [modalIsOpen, setIsOpen] = useState(false)
    const [url, setUrl] = useState<string>('')

    const openModal = useCallback(() => {
        setUrl(editor.getAttributes('link').href)
        setIsOpen(true)
    }, [editor])

    const closeModal = useCallback(() => {
        setIsOpen(false)
        setUrl('')
    }, [])

    const saveLink = useCallback(() => {
        if (url) {
            editor
                .chain()
                .focus()
                .extendMarkRange('link')
                .setLink({ href: url, target: '_blank' })
                .run()
        } else {
            editor.chain().focus().extendMarkRange('link').unsetLink().run()
        }
        closeModal()
    }, [editor, url, closeModal])

    const removeLink = useCallback(() => {
        editor.chain().focus().extendMarkRange('link').unsetLink().run()
        closeModal()
    }, [editor, closeModal])

    const toggleBold = useCallback(() => {
        editor.chain().focus().toggleBold().run()
    }, [editor])

    const toggleUnderline = useCallback(() => {
        editor.chain().focus().toggleUnderline().run()
    }, [editor])

    const toggleItalic = useCallback(() => {
        editor.chain().focus().toggleItalic().run()
    }, [editor])

    const toggleStrike = useCallback(() => {
        editor.chain().focus().toggleStrike().run()
    }, [editor])

    const toggleCode = useCallback(() => {
        editor.chain().focus().toggleCode().run()
    }, [editor])

    const toggleList = useCallback(() => {
        editor.chain().focus().toggleBulletList().run()
    }, [editor])

    const toggleCodeBlock = useCallback(() => {
        editor.chain().focus().toggleCodeBlock().run()
    }, [editor])

    if (!editor) {
        return null
    }

    return (
        <div
            className={classNames(
                'editor flex flex-col h-full min-h-[350px]',
                className
            )}
        >
            <div className="menu">
                <button
                    aria-label="Undo"
                    type="button"
                    className="menu-button hover:bg-neutral-50"
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                >
                    <Icons.RotateLeft />
                </button>
                <button
                    aria-label="Redo"
                    type="button"
                    className="menu-button hover:bg-neutral-50"
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                >
                    <Icons.RotateRight />
                </button>
                <button
                    aria-label="Link"
                    type="button"
                    className={classNames('menu-button hover:bg-neutral-50', {
                        'is-active': editor.isActive('link'),
                    })}
                    onClick={openModal}
                >
                    <Icons.Link />
                </button>
                <button
                    aria-label="Bold"
                    type="button"
                    className={classNames('menu-button hover:text-blue-800', {
                        'is-active': editor.isActive('bold'),
                    })}
                    onClick={toggleBold}
                >
                    <Icons.Bold />
                </button>
                <button
                    aria-label="Underline"
                    type="button"
                    className={classNames('menu-button', {
                        'is-active': editor.isActive('underline'),
                    })}
                    onClick={toggleUnderline}
                >
                    <Icons.Underline />
                </button>
                <button
                    aria-label="Italic"
                    type="button"
                    className={classNames('menu-button', {
                        'is-active': editor.isActive('intalic'),
                    })}
                    onClick={toggleItalic}
                >
                    <Icons.Italic />
                </button>
                <button
                    aria-label="Strike"
                    type="button"
                    className={classNames('menu-button', {
                        'is-active': editor.isActive('strike'),
                    })}
                    onClick={toggleStrike}
                >
                    <Icons.Strikethrough />
                </button>
                <button
                    aria-label="Code"
                    type="button"
                    className={classNames('menu-button', {
                        'is-active': editor.isActive('code'),
                    })}
                    onClick={toggleCode}
                >
                    <Icons.Code />
                </button>
                <button
                    aria-label="List"
                    type="button"
                    className={classNames('menu-button', {
                        'is-active': editor.isActive('bulletList'),
                    })}
                    onClick={toggleList}
                >
                    <Icons.ListItem className="w-5" />
                </button>
                <button
                    aria-label="Code"
                    type="button"
                    className={classNames('menu-button', {
                        'is-active': editor.isActive('code'),
                    })}
                    onClick={toggleCodeBlock}
                >
                    <Icons.HighlightedCode />
                </button>
            </div>

            <BubbleMenu
                className="bubble-menu-light"
                tippyOptions={{ duration: 150 }}
                editor={editor}
                shouldShow={({ editor, view, state, oldState, from, to }) => {
                    // only show the bubble menu for links.
                    return from === to && editor.isActive('link')
                }}
            >
                <Button
                    aria-label="Edit"
                    size="sm"
                    variant="outline"
                    type="button"
                    className="bg-white"
                    onClick={openModal}
                >
                    Edit
                </Button>
                <Button
                    aria-label="Remove"
                    size="sm"
                    variant="destructive"
                    onClick={removeLink}
                    type="button"
                >
                    Remove
                </Button>
            </BubbleMenu>

            <EditorContent
                className="h-full grow flex flex-col"
                editor={editor}
            />

            <LinkModal
                url={url}
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                contentLabel="Edit Link Modal"
                closeModal={closeModal}
                onChangeUrl={(e) => setUrl(e.target.value)}
                onSaveLink={saveLink}
                onRemoveLink={removeLink}
            />
        </div>
    )
}

function CodeBlockComponent({
    node: {
        attrs: { language: defaultLanguage },
    },
    updateAttributes,
    extension,
}) {
    return (
        <NodeViewWrapper className="code-block">
            <select
                contentEditable={false}
                defaultValue={defaultLanguage}
                onChange={(event) =>
                    updateAttributes({ language: event.target.value })
                }
            >
                <option value="null">auto</option>
                <option disabled>—</option>
                {extension.options.lowlight
                    .listLanguages()
                    .map((lang, index) => (
                        <option key={index} value={lang}>
                            {lang}
                        </option>
                    ))}
            </select>
            <pre>
                <NodeViewContent as="code" />
            </pre>
        </NodeViewWrapper>
    )
}
