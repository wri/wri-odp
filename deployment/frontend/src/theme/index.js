import { createSystem } from '@chakra-ui/react';
import { designSystemStyles } from '@worldresources/wri-design-systems';

export const system = createSystem(designSystemStyles._config, {
    theme: {
        tokens: {
            colors: {
                neutral: {
                    100: { value: '#FFFFFF' },
                    200: { value: '#F6F6F6' },
                    300: { value: '#E7E6E6' },
                    400: { value: '#C9C9C9' },
                    500: { value: '#B0B0B0' },
                    600: { value: '#A1A1A1' },
                    700: { value: '#5C5959' },
                    800: { value: '#3D3B3B' },
                    900: { value: '#1A1919' },
                },
                primary: {
                    100: { value: '#FFFBF2' },
                    200: { value: '#FCEFD3' },
                    300: { value: '#FADFA7' },
                    400: { value: '#F5BF4F' },
                    500: { value: '#F0AB00' },
                    600: { value: '#DE9E00' },
                    700: { value: '#855B00' },
                    800: { value: '#5F4205' },
                    900: { value: '#332300' },
                },
                secondary: {
                    100: { value: '#F9FCF8' },
                    200: { value: '#F2F7F0' },
                    300: { value: '#9FCE8F' },
                    400: { value: '#4CAF6E' },
                    500: { value: '#189825' },
                    600: { value: '#0F7A1E' },
                    700: { value: '#32864B' },
                    800: { value: '#286B3C' },
                    900: { value: '#0A5C23' },
                },
                success: {
                    100: { value: '#EBF5F2' },
                    200: { value: '#D3EED1' },
                    300: { value: '#C2E5DC' },
                    500: { value: '#009E77' },
                    900: { value: '#00664D' },
                },
                warning: {
                    100: { value: '#FBF7EA' },
                    200: { value: '#E3CC8F' },
                    300: { value: '#EEDDA5' },
                    500: { value: '#A88100' },
                    900: { value: '#715804' },
                },
                error: {
                    100: { value: '#FFEFED' },
                    200: { value: '#EDA1A9' },
                    300: { value: '#F6C5C1' },
                    500: { value: '#C11101' },
                    900: { value: '#8D0D01' },
                },
                accessible: {
                    'text-on-primary-mids': { value: '#332300' }, // primary 900
                    'text-on-secondary-mids': { value: '#F2F6FF' }, // secondary 100
                    'controls-on-neutral-lights': { value: '#855B00' }, // primary 700
                    'controls-on-neutral-darks': { value: '#F5BF4F' }, // primary 400
                },
            },
            spacing: {
                // Available steps: 0, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1400, 1600, 2000, 2400, 2800
                400: { value: '1rem' },
            },
            radii: {
                // Available steps: 100, 200, 300, 400, 500, 600, 700, 800, 900
                500: { value: '0.5rem' },
            },
            borderWidths: {
                // Available steps: 100, 200, 300, 400
                100: { value: '0.0625rem' },
            },
            fontSizes: {
                // Available steps: 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100
                500: { value: '1rem' },
            },
            lineHeights: {
                // Available steps: 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200
                600: { value: '1.5rem' },
            },
        },
    },
});
