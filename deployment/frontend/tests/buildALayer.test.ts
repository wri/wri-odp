import { expect, it } from 'vitest'
import { democracy_index } from '@/templateLayers/democracy_index'
import { roads } from '@/templateLayers/roads'
import { hdi } from '@/templateLayers/hdi'
import { marine_ecoregions } from '@/templateLayers/marine_ecoregions'
import { temperature } from '@/templateLayers/temperature'
import {
    convertFormToLayerObj,
    convertLayerObjToForm,
} from '@/components/dashboard/datasets/admin/datafiles/sections/BuildALayer/convertObjects'
import { APILayerSpec } from '@/interfaces/layer.interface'

it('Convert a layer object from RW to our custom format and back - (democracy index)', () => {
    const formObj = convertLayerObjToForm(
        democracy_index as unknown as APILayerSpec
    )
    const layer_converted = convertFormToLayerObj(formObj)
    expect(democracy_index).toEqual(layer_converted)
})

it('Convert a layer object from RW to our custom format and back - (roads)', () => {
    const formObj = convertLayerObjToForm(roads as unknown as APILayerSpec)
    const layer_converted = convertFormToLayerObj(formObj)
    expect(roads).toEqual(layer_converted)
})

it('Convert a layer object from RW to our custom format and back - (hdi)', () => {
    const formObj = convertLayerObjToForm(hdi as unknown as APILayerSpec)
    const layer_converted = convertFormToLayerObj(formObj)
    expect(hdi).toEqual(layer_converted)
})

it('Convert a layer object from RW to our custom format and back - (marine_ecoregions)', () => {
    const formObj = convertLayerObjToForm(
        marine_ecoregions as unknown as APILayerSpec
    )
    const layer_converted = convertFormToLayerObj(formObj)
    expect(marine_ecoregions).toEqual(layer_converted)
})

it('Convert a layer object from RW to our custom format and back - (temperature)', () => {
    const formObj = convertLayerObjToForm(
        temperature as unknown as APILayerSpec
    )
    const layer_converted = convertFormToLayerObj(formObj)
    expect(temperature).toEqual(layer_converted)
})
