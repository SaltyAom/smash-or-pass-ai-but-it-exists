import type { PropsWithChildren } from 'react'

import {
    FluentProvider,
    SSRProvider,
    webLightTheme
} from '@fluentui/react-components'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'

const queryClient = new QueryClient()

export default function Provider({ children }: PropsWithChildren) {
    return (
        <SSRProvider>
            <FluentProvider theme={webLightTheme}>
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            </FluentProvider>
        </SSRProvider>
    )
}
