import { useEffect, useRef, useState } from 'react'

import { useMutation } from '@tanstack/react-query'
import { jsonSchema, streamObject } from 'ai'
import { createXai } from '@ai-sdk/xai'

import { Button } from '@fluentui/react-components'
import { RefreshCwIcon, UploadCloudIcon } from 'lucide-react'

import { useSettings } from '../settings'
import { judges } from '../../constants'
import { useFileDrag } from '../../hooks/use-file-drag'

interface Result {
    verdict: 'smash' | 'pass'
    rating: '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10'
    explanation: string
}

async function resize(
    file: File,
    {
        width: maxWidth,
        height: maxHeight,
        quality = 0.8
    }: {
        width: number
        height: number
        quality?: number
    }
) {
    const bitmap = await createImageBitmap(file)
    let { width, height } = bitmap

    const ratio = Math.min(maxWidth / width, maxHeight / height, 1)
    width *= ratio
    height *= ratio

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height

    const ctx = canvas.getContext('2d')!
    ctx.drawImage(bitmap, 0, 0, width, height)

    return new Promise<Blob>((resolve) =>
        canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', quality)
    )
}

export default function Result() {
    const [result, setResult] = useState<Partial<Result> | null>(null)
    const [preview, setPreview] = useState<string | null>(null)
    const uploadButtonRef = useRef<HTMLInputElement>(null)

    const isDragging = useFileDrag()
    const { apiKey, model, judge } = useSettings()

    const xai = createXai({
        apiKey
    })(model)

    const {
        mutate: generate,
        isPending,
        error
    } = useMutation({
        mutationKey: ['xai', 'generate'],
        async mutationFn() {
            const file = uploadButtonRef.current?.files?.[0]
            if (!file) throw new Error('No file selected')

            if (!apiKey) throw new Error('API key is missing')
            if (!model) throw new Error('Model is missing')

            setResult(null)
            setPreview(URL.createObjectURL(file))

            const image = await resize(file, {
                width: 1500,
                height: 1500
            })

            const { partialObjectStream } = streamObject({
                model: xai,
                schema: jsonSchema<Result>({
                    type: 'object',
                    properties: {
                        verdict: {
                            type: 'string',
                            enum: ['smash', 'pass'],
                            description: 'The verdict on the image.'
                        },
                        rating: {
                            type: 'string',
                            enum: [
                                '1',
                                '2',
                                '3',
                                '4',
                                '5',
                                '6',
                                '7',
                                '8',
                                '9',
                                '10'
                            ],
                            description: 'The rating of the image from 1 to 10.'
                        },
                        explanation: {
                            type: 'string',
                            description: 'The straightforward explanation'
                        }
                    },
                    required: ['verdict', 'rating', 'explanation']
                }),
                prompt: [
                    {
                        role: 'system',
                        content: judges[judge]
                    },
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'file',
                                mediaType: 'image/jpeg',
                                data: await image.arrayBuffer()
                            }
                        ]
                    }
                ]
            })

            for await (const partialObject of partialObjectStream)
                setResult(partialObject)
        }
    })

    const showUploadDialog = () => uploadButtonRef.current?.click()

    return (
        <main className="flex flex-col md:flex-row justify-center w-full max-w-4xl gap-6 mx-auto">
            <input
                className={
                    isDragging
                        ? 'fixed z-50 top-0 left-0 w-full h-screen opacity-50'
                        : 'hidden appearance-none'
                }
                ref={uploadButtonRef}
                type="file"
                accept="image/*"
                onChange={(event) => {
                    const file = event.target.files?.[0]
                    if (!file) return

                    generate()
                }}
            />

            <div
                className={`max-w-lg md:max-w-md mx-auto ${preview ? '' : 'w-full'}`}
            >
                {preview ? (
                    <div className="sticky top-4 w-full rounded-2xl overflow-hidden shadow-lg shadow-black/15">
                        <img
                            src={preview}
                            alt="Preview"
                            className="w-full"
                            onClick={showUploadDialog}
                        />
                        <button
                            className="absolute z-10 top-0 left-0 flex flex-col justify-center items-center w-full h-full bg-black/50 text-white text-lg font-medium opacity-0 hocus:opacity-100 disabled:!opacity-0 transition-opacity duration-200 ease-out cursor-pointer disabled:cursor-progress"
                            onClick={showUploadDialog}
                            disabled={isPending}
                        >
                            <UploadCloudIcon size={64} strokeWidth={1} />
                            Upload Image
                        </button>
                        {isPending && (
                            <div className="absolute z-20 bottom-0 left-0 flex gap-4 flex-col justify-end items-center w-full py-4 text-white text-lg font-medium bg-gradient-to-t from-black/70 to-transparent">
                                <img
                                    src="/numby.gif"
                                    alt="Generating..."
                                    className="w-24 h-24"
                                />
                                Chief is cooking...
                            </div>
                        )}
                    </div>
                ) : (
                    <button
                        className="flex flex-col justify-center items-center text-lg text-blue-500 w-full max-w-lg md:max-w-sm aspect-3/4 md:aspect-square rounded-2xl bg-blue-500/5 ring-6 ring-blue-500/10 hocus:bg-blue-500/10 hocus:ring-12 hocus:ring-blue-500/20 transition-all duration-200 ease-out cursor-pointer mx-auto"
                        onClick={showUploadDialog}
                    >
                        <UploadCloudIcon size={64} strokeWidth={1} />
                        Upload Image
                    </button>
                )}
            </div>

            {(result || isPending || error) && (
                <article className="flex flex-col gap-2 w-full max-w-lg md:max-w-md pb-8 mx-auto">
                    {error && (
                        <p className="text-lg text-red-600 font-medium">
                            {
                                // @ts-ignore
                                error?.error ??
                                    error?.message ??
                                    'Unknown error occurred while processing the image.'
                            }
                        </p>
                    )}

                    {result ? (
                        <>
                            <h2 className="text-2xl lg:text-3xl font-bold capitalize">
                                {result.verdict} ({result.rating} / 10)
                            </h2>
                            <p className="text-gray-600 text-lg">
                                {result.explanation}
                            </p>
                            <Button
                                icon={<RefreshCwIcon size={18} />}
                                size="large"
                                className="!mt-4"
                                onClick={() => generate()}
                            >
                                Regenerate
                            </Button>
                        </>
                    ) : (
                        <>
                            <div className="w-full h-10 mb-2 bg-gray-100 rounded-lg animate-pulse" />
                            <div className="w-full h-6 bg-gray-100 rounded-lg animate-pulse" />
                            <div className="w-full h-6 bg-gray-100 rounded-lg animate-pulse" />
                            <div className="w-full h-6 bg-gray-100 rounded-lg animate-pulse" />
                            <div className="w-full h-6 bg-gray-100 rounded-lg animate-pulse" />
                            <div className="w-full h-6 bg-gray-100 rounded-lg animate-pulse" />
                            <div className="w-full h-6 bg-gray-100 rounded-lg animate-pulse" />
                            <div className="w-full h-6 bg-gray-100 rounded-lg animate-pulse" />
                            <div className="w-1/2 h-6 bg-gray-100 rounded-lg animate-pulse" />
                        </>
                    )}
                </article>
            )}
        </main>
    )
}
