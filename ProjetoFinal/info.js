const sunInfo = {
	name: "Sun",
	colorMap: "sun_map.jpg",
	tilt: 7.25,
	radius: 696340,
	rotationPeriod: 648,
}

const moonInfo = {
	name: "Moon",
	colorMap: "moon_map.jpg",
	bumpMap: "moon_bump.jpg",
	bumpScale: 0.003,
	tilt: 6.7,
	radius: 1737.5,
	earthDistance: 384400,
	rotationPeriod: 655.2,
	orbitColor: 0xC0C0C0
}

const planetsInfo = [
	{
		name: "Mercury",
		colorMap: "mercury_map.jpg",
		bumpMap: "mercury_bump.jpg",
		bumpScale: 0.002,
		tilt: 0.034,
		radius: 2439.5,
		sunDistance: 57.9e6,
		rotationPeriod: 1407.6,
		revolutionPeriod: 2112,
		orbitColor: 0x909090
	},
	{
		name: "Venus",
		colorMap: "venus_map.jpg",
		bumpMap: "venus_bump.jpg",
		bumpScale: 0.01,
		tilt: 177.4,
		radius: 6052,
		sunDistance: 108.2e6,
		rotationPeriod: -5832.5,
		revolutionPeriod: 5392.8,
		orbitColor: 0xE3CF57
	},
	{
		name: "Earth",
		colorMap: "earth_map.jpg",
		specularMap: "earth_spec.jpg",
		bumpMap: "earth_bump.jpg",
		bumpScale: 0.1,
		tilt: 23.4,
		radius: 6378,
		sunDistance: 149.6e6,
		rotationPeriod: 23.9,
		revolutionPeriod: 8764.8,
		orbitColor: 0x2A52BE
	},
	{
		name: "Mars",
		colorMap: "mars_map.jpg",
		normalMap: "mars_normal.jpg",
		tilt: 25.2,
		radius: 3396,
		sunDistance: 228.0e6,
		rotationPeriod: 24.6,
		revolutionPeriod: 16488,
		orbitColor: 0xB22222,
		reducedShininess: true
	},
	{
		name: "Jupiter",
		colorMap: "jupiter_map.jpg",
		tilt: 3.1,
		radius: 71492,
		sunDistance: 778.5e6,
		rotationPeriod: 9.9,
		revolutionPeriod: 103944,
		orbitColor: 0xD4AF37
	},
	{
		name: "Saturn",
		colorMap: "saturn_map.jpg",
		hasRing: true,
		ringColor: "saturn_ring_color.jpg",
		ringPattern: "saturn_ring_pattern.gif",
		ringInnerRadius: 1.237,
		ringOuterRadius: 2.27,
		tilt: 26.7,
		radius: 60268,
		sunDistance: 1432.0e6,
		rotationPeriod: 10.7,
		revolutionPeriod: 257928,
		orbitColor: 0xD2B48C
	},
	{
		name: "Uranus",
		colorMap: "uranus_map.jpg",
		hasRing: true,
		ringColor: "uranus_ring_color.jpg",
		ringPattern: "uranus_ring_pattern.gif",
		ringInnerRadius: 1.637,
		ringOuterRadius: 2.006,
		tilt: 97.8,
		radius: 25559,
		sunDistance: 2867.0e6,
		rotationPeriod: -17.2,
		revolutionPeriod: 734136,
		orbitColor: 0xAFEEEE
	},
	{
		name: "Neptune",
		colorMap: "neptune_map.jpg",
		tilt: 28.3,
		radius: 24764,
		sunDistance: 4515.0e6,
		rotationPeriod: 16.1,
		revolutionPeriod: 1435200,
		orbitColor: 0x2C75FF
	}
]

export { sunInfo, moonInfo, planetsInfo };
