import {
    getThemedColor,
    getThemedFontSize,
    getThemedRadius,
} from '@worldresources/wri-design-systems';

export const NumberIcon = ({ value }: { value: string }) => (
    <div
        style={{
            background: getThemedColor('secondary', 300),
            height: '16px',
            width: '16px',
            textAlign: 'center',
            color: getThemedColor('secondary', 900),
            fontSize: getThemedFontSize(300),
            fontWeight: 700,
            borderRadius: getThemedRadius(200),
            lineHeight: '16px',
        }}
    >
        {value}
    </div>
);
