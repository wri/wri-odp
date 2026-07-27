import {
	Button,
	getThemedColor,
	getThemedFontSize,
	getThemedRadius,
	getThemedSpacing,
} from '@worldresources/wri-design-systems';
import {
	ChevronDownIcon,
	ClipboardDocumentIcon,
	ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';

type SelectEndpointsProps = {
	onBack: () => void;
	onClose: () => void;
};

function SelectEndpoints({ onBack, onClose }: SelectEndpointsProps) {
	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				gap: getThemedSpacing(500),
			}}
		>
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					gap: getThemedSpacing(200),
				}}
			>
				<h1
					style={{
						fontSize: getThemedFontSize(700),
						fontWeight: 700,
						color: getThemedColor('neutral', 900),
					}}
				>
					Select endpoints
				</h1>
				<p
					style={{
						fontSize: getThemedFontSize(400),
						color: getThemedColor('neutral', 800),
					}}
				>
					Choose one or more API end points to connect to.
				</p>
			</div>

			<div
				style={{
					border: `1px solid ${getThemedColor('neutral', 300)}`,
					borderRadius: getThemedRadius(300),
					padding: getThemedSpacing(400),
					display: 'flex',
					flexDirection: 'column',
					gap: getThemedSpacing(400),
				}}
			>
				<div
					style={{
						display: 'flex',
						justifyContent: 'space-between',
						gap: getThemedSpacing(400),
					}}
				>
					<div style={{ flex: 1 }}>
						<div
							style={{
								display: 'flex',
								alignItems: 'center',
								gap: getThemedSpacing(200),
								marginBottom: getThemedSpacing(100),
							}}
						>
							<span
								style={{
									fontSize: getThemedFontSize(200),
									fontWeight: 700,
									color: getThemedColor('secondary', 900),
									background: getThemedColor('secondary', 200),
									borderRadius: getThemedRadius(100),
									padding: `2px ${getThemedSpacing(100)}`,
								}}
							>
								GET
							</span>
							<span
								style={{
									fontSize: getThemedFontSize(500),
									fontWeight: 700,
									color: getThemedColor('neutral', 800),
								}}
							>
								Dataset metadata
							</span>
						</div>
						<p
							style={{
								fontSize: getThemedFontSize(400),
								color: getThemedColor('neutral', 800),
								marginBottom: getThemedSpacing(300),
							}}
						>
							High-resolution raster tiles covering tropical tree cover across the
							global tropics.
						</p>
						<div
							style={{
								display: 'flex',
								gap: getThemedSpacing(300),
								fontSize: getThemedFontSize(300),
								color: getThemedColor('neutral', 700),
							}}
						>
							<span>Created: Oct 10, 2024</span>
							<span>Last updated: Oct 10, 2024</span>
						</div>
					</div>
					<Button
						variant="secondary"
						size="default"
						rightIcon={<ChevronDownIcon />}
						onClick={() => console.log('hide endpoint')}
					>
						Hide endpoint
					</Button>
				</div>

				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						gap: getThemedSpacing(200),
					}}
				>
					<div
						style={{
							flex: 1,
							border: `1px solid ${getThemedColor('neutral', 300)}`,
							borderRadius: getThemedRadius(200),
							background: getThemedColor('neutral', 100),
							padding: `${getThemedSpacing(200)} ${getThemedSpacing(300)}`,
							fontSize: getThemedFontSize(400),
							color: getThemedColor('neutral', 600),
							overflow: 'hidden',
							whiteSpace: 'nowrap',
							textOverflow: 'ellipsis',
						}}
					>
						https://data-api.globalforestwatch.org/dataset/wri_tropical_tree_cover
					</div>
					<Button
						variant="secondary"
						size="default"
						leftIcon={<ClipboardDocumentIcon />}
						onClick={() => console.log('copy endpoint')}
					>
						Copy
					</Button>
				</div>

				<div>
					<div
						style={{
							display: 'flex',
							gap: getThemedSpacing(500),
							borderBottom: `1px solid ${getThemedColor('neutral', 300)}`,
							marginBottom: getThemedSpacing(300),
						}}
					>
						<span
							style={{
								paddingBottom: getThemedSpacing(100),
								fontSize: getThemedFontSize(500),
								color: getThemedColor('neutral', 800),
								borderBottom: `2px solid ${getThemedColor('secondary', 600)}`,
							}}
						>
							Javascript
						</span>
						<span
							style={{
								paddingBottom: getThemedSpacing(100),
								fontSize: getThemedFontSize(500),
								color: getThemedColor('neutral', 700),
							}}
						>
							Python
						</span>
						<span
							style={{
								paddingBottom: getThemedSpacing(100),
								fontSize: getThemedFontSize(500),
								color: getThemedColor('neutral', 700),
							}}
						>
							R
						</span>
					</div>

					<div
						style={{
							background: getThemedColor('neutral', 200),
							borderRadius: getThemedRadius(300),
							padding: getThemedSpacing(400),
							fontSize: getThemedFontSize(400),
							color: getThemedColor('neutral', 800),
							lineHeight: '1.55',
							whiteSpace: 'pre-wrap',
							marginBottom: getThemedSpacing(400),
						}}
					>
						{`const response = await fetch(
	\`https://datasets.wri.org/api/3/action/resource_show?id=1b818cef-091f-4b53-83b1-eeeae9f8cd79\`,
	{
		method: "GET",
	}
);

const data = await response.json();

console.log(data);`}
					</div>

					<div style={{ display: 'flex', gap: getThemedSpacing(200) }}>
						<Button
							variant="secondary"
							size="default"
							rightIcon={<ArrowTopRightOnSquareIcon />}
							onClick={() => console.log('ckan auth docs')}
						>
							CKAN auth docs
						</Button>
						<Button
							variant="secondary"
							size="default"
							rightIcon={<ArrowTopRightOnSquareIcon />}
							onClick={() => console.log('datastore api docs')}
						>
							Datastore API docs
						</Button>
					</div>
				</div>
			</div>

			<div
				style={{
					border: `1px solid ${getThemedColor('neutral', 300)}`,
					borderRadius: getThemedRadius(300),
					padding: getThemedSpacing(400),
					display: 'flex',
					justifyContent: 'space-between',
					gap: getThemedSpacing(400),
				}}
			>
				<div style={{ flex: 1 }}>
					<div
						style={{
							display: 'flex',
							alignItems: 'center',
							gap: getThemedSpacing(200),
							marginBottom: getThemedSpacing(100),
						}}
					>
						<span
							style={{
								fontSize: getThemedFontSize(200),
								fontWeight: 700,
								color: getThemedColor('secondary', 900),
								background: getThemedColor('secondary', 200),
								borderRadius: getThemedRadius(100),
								padding: `2px ${getThemedSpacing(100)}`,
							}}
						>
							GET
						</span>
						<span
							style={{
								fontSize: getThemedFontSize(500),
								fontWeight: 700,
								color: getThemedColor('neutral', 800),
							}}
						>
							Dataset layer
						</span>
					</div>
					<p
						style={{
							fontSize: getThemedFontSize(400),
							color: getThemedColor('neutral', 800),
							marginBottom: getThemedSpacing(300),
						}}
					>
						Documentation to help you understand and use this dataset, including
						methodology, file structure and supporting guidance.
					</p>
					<div
						style={{
							display: 'flex',
							gap: getThemedSpacing(300),
							fontSize: getThemedFontSize(300),
							color: getThemedColor('neutral', 700),
						}}
					>
						<span>Created: Oct 10, 2024</span>
						<span>Last updated: Oct 10, 2024</span>
					</div>
				</div>
				<Button
					variant="secondary"
					size="default"
					rightIcon={<ChevronDownIcon />}
					onClick={() => console.log('show endpoint 1')}
				>
					Show endpoint
				</Button>
			</div>

			<div
				style={{
					border: `1px solid ${getThemedColor('neutral', 300)}`,
					borderRadius: getThemedRadius(300),
					padding: getThemedSpacing(400),
					display: 'flex',
					justifyContent: 'space-between',
					gap: getThemedSpacing(400),
				}}
			>
				<div style={{ flex: 1 }}>
					<div
						style={{
							display: 'flex',
							alignItems: 'center',
							gap: getThemedSpacing(200),
							marginBottom: getThemedSpacing(100),
						}}
					>
						<span
							style={{
								fontSize: getThemedFontSize(200),
								fontWeight: 700,
								color: getThemedColor('secondary', 900),
								background: getThemedColor('secondary', 200),
								borderRadius: getThemedRadius(100),
								padding: `2px ${getThemedSpacing(100)}`,
							}}
						>
							GET
						</span>
						<span
							style={{
								fontSize: getThemedFontSize(500),
								fontWeight: 700,
								color: getThemedColor('neutral', 800),
							}}
						>
							Tropical Tree Cover GeoTIFF tiles
						</span>
					</div>
					<p
						style={{
							fontSize: getThemedFontSize(400),
							color: getThemedColor('neutral', 800),
							marginBottom: getThemedSpacing(300),
						}}
					>
						High-resolution raster tiles covering tropical tree cover across the global
						tropics.
					</p>
					<div
						style={{
							display: 'flex',
							gap: getThemedSpacing(300),
							fontSize: getThemedFontSize(300),
							color: getThemedColor('neutral', 700),
						}}
					>
						<span>Created: Oct 10, 2024</span>
						<span>Last updated: Oct 10, 2024</span>
					</div>
				</div>
				<Button
					variant="secondary"
					size="default"
					rightIcon={<ChevronDownIcon />}
					onClick={() => console.log('show endpoint 2')}
				>
					Show endpoint
				</Button>
			</div>

			<div style={{ display: 'flex', justifyContent: 'space-between' }}>
				<Button variant="secondary" size="default" onClick={onBack}>
					Back
				</Button>
				<Button variant="primary" size="default" onClick={onClose}>
					Close
				</Button>
			</div>
		</div>
	);
}

export default SelectEndpoints;
