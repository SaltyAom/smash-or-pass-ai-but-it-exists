import {
    Dialog,
    DialogTrigger,
    DialogSurface,
    DialogTitle,
    DialogBody,
    DialogActions,
    DialogContent,
    Button
} from '@fluentui/react-components'

export default function Terms() {
    return (
        <Dialog
            defaultOpen={
                typeof window === 'undefined'
                    ? false
                    : !localStorage.getItem('term')
            }
        >
            <DialogTrigger>
                <Button appearance="transparent" className="!mt-6 !font-normal !text-gray-400">
                    Terms and Service
                </Button>
            </DialogTrigger>
            <DialogSurface className="!max-w-md">
                <DialogBody>
                    <DialogTitle>Terms and Service</DialogTitle>
                    <DialogContent>
                        By using this software, you agree to that you are 18
                        years or older and that you will not use this software
                        for any illegal activities. This
                        software is provided "as is" without any warranties or
                        guarantees. The developers are not responsible for any
                        misuse or harm caused by the use of this software.
                    </DialogContent>
                    <DialogActions className="pt-4">
                        <DialogTrigger disableButtonEnhancement>
                            <Button
                                appearance="primary"
                                type="submit"
                                onClick={() => {
                                    localStorage.setItem(
                                        'term',
                                        new Date().getTime() + ''
                                    )
                                }}
                            >
                                I agree
                            </Button>
                        </DialogTrigger>
                    </DialogActions>
                </DialogBody>
            </DialogSurface>
        </Dialog>
    )
}
