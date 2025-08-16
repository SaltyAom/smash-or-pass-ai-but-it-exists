import { useRef, useState } from 'react'

import { useMutation } from '@tanstack/react-query'
import { createXai } from '@ai-sdk/xai'

import { RefreshCwIcon, UploadCloudIcon } from 'lucide-react'

import { useSettings } from '../settings'
import { judges } from '../../constants'
import { Button, Skeleton } from '@fluentui/react-components'

interface Result {
    verdict: 'smash' | 'pass'
    rating: '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10'
    explanation: string
}

const toBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
    })

export default function Result() {
    const [preview, setPreview] = useState<string | null>(null)
    const uploadButtonRef = useRef<HTMLInputElement>(null)
    const showUploadDialog = () => uploadButtonRef.current?.click()

    const { apiKey, model, judge } = useSettings()

    const xai = createXai({
        apiKey
    })(model)

    const {
        mutate: generate,
        data,
        isPending,
        error
    } = useMutation({
        mutationKey: ['xai', 'generate'],
        async mutationFn() {
            const file = uploadButtonRef.current?.files?.[0]
            if (!file) throw new Error('No file selected')

            if (!apiKey) throw new Error('API key is missing')
            if (!model) throw new Error('Model is missing')

            setPreview(URL.createObjectURL(file))
            const base64 = await toBase64(file)

            const response = await xai.doGenerate({
                responseFormat: {
                    type: 'json',
                    schema: {
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
                                description:
                                    'The rating of the image from 1 to 10.'
                            },
                            explanation: {
                                type: 'string',
                                description: 'The straightforward explanation'
                            }
                        },
                        required: ['result']
                    }
                },
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
                                // AI SDK automatically appends 'data:image/jpeg;base64,'
                                // so we need to slice it off
                                data: base64.slice(base64.indexOf(',') + 1)
                            }
                        ]
                    }
                ]
            })

            const content = response.content?.[0]
            if (content.type !== 'text')
                throw new Error(
                    'Unknown error occurred while processing the image.'
                )

            return JSON.parse(content.text) as Result
        }
    })

    return (
        <main className="flex flex-col md:flex-row justify-center w-full max-w-4xl gap-6 mx-auto">
            <input
                className="hidden"
                ref={uploadButtonRef}
                type="file"
                accept="image/*"
                onChange={(event) => {
                    const file = event.target.files?.[0]
                    if (!file) return

                    generate()
                }}
            />

            <div className={`max-w-lg md:max-w-md mx-auto ${preview ? '' : 'w-full'}`}>
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
                                The judge is cooking...
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

            {(data || isPending || error) && (
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

                    {data ? (
                        <>
                            <h2 className="text-2xl lg:text-3xl font-bold capitalize">
                                {data.verdict} ({data.rating} / 10)
                            </h2>
                            <p className="text-gray-600 text-lg">
                                {data.explanation}
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
