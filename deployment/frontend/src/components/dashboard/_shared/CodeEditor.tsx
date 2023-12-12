import Editor from '@monaco-editor/react'
import {
    Controller,
    FieldValues,
    Path,
    UseFormReturn,
    useForm,
} from 'react-hook-form'

interface CodeEditorProps<T extends FieldValues> {
    height?: string
    formObj?: UseFormReturn<T>
    name: Path<T>
}

export function CodeEditor<T extends FieldValues>({
    height = '40vh',
    formObj,
    name,
}: CodeEditorProps<T>) {
    const { control } = formObj ?? useForm()
    return (
        <Controller
            control={control}
            name={name}
            render={({ field: { onChange, value } }) => (
                <Editor
                    value={value}
                    onChange={onChange}
                    height={height}
                    options={{
                        formatOnPaste: true,
                        formatOnType: true,
                    }}
                    defaultLanguage="json"
                    defaultValue="{}"
                />
            )}
        />
    )
}
