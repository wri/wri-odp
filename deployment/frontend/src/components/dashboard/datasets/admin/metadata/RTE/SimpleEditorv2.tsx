import React, { useCallback, useEffect, useState, useRef } from 'react'
// => Tiptap packages
import { useEditor, EditorContent, Editor, BubbleMenu } from '@tiptap/react'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Link from '@tiptap/extension-link'
import Bold from '@tiptap/extension-bold'
import Underline from '@tiptap/extension-underline'
import Italic from '@tiptap/extension-italic'
import Strike from '@tiptap/extension-strike'
import Code from '@tiptap/extension-code'
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

interface TEditorProps {
    value: string
    onChange(body: string): void
    initialContent?: string | null
    className: string
    isSubmitting?: boolean
}

interface ControlleRTEEditorProps<T extends FieldValues> {
    formObj: UseFormReturn<T>
    name: Path<T>
    defaultValue?: PathValue<T, Path<T>>
    className?: string
    isSubmitting?: boolean
}

export function SimpleEditorV2<T extends FieldValues>({
    formObj,
    name,
    defaultValue,
    className,
    isSubmitting,
}: ControlleRTEEditorProps<T>) {
    const { control, watch } = formObj
    return (
        <Controller
            control={control}
            name={name}
            render={({ field: { onChange, value } }) => (
                <>
                    {!isSubmitting && (
                        <TipTapEditor
                            className={className ?? ''}
                            value={value}
                            isSubmitting={isSubmitting}
                            initialContent={watch(name) ?? ''}
                            onChange={(value) => {
                                onChange(value)
                            }}
                        />
                    )}
                </>
            )}
        />
    )
}

function TipTapEditor({
    value,
    onChange,
    initialContent,
    className,
    isSubmitting,
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
        ],
    }) as Editor

    useEffect(() => {
        if (isSubmitting) {
            editor.commands.setContent('')
        }
    }, [isSubmitting, editor])

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
                    type="button"
                    className="menu-button hover:bg-neutral-50"
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                >
                    <Icons.RotateLeft />
                </button>
                <button
                    type="button"
                    className="menu-button hover:bg-neutral-50"
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                >
                    <Icons.RotateRight />
                </button>
                <button
                    type="button"
                    className={classNames('menu-button hover:bg-neutral-50', {
                        'is-active': editor.isActive('link'),
                    })}
                    onClick={openModal}
                >
                    <Icons.Link />
                </button>
                <button
                    type="button"
                    className={classNames('menu-button hover:text-blue-800', {
                        'is-active': editor.isActive('bold'),
                    })}
                    onClick={toggleBold}
                >
                    <Icons.Bold />
                </button>
                <button
                    type="button"
                    className={classNames('menu-button', {
                        'is-active': editor.isActive('underline'),
                    })}
                    onClick={toggleUnderline}
                >
                    <Icons.Underline />
                </button>
                <button
                    type="button"
                    className={classNames('menu-button', {
                        'is-active': editor.isActive('intalic'),
                    })}
                    onClick={toggleItalic}
                >
                    <Icons.Italic />
                </button>
                <button
                    type="button"
                    className={classNames('menu-button', {
                        'is-active': editor.isActive('strike'),
                    })}
                    onClick={toggleStrike}
                >
                    <Icons.Strikethrough />
                </button>
                <button
                    type="button"
                    className={classNames('menu-button', {
                        'is-active': editor.isActive('code'),
                    })}
                    onClick={toggleCode}
                >
                    <Icons.Code />
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
                    size="sm"
                    variant="outline"
                    type="button"
                    className="bg-white"
                    onClick={openModal}
                >
                    Edit
                </Button>
                <Button
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
