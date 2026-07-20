import {
    Button,
    getThemedColor,
    getThemedFontSize,
    getThemedSpacing,
    InlineMessage,
} from '@worldresources/wri-design-systems';

function ReviewCaution() {
    return (
        <div id="main-content">
            <h1
                style={{
                    fontSize: getThemedFontSize(700),
                    fontWeight: 700,
                    color: getThemedColor('neutral', 900),
                }}
            >
                Review important information.
            </h1>
            <br />
            <div
                style={{
                    fontSize: getThemedFontSize(400),
                    fontWeight: 400,
                    color: getThemedColor('neutral', 800),
                }}
            >
                Before downloading this dataset, please review the following information.
            </div>
            <div style={{ margin: `${getThemedSpacing(500)} 0` }}>
                <InlineMessage
                    variant="warning"
                    label="Caution for using this dataset"
                    size="full-width"
                    caption="This dataset uses a different definition of a tree and a different definition of tree cover than does Hansen et al. (2013).
This dataset defines a tree according to both the height and crown diameter. Woody vegetation higher than 5 meters regardless of crown diameter, or between 3 and 5 meters with a minimum crown diameter of 5 meters is considered a tree. This definition is different from Hansen et al. (2013) which defines a tree as any vegetation at least 5 meters in height.
The tropical tree cover dataset does not disambiguate plantation trees from non-plantation trees.
Analyses or statistics derived over spatial regions smaller than 0.5 ha may not be accurate."
                />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button
                    variant="secondary"
                    size="default"
                    onClick={() => console.log(false)}
                    style={{ marginRight: getThemedSpacing(200) }}
                >
                    Back
                </Button>
                <Button variant="primary" size="default" onClick={() => console.log(false)}>
                    Continue
                </Button>
            </div>
        </div>
    );
}

export default ReviewCaution;
