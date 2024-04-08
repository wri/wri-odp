export function addButtonToNode(node: HTMLElement, textToCopy: string) {
    //check if node already has a button child
    if (node.querySelectorAll('button').length != 0) return
    const buttonHTML = `<div class="absolute top-0 right-0"><button class="inline-flex items-center justify-center ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 max-w-[800px] bg-amber-400 text-stone-900 font-bold font-acumin hover:bg-yellow-500 text-base h-auto rounded-full p-2" aria-label="copy button" data-state="closed"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true" class="w-3 text-white"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75"></path></svg></button></div>`
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = buttonHTML.trim()
    const button = tempDiv.firstChild
    button?.addEventListener('click', () => {
        navigator.clipboard
            .writeText(textToCopy)
            .then(() => {
                console.log('Text copied to clipboard:', textToCopy)
                // Optionally, you can provide some visual feedback here
            })
            .catch((error) => {
                console.error('Unable to copy text to clipboard:', error)
                // Optionally, you can handle errors here
            })
    })
    if (button) node.appendChild(button)
}

export function addCopyButton(id: string) {
    // Create a temporary div element to hold the parsed HTML
    var tempDiv = document.getElementById(id)
    if (!tempDiv) return

    // Retrieve all <code> elements
    var codeElements = tempDiv.querySelectorAll('code')

    // Loop through each <code> element
    codeElements.forEach(function (codeElement) {
        codeElement?.classList.add('relative')
        codeElement?.classList.add('w-full')
        codeElement?.classList.add('block')
        addButtonToNode(codeElement, codeElement.innerText)
    })

    // Return the updated HTML string
    return tempDiv.innerHTML
}
