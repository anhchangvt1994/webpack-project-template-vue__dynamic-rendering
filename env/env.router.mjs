export default {
	prefix: 'router',
	data: {
		base: {
			path: '/',
		},
		home: {
			name: 'HomePage',
			path: '/',
		},
		content: {
			name: 'ContentPage',
			path: '/:title?-:id(\\d+)?',
		},
		content_comment: {
			name: 'ContentComment',
			path: 'comment',
		},
		comment: {
			name: 'CommentPage',
			path: 'comment/detail',
		},
		login: {
			name: 'LoginPage',
			path: '/login',
		},
		not_found: {
			name: 'NotFoundPage',
			path: '/:pathMatch(.*)*',
		},
	},
}
