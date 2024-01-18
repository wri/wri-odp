import { createMachine } from 'xstate'

const layerEditorMachine = createMachine({
    /** @xstate-layout N4IgpgJg5mDOIC5QBsCGBPMAnAohAlgC4D2WAsqgMYAW+AdmAHSxiEDKxArlpWAMSwuPMAFUADhFSEwAbQAMAXUSgxxWEXzE6ykAA9EAJgBsADkYBWACymA7OYA0IdIgCM5gxcs2blgMwH-OUsATktLAF9wxzRMXAIScipaBmZWDm5ePgA5HAANABV5JSQQVXVCTW0S-QQXH0ZQgxsXFyNfYJM5YIcnV18XBssmrt85GwNzcyNI6IxsPCJSChp6JhZCABkwGDoIAGEtADN8KD5kbbBd2HFJaSKdMo0tHRrJy0YTToM6m18TayMBkczgQYU83j8AQMQVCUxmIBi83iSySq1SmwuuwOdGOpxyBXuJUeFWe1UQ1g8wRsRnMPhcljcI18wL67zCw2Co3Gk2mUQRczii0SKxS6y2O32RxOfAACgAlHAANUJKjUTyqoBqdSMjDkviM1jqBksJnMcisLIQJgGXmCrWanJaLQM8MRgoSy2Sa1YAEk6NIsFQSXRsbjZQrlYoHmrgy9yQbdTY9caDMZJkFLSZfA0bHajA7+k6XXy3QsPajRb7-dgg5VQ9L8YUo0SY5UdCDgh4rBD-IEQtZHDUTEYdRMbFm5Ma5K1ebNYmWUSLvYQ5ZcINh66d5UqVaVW6TNYZ6v9fHZLcY5IwjC5J5C+6EbJE+XRiOv4CVS8jhV7o+U22SEAAWhNS1gMpdwJnzfNunNMJXQFBdvzRdZ0mEX91TjUEgV6K0bHBHxe2hfsXHg+cv09ZDWHFNdN3Q2MAKaMw-knH4-gBFxLWCS8gh7KEYTgksEPIitlz9ANay0WiWz-A89EQKYdQZSw5C+ZSZ04rsvAIvj+1nfkyKFCjKxXNcNylKA6P-Q8EDkc8TA8HjtPvLwn3CIA */
    id: 'layerEditorMachine',
    initial: 'setSourceConfig',
    predictableActionArguments: true,
    schema: {
        context: {},
    },
    context: {},
    states: {
        setSourceConfig: {
            on: {
                GO_TO_RENDER: 'setRenderConfig',
                GO_TO_LEGEND: 'setLegendConfig',
            },
        },
        setRenderConfig: {
            on: {
                GO_TO_LEGEND: 'setLegendConfig',
                BACK_TO_SOURCE: 'setSourceConfig',
            },
        },
        setLegendConfig: {
            on: {
                NEXT: 'setInteractionConfig',
                BACK_TO_RENDER: 'setRenderConfig',
                BACK_TO_SOURCE: 'setSourceConfig',
            },
        },
        setInteractionConfig: {
            on: {
                PREV: 'setLegendConfig',
            },
        },
    },
})

export default layerEditorMachine
