import { hydrateRoot } from 'react-dom/client'

import Provider from './provider'
import App from './app'

hydrateRoot(
    document.getElementById('root')!,
    <Provider>
        <App />
    </Provider>
)
