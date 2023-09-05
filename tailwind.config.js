module.exports = {
	content: ['./src/**/*.{vue,ts}'],
	// prefix: 'gj-',
	theme: {
		screens: {
			375: '375px',
			390: '390px',
			425: '425px',
			480: '480px',
			640: '640px',
			740: '740px',
			768: '768px',
			992: '992px',
			1024: '1024px',
			1200: '1200px',
			1366: '1366px',
		}, // screens

		colors: {
			dark: {
				DEFAULT: '#020100',
			},
			yellow: {
				DEFAULT: '#F1D302',
			},
			blue: {
				DEFAULT: '#235789',
			},
			white: {
				DEFAULT: '#FDFFFC',
			},
		}, // colors

		fontSize: {
			10: ['10px', { lineHeight: '1.5' }],
			12: ['12px', { lineHeight: '1.5' }],
			14: ['14px', { lineHeight: '1.5' }],
			16: ['16px', { lineHeight: '1.5' }],
			18: ['18px', { lineHeight: '29px' }],
			20: ['20px', { lineHeight: '1.5' }],
			22: ['22px', { lineHeight: '36px' }],
			24: ['24px', { lineHeight: '1.5' }],
			28: ['28px', { lineHeight: '45px' }],
			32: ['32px', { lineHeight: '52px' }],
			34: ['34px', { lineHeight: '1.5' }],
			36: ['36px', { lineHeight: '1.5' }],
			40: ['40px', { lineHeight: '1.5' }],
			42: ['42px', { lineHeight: '1.5' }],
			48: ['48px', { lineHeight: '1.5' }],
		}, // fontSize

		borderRadius: {
			4: '4px',
			8: '8px',
			10: '10px',
			12: '12px',
			16: '16px',
			20: '20px',
			27: '27px',
			round: '50%',
		}, // borderRadius

		boxShadow: {
			'02030': '0px 20px 30px rgba(0, 0, 0, 0.1)',
			2420: '2px 4px 20px rgba(0, 0, 0, 0.2)',
		}, // boxShadow

		spacing: {
			0: '0px',
			2: '2px',
			4: '4px',
			6: '6px',
			8: '8px',
			10: '10px',
			12: '12px',
			14: '14px',
			16: '16px',
			18: '18px',
			20: '20px',
			22: '22px',
			24: '24px',
			26: '26px',
			28: '28px',
			30: '30px',
			32: '32px',
			34: '34px',
			36: '36px',
			38: '38px',
			40: '40px',
			42: '42px',
			44: '44px',
			46: '46px',
			48: '48px',
			50: '50px',
			52: '52px',
			54: '54px',
			56: '56px',
			58: '58px',
			60: '60px',
			62: '62px',
			64: '64px',
			66: '66px',
			68: '68px',
			70: '70px',
			72: '72px',
			74: '74px',
			76: '76px',
			78: '78px',
			80: '80px',
		}, // spacing
		fontWeight: {
			regular: 400,
			semibold: 600,
			bold: 700,
			normal: 'normal',
		},
		fontFamily: {
			'nunito-sans': ['Nunito Sans', 'Roboto', 'Helvetica Neue', 'sans-serif'],

			'svn-poppins': ['SVN-Poppins', 'Roboto', 'Helvetica Neue', 'sans-serif'],

			fas: 'Fontawesome 6 Pro',
		}, // fontFamily

		fontStyle: {
			normal: 'normal',
			italic: 'italic',
		}, // fontStyle

		extend: {
			lineHeight: {
				29: '29px',
				36: '36px',
				45: '45px',
				52: '52px',
			},
			margin: {
				8: '8px',
				16: '16px',
			},
			flexBasis: {
				45: '45%',
			},
		},
	},
	plugins: [],
}
