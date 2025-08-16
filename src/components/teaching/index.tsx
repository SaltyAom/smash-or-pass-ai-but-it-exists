import { useState, type PropsWithChildren } from 'react'
import {
    TeachingPopover,
    TeachingPopoverSurface,
    TeachingPopoverHeader,
    TeachingPopoverBody,
    TeachingPopoverTitle,
    TeachingPopoverFooter,
    TeachingPopoverTrigger,
    DialogTrigger
} from '@fluentui/react-components'

interface TeachingProps extends PropsWithChildren {
    enabled: boolean
}

export default function Teaching({ enabled, children }: TeachingProps) {
    const [isEnable, setEnable] = useState(enabled)

    if (!isEnable)
        return (
            <DialogTrigger disableButtonEnhancement>
                {children as never}
            </DialogTrigger>
        )

    return (
        <TeachingPopover open={isEnable}>
            <TeachingPopoverTrigger>{children as never}</TeachingPopoverTrigger>
            <TeachingPopoverSurface className="max-w-xs">
                <TeachingPopoverHeader>Tips</TeachingPopoverHeader>
                <TeachingPopoverBody>
                    <TeachingPopoverTitle>
                        API key is required
                    </TeachingPopoverTitle>
                    You need to set an API key, and select the model for the AI
                    to work.
                </TeachingPopoverBody>
                <TeachingPopoverFooter
                    primary="Got it"
                    onClick={() => {
                        setEnable(false)
                    }}
                />
            </TeachingPopoverSurface>
        </TeachingPopover>
    )
}
