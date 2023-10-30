import React from 'react'
import { Labels } from '@/interfaces/state.interface'
import { useLabels } from '@/utils/storeHooks'

const LabelSelector = () => {
    const labels = ['light', 'dark', 'none']
    const { selectedLabels, setLabels } = useLabels()

    const handleLabelsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setLabels(event.target.value as Labels)
    }

    return (
        <div>
            Labels: &nbsp;
            <div className="flex flex-col">
                {labels.map((label) => (
                    <label key={label} className="mr-2">
                        <input
                            type="radio"
                            value={label}
                            checked={selectedLabels === label}
                            onChange={handleLabelsChange}
                            className="mr-1"
                        />
                        {label}
                    </label>
                ))}
            </div>
        </div>
    )
}

export default LabelSelector
