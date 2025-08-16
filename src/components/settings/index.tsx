import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import {
    Label,
    Input,
    Dialog,
    DialogTrigger,
    DialogSurface,
    DialogTitle,
    DialogBody,
    DialogActions,
    DialogContent,
    Button,
    ToolbarButton,
    Select,
    Tooltip,
    ToolbarToggleButton,
    TeachingPopover,
    TeachingPopoverSurface,
    TeachingPopoverHeader,
    TeachingPopoverBody,
    TeachingPopoverTitle,
    TeachingPopoverFooter,
    TeachingPopoverTrigger
} from '@fluentui/react-components'
import {
    RefreshCwIcon,
    SettingsIcon,
    SquareArrowOutUpRight
} from 'lucide-react'

import { useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'

import * as v from 'valibot'
import { useQuery } from '@tanstack/react-query'

import { judges } from '../../constants'
import Teaching from '../teaching'
import { useEffect } from 'react'

const schema = v.object({
    apiKey: v.string(),
    model: v.string(),
    judge: v.string()
})

export type schema = v.InferInput<typeof schema>
type Set<T> = {
    set(state: T): void
}

export const useSettings = create<schema & Set<schema>>()(
    persist(
        (set) => ({
            apiKey: '',
            model: '',
            judge: Object.keys(judges)[0],
            set
        }),
        {
            name: 'settings'
        }
    )
)

interface xAIModel {
    created: Date
    id: string
    object: 'model'
    owned_by: 'xai'
}

interface xAIModelsResponse {
    data: xAIModel[]
    object: 'list'
}

export default function Settings() {
    const { set, ...persisted } = useSettings()
    const { handleSubmit, register, watch, reset } = useForm({
        resolver: valibotResolver(schema),
        defaultValues: persisted
    })

    // Sometime, providing defaultValues to useForm
    // does not work properly, because of queuing
    useEffect(() => {
        try {
            let settings: string | schema | null =
                localStorage.getItem('settings')
            if (!settings) return

            settings = JSON.parse(settings)
            if (settings) reset(settings as schema)
        } catch {
        // not empty
        }
    }, [reset])

    const apiKey = watch('apiKey')

    const { data, refetch, isPending } = useQuery({
        enabled: !!apiKey,
        queryKey: ['api', 'models'],
        queryFn: () =>
            fetch('https://api.x.ai/v1/models', {
                headers: {
                    authorization: `Bearer ${apiKey}`
                }
            }).then((res) => res.json()) as Promise<xAIModelsResponse>
    })

    return (
        <Dialog>
            <Teaching
                enabled={
                    typeof window === 'undefined'
                        ? false
                        : !localStorage.getItem('settings')
                }
            >
                <DialogTrigger disableButtonEnhancement>
                    <Tooltip withArrow content="Settings" relationship="label">
                        <ToolbarButton
                            aria-label="API Settings"
                            icon={<SettingsIcon size={24} />}
                        />
                    </Tooltip>
                </DialogTrigger>
            </Teaching>
            <DialogSurface className="!max-w-md">
                <form
                    onSubmit={handleSubmit((data) => {
                        set(data)
                    })}
                >
                    <DialogBody>
                        <DialogTitle>API Settings</DialogTitle>
                        <DialogContent>
                            <div className="flex flex-col gap-3">
                                <div className="flex flex-col">
                                    <Label htmlFor="api-key" size="small">
                                        <TeachingPopover>
                                            <TeachingPopoverTrigger>
                                                <Button
                                                    appearance="transparent"
                                                    size="small"
                                                    className="text-xs !p-0"
                                                >
                                                    xAI API Key (?)
                                                </Button>
                                            </TeachingPopoverTrigger>
                                            <TeachingPopoverSurface className="max-w-sm">
                                                <TeachingPopoverHeader>
                                                    What is an API key
                                                </TeachingPopoverHeader>
                                                <TeachingPopoverBody>
                                                    <TeachingPopoverTitle>
                                                        API key is your unique
                                                        identifier
                                                    </TeachingPopoverTitle>
                                                    API key is owned by you, and
                                                    required to use some
                                                    internet service. Similar to
                                                    OpenAI, xAI is a
                                                    pay-per-usage. You need to
                                                    provide an API key to use
                                                    the app.
                                                </TeachingPopoverBody>
                                                <TeachingPopoverFooter
                                                    primary={
                                                        <a
                                                            className="flex items-center gap-1 hover:underline"
                                                            href="https://console.x.ai/team/default/api-keys"
                                                            target="_blank"
                                                        >
                                                            Get xAI API key
                                                            <SquareArrowOutUpRight
                                                                size={14}
                                                            />
                                                        </a>
                                                    }
                                                    secondary="Got it"
                                                />
                                            </TeachingPopoverSurface>
                                        </TeachingPopover>
                                    </Label>
                                    <Input
                                        id="api-key"
                                        placeholder="xai-*************************"
                                        type="password"
                                        {...register('apiKey')}
                                    />
                                </div>

                                <div className="flex flex-col">
                                    <Label htmlFor="model" size="small">
                                        Model
                                    </Label>
                                    <div className="flex items-center gap-1">
                                        <Select
                                            id="model"
                                            {...register('model')}
                                            className="flex-1"
                                        >
                                            <option value="">
                                                Select model
                                            </option>
                                            {data?.data ? (
                                                data.data?.map(({ id }) => (
                                                    <option key={id} value={id}>
                                                        {id}
                                                    </option>
                                                ))
                                            ) : (
                                                <option value="" disabled>
                                                    API key is required to
                                                    select model
                                                </option>
                                            )}
                                        </Select>
                                        <Tooltip
                                            content="Reload model"
                                            relationship="label"
                                            withArrow
                                        >
                                            <ToolbarToggleButton
                                                name="toggle"
                                                value=""
                                                aria-label="Reload"
                                                onClick={() => refetch()}
                                                disabled={isPending}
                                                icon={
                                                    <RefreshCwIcon size={16} />
                                                }
                                            />
                                        </Tooltip>
                                    </div>

                                    <p className="text-xs text-gray-400 pt-1">
                                        We recommended using grok-4 or newer
                                    </p>
                                </div>

                                <div className="flex flex-col">
                                    <Label htmlFor="judge" size="small">
                                        Chief
                                    </Label>
                                    <Select id="judge" {...register('judge')}>
                                        {Object.keys(judges).map((judge) => (
                                            <option key={judge} value={judge}>
                                                {judge}
                                            </option>
                                        ))}
                                    </Select>
                                </div>
                            </div>
                        </DialogContent>
                        <DialogActions className="pt-4">
                            <DialogTrigger disableButtonEnhancement>
                                <Button appearance="primary" type="submit">
                                    Save
                                </Button>
                            </DialogTrigger>
                            <DialogTrigger disableButtonEnhancement>
                                <Button>Close</Button>
                            </DialogTrigger>
                        </DialogActions>
                    </DialogBody>
                </form>
            </DialogSurface>
        </Dialog>
    )
}
