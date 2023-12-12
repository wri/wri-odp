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
    expect(democracy_index.layerConfig).toEqual(layer_converted.layerConfig)
    expect(democracy_index.interactionConfig).toEqual(layer_converted.interactionConfig)
    expect(democracy_index.legendConfig).toEqual(layer_converted.legendConfig)
})

it('Convert a layer object from RW to our custom format and back - (roads)', () => {
    const formObj = convertLayerObjToForm(roads as unknown as APILayerSpec)
    const layer_converted = convertFormToLayerObj(formObj)
    expect(roads.layerConfig).toEqual(layer_converted.layerConfig)
    expect(roads.interactionConfig).toEqual(layer_converted.interactionConfig)
    expect(roads.legendConfig).toEqual(layer_converted.legendConfig)
})

it('Convert a layer object from RW to our custom format and back - (hdi)', () => {
    const formObj = convertLayerObjToForm(hdi as unknown as APILayerSpec)
    const layer_converted = convertFormToLayerObj(formObj)
    expect(hdi.layerConfig).toEqual(layer_converted.layerConfig)
    expect(hdi.interactionConfig).toEqual(layer_converted.interactionConfig)
    expect(hdi.legendConfig).toEqual(layer_converted.legendConfig)
})

it('Convert a layer object from RW to our custom format and back - (marine_ecoregions)', () => {
    const formObj = convertLayerObjToForm(
        marine_ecoregions as unknown as APILayerSpec
    )
    const layer_converted = convertFormToLayerObj(formObj)
    expect(marine_ecoregions.layerConfig).toEqual(layer_converted.layerConfig)
    expect(marine_ecoregions.interactionConfig).toEqual(layer_converted.interactionConfig)
    expect(marine_ecoregions.legendConfig).toEqual(layer_converted.legendConfig)
})

it('Convert a layer object from RW to our custom format and back - (temperature)', () => {
    const formObj = convertLayerObjToForm(
        temperature as unknown as APILayerSpec
    )
    const layer_converted = convertFormToLayerObj(formObj)
    expect(temperature.layerConfig).toEqual(layer_converted.layerConfig)
    expect(temperature.interactionConfig).toEqual(layer_converted.interactionConfig)
    expect(temperature.legendConfig).toEqual(layer_converted.legendConfig)
})
