import React, { useCallback, useEffect, useState } from 'react'
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
import { Controller, FieldValues, Path, PathValue, UseFormReturn } from 'react-hook-form'
import { Button } from '@/components/_shared/Button'

interface TEditorProps {
    value: string
    onChange(body: string): void
    initialContent?: string | null
}

interface ControlleRTEEditorProps<T extends FieldValues> {
    formObj: UseFormReturn<T>
    name: Path<T>
    defaultValue?: PathValue<T, Path<T>>
}

export function SimpleEditor<T extends FieldValues>({formObj, name, defaultValue}: ControlleRTEEditorProps<T>) {
    const {control, watch } = formObj
    return (
        <Controller
            control={control}
            name={name}
            render={({ field: { onChange, value } }) => (
                <TipTapEditor
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
        <div className="editor flex flex-col h-full min-h-[350px]">
            <div className="menu">
                <button
                    className="menu-button hover:bg-neutral-50"
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                >
                    <Icons.RotateLeft />
                </button>
                <button
                    className="menu-button hover:bg-neutral-50"
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                >
                    <Icons.RotateRight />
                </button>
                <button
                    className={classNames('menu-button hover:bg-neutral-50', {
                        'is-active': editor.isActive('link'),
                    })}
                    onClick={openModal}
                >
                    <Icons.Link />
                </button>
                <button
                    className={classNames('menu-button hover:text-blue-800', {
                        'is-active': editor.isActive('bold'),
                    })}
                    onClick={toggleBold}
                >
                    <Icons.Bold />
                </button>
                <button
                    className={classNames('menu-button', {
                        'is-active': editor.isActive('underline'),
                    })}
                    onClick={toggleUnderline}
                >
                    <Icons.Underline />
                </button>
                <button
                    className={classNames('menu-button', {
                        'is-active': editor.isActive('intalic'),
                    })}
                    onClick={toggleItalic}
                >
                    <Icons.Italic />
                </button>
                <button
                    className={classNames('menu-button', {
                        'is-active': editor.isActive('strike'),
                    })}
                    onClick={toggleStrike}
                >
                    <Icons.Strikethrough />
                </button>
                <button
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
                <Button size="sm" variant="outline" className='bg-white' onClick={openModal}>
                    Edit
                </Button>
                <Button size="sm" variant="destructive" onClick={removeLink}>
                    Remove
                </Button>
            </BubbleMenu>

            <EditorContent className='h-full grow flex flex-col' editor={editor} />

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
