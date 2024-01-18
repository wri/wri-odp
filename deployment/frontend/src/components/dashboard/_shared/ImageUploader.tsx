import React, { useRef, useState } from 'react'
import Uppy, { type UploadResult, type UppyFile } from '@uppy/core'

import '@uppy/core/dist/style.min.css'
import AwsS3 from '@uppy/aws-s3'
import { getUploadParameters } from '@/utils/uppyFunctions'
import { ArrowUpTrayIcon } from '@heroicons/react/24/outline'
import { MinusCircleIcon } from '@heroicons/react/20/solid'
import { Button } from '@/components/_shared/Button'
import { api } from '@/utils/api'

export function ImageUploader({
    onUploadSuccess,
    onPresignedUrlSuccess,
    onUploadStart,
    text = 'Upload image',
    clearImage,
    defaultImage,
}: {
    onUploadSuccess: (result: UploadResult) => void
    onPresignedUrlSuccess?: (response: string) => void
    onUploadStart?: () => void
    clearImage?: () => void
    text?: string
    defaultImage?: string | null
}) {
    const [key, setKey] = useState<string | null>(null)
    const [uploading, setIsUploading] = useState(false)
    const uploadInputRef = useRef<HTMLInputElement>(null)
    const presignedGetUrl = api.uploads.getPresignedUrl.useQuery(
        { key: key as string },
        {
            enabled: !!key,
            onSuccess: (data) => {
                if (onPresignedUrlSuccess) onPresignedUrlSuccess(data)
            },
        }
    )
    const uppy = React.useMemo(() => {
        const uppy = new Uppy({
            autoProceed: true,
            restrictions: {
                maxNumberOfFiles: 1,
            },
        }).use(AwsS3, {
            id: 'AwsS3',
            getUploadParameters: (file: UppyFile) =>
                getUploadParameters(file, 'ckan/storage/uploads/group'),
        })
        return uppy
    }, [])

    function upload() {
        uppy.upload().then((result) => {
            setIsUploading(false)
            if (result && result.successful[0]) {
                let paths = new URL(result.successful[0].uploadURL).pathname
                    .substring(1)
                    .split('/')
                const key = paths.slice(0, paths.length).join('/')
                uppy.setState({ ...uppy.getState(), files: [] })
                setKey(key)
                if (uploadInputRef && uploadInputRef.current)
                    uploadInputRef.current.value = ''
            }

            if (result.failed.length > 0) {
                result.failed.forEach((file) => {
                    console.error(file.error)
                })
            }
        })
    }

    function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        const files = e.target.files
        if (!files || !files[0]) return
        uppy.addFile({
            name: files[0].name,
            type: files[0].type,
            data: files[0],
        })
        upload()
    }

    uppy.on('complete', (result) => {
        onUploadSuccess(result)
    })
    uppy.on('upload', (_result) => {
        setIsUploading(true)
        if (onUploadStart) onUploadStart()
    })

    return (
        <>
            <button
                onClick={() => uploadInputRef.current?.click()}
                type="button"
                disabled={uploading}
                className="isolate relative w-full flex aspect-square flex-col group items-center justify-center md:gap-y-2 rounded-[0.188rem] border-2 border-b-amber-400 bg-white shadow transition hover:bg-amber-400"
            >
                {!uploading && !key && defaultImage && (
                    <>
                        <img
                            src={defaultImage}
                            alt=""
                            className="absolute inset-0 z-9 h-full w-full object-contain"
                        />
                        <div className="bg-white bg-opacity-0 transition group-hover:bg-opacity-90 absolute inset-0 group:z-10 h-full w-full object-cover" />
                    </>
                )}
                {!uploading && key && presignedGetUrl.data && (
                    <>
                        <img
                            src={presignedGetUrl.data}
                            alt=""
                            className="absolute inset-0 z-9 h-full w-full object-contain"
                        />
                        <div className="bg-white bg-opacity-0 transition group-hover:bg-opacity-90 absolute inset-0 group:z-10 h-full w-full object-cover" />
                    </>
                )}
                <input
                    ref={uploadInputRef}
                    onChange={(e) => onInputChange(e)}
                    type="file"
                    className="hidden"
                    accept="image/png image/jpeg image/svg"
                />
                {uploading ? (
                    <>
                        <svg
                            className="animate-spin  h-5 w-5 sm:h-9 sm:w-9 text-[#3654A5]"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            ></circle>
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                        </svg>
                        <div className="group-hover:z-20 font-acumin text-xs sm:text-sm font-normal text-black">
                            Loading
                        </div>
                    </>
                ) : (
                    <>
                        <ArrowUpTrayIcon className="group-hover:z-20 h-5 w-5 sm:h-9 sm:w-9 text-[#3654A5]" />
                        <div className="group-hover:z-20 font-acumin text-xs sm:text-sm font-normal text-black">
                            {text}
                        </div>
                    </>
                )}
            </button>
            {clearImage && (presignedGetUrl.data || defaultImage) && !uploading && (
                <div className="w-full flex justify-end">
                    <Button
                        type="button"
                        variant="destructive"
                        className="w-fit my-2"
                        size="sm"
                        onClick={() => {
                            clearImage()
                            setKey(null)
                        }}
                    >
                        <MinusCircleIcon className="h-5 w-5 text-white mr-2" />{' '}
                        Remove Image
                    </Button>
                </div>
            )}
        </>
    )
}
