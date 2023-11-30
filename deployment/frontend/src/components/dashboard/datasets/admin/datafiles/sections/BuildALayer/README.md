# Docs about layers

We need to figure out how to represent an ramp/scale/curve as a zod object 


Definition ramp:

- type: rampObj

Definition rampObj

- type: ['step', 'interpolate', 'interpolate-lab', 'interpolate-hcl'] (required)
- interpolationType: ['linear', exponentialObj, cubicBezierObj] (null if step is defined required otherwise)
- input [number, numericExpression]
- ouputArray = outputObj

Definition exponentialObj

- name: 'exponential'
- base: number

Definition cubicBezierObj

name: 'cubic-bezier'
points: number[]

Definition outputObj

stopInput: number
stopOutput: color

definition numericExpression

operation: ['get', 'has']
column: string (should autofill eventually)

## Questions

- For the GEE Provider, the Layer ID is used to identify the tiles in GEE, does that mean that the ids for GEE Layers are not created with the layer creation, but before hand?
