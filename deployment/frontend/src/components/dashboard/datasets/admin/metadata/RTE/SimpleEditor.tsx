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
    const {control} = formObj
    return (
        <Controller
            control={control}
            name={name}
            defaultValue={defaultValue}
            render={({ field: { onChange, value } }) => (
                <TipTapEditor
                    value={value}
                    initialContent={defaultValue}
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
        editor?.commands.setContent(initialContent as string)
    }, [initialContent, editor])

    const [modalIsOpen, setIsOpen] = useState(false)
    const [url, setUrl] = useState<string>('')

    const openModal = useCallback(() => {
        console.log(editor.chain().focus())
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
        <div className="editor">
            <div className="menu">
                <button
                    className="menu-button"
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                >
                    <Icons.RotateLeft />
                </button>
                <button
                    className="menu-button"
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                >
                    <Icons.RotateRight />
                </button>
                <button
                    className={classNames('menu-button', {
                        'is-active': editor.isActive('link'),
                    })}
                    onClick={openModal}
                >
                    <Icons.Link />
                </button>
                <button
                    className={classNames('menu-button', {
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
                <button className="button" onClick={openModal}>
                    Edit
                </button>
                <button className="button-remove" onClick={removeLink}>
                    Remove
                </button>
            </BubbleMenu>

            <EditorContent editor={editor} />

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
