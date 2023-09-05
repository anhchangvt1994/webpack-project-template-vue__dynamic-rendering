const SeoTagHandler = (() => {
	// NOTE - define SEO comment tag list
	let _seoCommentTagList = {
		title: document.createComment(' title '),
		keywords: document.createComment(' keywords '),
		description: document.createComment(' description '),
		'og:description': document.createComment(' og:description '),
		'twitter:title': document.createComment(' twitter:title '),
		robots: document.createComment(' robots '),
		canonical: document.createComment('canonical'),
		//phudnd
		'og:type': document.createComment(' og:type '),
		'og:title': document.createComment(' og:title '),
		'og:url': document.createComment(' og:url '),
		'og:site_name': document.createComment(' og:site_name '),
		'og:image': document.createComment(' og:image '),
		'og:image:width': document.createComment(' og:image:width '),
		'og:image:height': document.createComment(' og:image:height '),
		alternate: document.createComment('alternate'),
	}

	// NOTE - define object of meta tag info to replace between comment tag and seo tag
	let _metaTagInfoInitial = {}
	let _robotsMetaTagInfoInitial = {}
	let _canonicalLinkTagInfoInitial = {}
	let _alternateLinkTagInfoInitial = {}

	// NOTE - define total of seo comment tag
	// const _totalSEOCommentTag = 6;

	// NOTE - generate seo meta tag handler method default
	const __generateDefaultHandlerSEOMetaTag = (
		objSetup = {
			tag: null,
			comment: null,
			init: null,
			setup: null,

			remove() {
				if (!this.tag.parentElement) {
					return
				}

				this.tag.replaceWith(this.comment)
			}, // remove()
		}
	) => {
		if (
			!objSetup ||
			(!objSetup.tag && typeof objSetup.tag !== 'object') ||
			(typeof objSetup.tag !== 'object' &&
				!(objSetup.tag instanceof HTMLElement)) ||
			!objSetup.comment ||
			!(objSetup.comment instanceof Comment)
		) {
			return {}
		}

		const tmpObjSetup = {
			tag: objSetup.tag,
			comment: objSetup.comment,
		}

		// NOTE - Init for init function (optinal)
		if (typeof objSetup.init === 'function') {
			tmpObjSetup.init = objSetup.init
		}

		// NOTE - Init for setup function
		if (typeof objSetup.setup === 'function') {
			tmpObjSetup.setup = objSetup.setup
		} else {
			tmpObjSetup.setup = function (content) {
				if (!content || typeof content === 'object') {
					console.error('content must be string and has minimum 3 character!!!')
					return
				} else if (!this.tag.parentElement && this.comment) {
					this.comment.replaceWith(this.tag)
				}

				if (this.tag instanceof HTMLMetaElement) {
					this.tag.setAttribute('content', content)
				} else if (this.tag instanceof HTMLTitleElement) {
					this.tag.innerText = content
				}
			} // setup()
		}

		// NOTE - Init for remove function
		if (typeof objSetup.remove === 'function') {
			tmpObjSetup.remove = objSetup.remove
		} else {
			tmpObjSetup.remove = function () {
				if (!this.tag.parentElement) {
					return
				}

				this.tag.replaceWith(this.comment)
			} // setup()
		}

		return tmpObjSetup
	} // __generateDefaultHandlerSEOMetaTag()

	// NOTE - find seo comment tag method
	const __findSEOComments = (el) => {
		const objSEOCommentTags = _seoCommentTagList

		for (let i = 0; i < el.childNodes.length; i++) {
			const node = el.childNodes[i]
			if (
				node.nodeType === 8 &&
				/^[\s?]*(title|keywords|og\:description|description|twitter:title|robots|canonical|og\:type|og\:title|og\:url|og\:site_name|og\:image|og\:image\:width|og\:image\:height|alternate)[\s?]*$/g.test(
					node.textContent
				)
			) {
				objSEOCommentTags[node.textContent.trim()] = node
			}
		}
		return objSEOCommentTags
	} // __findSEOComments()

	// NOTE - init setup data for seo tag
	;(() => {
		// ANCHOR - init setup data for seo comment tag list
		_seoCommentTagList = __findSEOComments(document.head)

		// ANCHOR - define initial object for meta tag
		_metaTagInfoInitial = {
			title: __generateDefaultHandlerSEOMetaTag({
				tag:
					document.head.querySelector('title') ||
					document.createElement('title'),
				comment: _seoCommentTagList.title || null,
			}), // title
			keywords: __generateDefaultHandlerSEOMetaTag({
				tag: (() => {
					const tmpEl =
						document.querySelector('meta[name="keywords"]') ||
						document.createElement('meta')
					tmpEl.setAttribute('name', 'keywords')
					return tmpEl
				})(),
				comment: _seoCommentTagList.keywords || null,
			}), // keywords
			description: __generateDefaultHandlerSEOMetaTag({
				tag: (() => {
					const tmpEl =
						document.querySelector('meta[name="description"]') ||
						document.createElement('meta')
					tmpEl.setAttribute('name', 'description')
					return tmpEl
				})(),
				comment: _seoCommentTagList.description || null,
			}), // description
			'og:description': __generateDefaultHandlerSEOMetaTag({
				tag: (() => {
					const tmpEl =
						document.querySelector('meta[property="og:description"]') ||
						document.createElement('meta')
					tmpEl.setAttribute('property', 'og:description')
					return tmpEl
				})(),
				comment: _seoCommentTagList['og:description'] || null,
			}), // og:description
			'og:type': __generateDefaultHandlerSEOMetaTag({
				tag: (() => {
					const tmpEl =
						document.querySelector('meta[property="og:type"]') ||
						document.createElement('meta')
					tmpEl.setAttribute('property', 'og:type')
					return tmpEl
				})(),
				comment: _seoCommentTagList['og:type'] || null,
			}), // og:type
			'og:title': __generateDefaultHandlerSEOMetaTag({
				tag: (() => {
					const tmpEl =
						document.querySelector('meta[property="og:title"]') ||
						document.createElement('meta')
					tmpEl.setAttribute('property', 'og:title')
					return tmpEl
				})(),
				comment: _seoCommentTagList['og:title'] || null,
			}), // og:title
			'og:url': __generateDefaultHandlerSEOMetaTag({
				tag: (() => {
					const tmpEl =
						document.querySelector('meta[property="og:url"]') ||
						document.createElement('meta')
					tmpEl.setAttribute('property', 'og:url')
					return tmpEl
				})(),
				comment: _seoCommentTagList['og:url'] || null,
			}), // og:url
			'og:site_name': __generateDefaultHandlerSEOMetaTag({
				tag: (() => {
					const tmpEl =
						document.querySelector('meta[property="og:site_name"]') ||
						document.createElement('meta')
					tmpEl.setAttribute('property', 'og:site_name')
					return tmpEl
				})(),
				comment: _seoCommentTagList['og:site_name'] || null,
			}), // og:site_name
			'og:image': __generateDefaultHandlerSEOMetaTag({
				tag: (() => {
					const tmpEl =
						document.querySelector('meta[property="og:image"]') ||
						document.createElement('meta')
					tmpEl.setAttribute('property', 'og:image')
					return tmpEl
				})(),
				comment: _seoCommentTagList['og:image'] || null,
			}), // og:image
			'og:image:width': __generateDefaultHandlerSEOMetaTag({
				tag: (() => {
					const tmpEl =
						document.querySelector('meta[property="og:image:width"]') ||
						document.createElement('meta')
					tmpEl.setAttribute('property', 'og:image:width')
					return tmpEl
				})(),
				comment: _seoCommentTagList['og:image:width'] || null,
			}), // og:image:width
			'og:image:height': __generateDefaultHandlerSEOMetaTag({
				tag: (() => {
					const tmpEl =
						document.querySelector('meta[property="og:image:height"]') ||
						document.createElement('meta')
					tmpEl.setAttribute('property', 'og:image:height')
					return tmpEl
				})(),
				comment: _seoCommentTagList['og:image:height'] || null,
			}), // og:image:height
			'twitter:title': __generateDefaultHandlerSEOMetaTag({
				tag: (() => {
					const tmpEl =
						document.querySelector('meta[name="twitter:title"]') ||
						document.createElement('meta')
					tmpEl.setAttribute('name', 'twitter:title')
					return tmpEl
				})(),
				comment: _seoCommentTagList['twitter:title'] || null,
			}), // twitter:title
		}

		// ANCHOR - define initial object for robots meta tag
		_robotsMetaTagInfoInitial = __generateDefaultHandlerSEOMetaTag({
			tag: (() => {
				const tmpEl =
					document.head.querySelector('meta[name="robots"]') ||
					document.createElement('meta')
				tmpEl.setAttribute('name', 'robots')
				return tmpEl
			})(),
			comment: _seoCommentTagList.robots || null,
			setup(objSetup) {
				objSetup = {
					index:
						typeof objSetup.index === 'undefined' ? true : !!objSetup.index,
					follow:
						typeof objSetup.follow === 'undefined' ? true : !!objSetup.follow,
				}

				let tmpMetaContent = ''

				tmpMetaContent = objSetup.index ? 'index' : 'noindex'
				tmpMetaContent += ',' + (objSetup.follow ? 'follow' : 'nofollow')

				if (
					!_robotsMetaTagInfoInitial.tag.parentElement &&
					_robotsMetaTagInfoInitial.comment
				) {
					_robotsMetaTagInfoInitial.comment.replaceWith(
						_robotsMetaTagInfoInitial.tag
					)
				}

				_robotsMetaTagInfoInitial.tag.setAttribute('content', tmpMetaContent)
			},
		}) // robots meta tag

		// ANCHOR - define initial object for robots meta tag
		_canonicalLinkTagInfoInitial = __generateDefaultHandlerSEOMetaTag({
			tag: (() => {
				const tmpEl =
					document.head.querySelector('link[rel="canonical"]') ||
					document.createElement('link')
				tmpEl.setAttribute('rel', 'canonical')
				return tmpEl
			})(),
			comment: _seoCommentTagList.canonical || null,
			setup(url) {
				if (!typeof url === 'string' || !/^[http://|https://]/g.test(url)) {
					return
				}

				if (
					!_canonicalLinkTagInfoInitial.tag.parentElement &&
					_canonicalLinkTagInfoInitial.comment
				) {
					_canonicalLinkTagInfoInitial.comment.replaceWith(
						_canonicalLinkTagInfoInitial.tag
					)
				}

				_canonicalLinkTagInfoInitial.tag.setAttribute('href', url)
			},
		}) // canonical meta tag

		// ANCHOR - define inital object for alternate link tag
		_alternateLinkTagInfoInitial = __generateDefaultHandlerSEOMetaTag({
			tag: (() => {
				const elAlternateLinkTag = document.querySelectorAll(
					'link[rel="alternate"]'
				)

				if (!elAlternateLinkTag.length) {
					return {}
				}

				let tmpTagList = {}

				elAlternateLinkTag.forEach(function (elLinkTag) {
					if (elLinkTag.hreflang) {
						tmpTagList[elLinkTag.hreflang.toLowerCase()] = elLinkTag
					} else {
						console.error('Alternate link tag need hrefLang attributes!')
					}
				})

				return tmpTagList
			})(),
			init: function (lang, country) {
				const tmpLocaleCodeIdKey = lang + '-' + country.toLowerCase()

				if (
					_alternateLinkTagInfoInitial.tag[tmpLocaleCodeIdKey] &&
					_alternateLinkTagInfoInitial.tag[tmpLocaleCodeIdKey] instanceof
						HTMLLinkElement
				) {
					return
				}

				const tmpEl =
					document.head.querySelector('link[rel="alternate"]') ||
					document.createElement('link')
				tmpEl.setAttribute('rel', 'alternate')
				tmpEl.setAttribute('hrefLang', lang + '-' + country)
				_alternateLinkTagInfoInitial.tag[tmpLocaleCodeIdKey] = tmpEl
			},

			comment: _seoCommentTagList.alternate || null,

			setup: function (url) {
				if (!typeof url === 'string' || !/^[http://|https://]/g.test(url)) {
					return
				}

				for (const localeCodeId in _alternateLinkTagInfoInitial.tag) {
					const tmpUrlWithLocaleCodeId = url.replace(
						/\/[A-Za-z]+(-)+[A-Za-z]+(|$)/,
						'/' + localeCodeId
					)

					_alternateLinkTagInfoInitial.tag[localeCodeId].setAttribute(
						'href',
						tmpUrlWithLocaleCodeId
					)

					if (
						!_alternateLinkTagInfoInitial.tag[localeCodeId].parentElement &&
						_alternateLinkTagInfoInitial.comment
					) {
						_alternateLinkTagInfoInitial.comment.before(
							_alternateLinkTagInfoInitial.tag[localeCodeId]
						)
					}
				}

				_alternateLinkTagInfoInitial.comment.remove()
			},
		}) // alternate link tag
	})()

	const _defaultMetaTag = () => {} // _defaultMetaTag()

	const _setupMetaTag = (objSetup) => {
		if (!objSetup) {
			return
		}

		objSetup['og:description'] = objSetup['twitter:title'] =
			objSetup.description

		for (const key in objSetup) {
			if (objSetup[key] && typeof objSetup[key] !== 'object') {
				_metaTagInfoInitial[key].setup(objSetup[key])
			} else {
				_metaTagInfoInitial[key].remove(key)
			}
		}
	} // _setupMetaTag()

	const _removeMetaTag = (info) => {
		// NOTE - if info is key
		if (typeof info === 'string' && _metaTagInfoInitial[info]) {
			_metaTagInfoInitial[info].remove()
		} else if (typeof info === 'object') {
			info.forEach((key) => {
				_metaTagInfoInitial[key]?.remove()
			})
		} else {
			for (const key in _seoCommentTagList) {
				_metaTagInfoInitial[key]?.remove()
			}
		}
	} // _removeMetaTag()

	return {
		setup: _setupMetaTag,
		remove: _removeMetaTag,

		setupRobots: _robotsMetaTagInfoInitial.setup,
		removeRobots: _robotsMetaTagInfoInitial.remove,

		setupCanonical: _canonicalLinkTagInfoInitial.setup,
		removeCanonical: _canonicalLinkTagInfoInitial.remove,

		initAlternate: _alternateLinkTagInfoInitial.init,
		setupAlternate: _alternateLinkTagInfoInitial.setup,
	}
})()

export { SeoTagHandler }
