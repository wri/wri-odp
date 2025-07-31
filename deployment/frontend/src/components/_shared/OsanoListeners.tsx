import { useEffect } from 'react'
import { useRouter } from 'next/router'

declare global {
    interface Window {
        Osano: any
    }
}

// Add/remove Osano event listeners
// This resolves some issues with click to open not working after navigating away from the homepage
const osanoListeners = () => {
    // Reloads page after Osano consent is saved
    // Needed so that Google Tag Manager and Hotjar checks can run again
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        document
            .querySelector('.osano-cookie-preference-link')
            ?.addEventListener('click', function () {
                const saveButton = document.querySelector('.osano-cm-save')
                if (saveButton) {
                    saveButton.addEventListener('click', function () {
                        window.location.reload()
                    })
                }
            })
    }

    const router = useRouter()

    useEffect(() => {
        const showOsanaDialog = (e: Event) => {
            e.preventDefault()
            if (window.Osano && window.Osano.cm) {
                window.Osano.cm.showDrawer('osano-cm-dom-info-dialog-open')
            } else {
                console.error('Osano not available!')
            }
        }

        const attachEventListeners = () => {
            const elements = document.getElementsByClassName(
                'osano-cookie-preference-link'
            )

            if (elements.length > 0) {
                for (let i = 0; i < elements.length; i++) {
                    elements[i]?.removeEventListener('click', showOsanaDialog)
                    elements[i]?.addEventListener(
                        'click',
                        showOsanaDialog,
                        false
                    )
                }
            } else {
                console.error('Elements not found!')
            }
        }

        const checkOsanoAvailability = () => {
            if (typeof window.Osano !== 'undefined') {
                attachEventListeners()
            } else {
                setTimeout(checkOsanoAvailability, 500)
            }
        }

        checkOsanoAvailability()

        router.events.on('routeChangeComplete', () => {
            checkOsanoAvailability()
        })

        return () => {
            router.events.off('routeChangeComplete', checkOsanoAvailability)
        }
    }, [router.events])
}

export default osanoListeners
