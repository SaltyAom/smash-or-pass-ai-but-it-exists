import Settings from './components/settings'
import Result from './components/result'
import Terms from './components/terms'

export default function App() {
    return (
        <div className="flex flex-col justify-center items-center w-full min-h-dvh p-4 md:p-0">
            <header className="flex gap-4 items-center h-14 mb-6 md:mb-8 mx-auto">
                <h1 className="text-3xl font-medium flex-1">
                    Smash or Pass AI
                    <small className="absolute text-xs text-gray-400 font-light mt-8.5 -translate-x-10 -rotate-2">
                        but it exists
                    </small>
                </h1>
                <Settings />
            </header>
            <Result />
            <Terms />
        </div>
    )
}
