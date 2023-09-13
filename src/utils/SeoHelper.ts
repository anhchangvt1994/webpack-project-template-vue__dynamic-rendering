import { LinkHTMLAttributes } from 'vue'

type ExcludeUndefined<T> = Exclude<T, undefined>

export const enum SeoTagsEnum {
	title = 'title',
	keywords = 'keywords',
	description = 'description',
	og_description = 'og:description',
	twitter_title = 'twitter:title',
	robots = 'robots',
	canonical = 'canonical',
	og_type = 'og:type',
	og_title = 'og:title',
	og_url = 'og:url',
	og_site_name = 'og:site_name',
	og_image = 'og:image',
	og_image_width = 'og:image:width',
	og_image_height = 'og:image:height',
	alternate = 'alternate',
}

// NOTE - define SEO comment tag list
let _seoCommentTagList = {
	[SeoTagsEnum.title]: document.createComment(` ${SeoTagsEnum.title} `),
	[SeoTagsEnum.keywords]: document.createComment(` ${SeoTagsEnum.keywords} `),
	[SeoTagsEnum.description]: document.createComment(
		` ${SeoTagsEnum.description} `
	),
	[SeoTagsEnum.og_description]: document.createComment(
		` ${SeoTagsEnum.og_description} `
	),
	[SeoTagsEnum.twitter_title]: document.createComment(
		` ${SeoTagsEnum.twitter_title} `
	),
	[SeoTagsEnum.robots]: document.createComment(` ${SeoTagsEnum.robots} `),
	[SeoTagsEnum.canonical]: document.createComment(SeoTagsEnum.canonical),
	//phudnd
	[SeoTagsEnum.og_type]: document.createComment(` ${SeoTagsEnum.og_type} `),
	[SeoTagsEnum.og_title]: document.createComment(` ${SeoTagsEnum.og_title} `),
	[SeoTagsEnum.og_url]: document.createComment(` ${SeoTagsEnum.og_url} `),
	[SeoTagsEnum.og_site_name]: document.createComment(
		` ${SeoTagsEnum.og_site_name} `
	),
	[SeoTagsEnum.og_image]: document.createComment(` ${SeoTagsEnum.og_image} `),
	[SeoTagsEnum.og_image_width]: document.createComment(
		` ${SeoTagsEnum.og_image_width} `
	),
	[SeoTagsEnum.og_image_height]: document.createComment(
		` ${SeoTagsEnum.og_image_height} `
	),
	[SeoTagsEnum.alternate]: document.createComment(SeoTagsEnum.alternate),
}

// NOTE - generate seo meta tag handler method default
interface IGenerateDefaultHandlerSEOMetaTagParams<
	TInitParams = string,
	TSetupParams = string
> {
	tag?: Element
	comment?: Comment
	init?: (param?: TInitParams) => void
	setup?: (param?: TSetupParams) => void
	remove?: () => void
}

interface IGenerateDefaultHandlerSEOMetaTagResult<
	TInitParams = string,
	TSetupParams = string
> {
	tag?: Element
	comment?: Comment
	init?: (param?: TInitParams) => void
	setup?: (param?: TSetupParams) => void
	remove?: () => void
}

const __generateDefaultHandlerSEOMetaTag = <
	TInitParams = undefined,
	TSetupParams = string
>(
	objSetup: IGenerateDefaultHandlerSEOMetaTagParams<
		TInitParams,
		TSetupParams
	> = {
		remove() {
			if (!this.comment || !this.tag || !this.tag.parentElement) return

			this.tag.replaceWith(this.comment)
		}, // remove()
	}
) => {
	if (
		!objSetup ||
		!objSetup.tag ||
		typeof objSetup.tag !== 'object' ||
		!(objSetup.tag instanceof HTMLElement) ||
		!objSetup.comment ||
		!(objSetup.comment instanceof Comment)
	)
		return

	const tag = objSetup.tag as HTMLElement
	const comment = objSetup.comment as Comment

	type ItmpObjSetup = IGenerateDefaultHandlerSEOMetaTagResult<
		TInitParams,
		TSetupParams
	>

	const tmpObjSetup: {
		tag: ItmpObjSetup['tag']
		comment: ItmpObjSetup['comment']
		init?: ItmpObjSetup['init']
		setup?: ItmpObjSetup['setup']
		remove?: ItmpObjSetup['remove']
	} = {
		tag,
		comment,
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
			if (!content || typeof content !== 'string') {
				console.error('content must be string and has minimum 3 character!!!')
				return
			} else if (tag && comment) {
				comment.replaceWith(tag)
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
			if (!tag.parentElement) return

			tag.replaceWith(comment)
		} // setup()
	}

	return tmpObjSetup as ItmpObjSetup
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

// ANCHOR - init setup data for seo comment tag list
_seoCommentTagList = __findSEOComments(document.head)

// ANCHOR - define initial object for meta tag
let _metaTagInfoInitial = {
	title: __generateDefaultHandlerSEOMetaTag({
		tag:
			document.head.querySelector('title') || document.createElement('title'),
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
let _robotsMetaTagInfoInitial = __generateDefaultHandlerSEOMetaTag<
	undefined,
	{ index: boolean; follow: boolean }
>({
	tag: (() => {
		const tmpEl =
			document.head.querySelector('meta[name="robots"]') ||
			document.createElement('meta')
		tmpEl.setAttribute('name', 'robots')
		return tmpEl
	})(),
	comment: _seoCommentTagList.robots || null,
	setup(objSetup) {
		if (!objSetup)
			return console.error(
				'Need provide an object param {index: boolean, follow: boolean}'
			)

		objSetup = {
			index: typeof objSetup.index === 'undefined' ? true : !!objSetup.index,
			follow: typeof objSetup.follow === 'undefined' ? true : !!objSetup.follow,
		}

		let tmpMetaContent = ''

		tmpMetaContent = objSetup.index ? 'index' : 'noindex'
		tmpMetaContent += ',' + (objSetup.follow ? 'follow' : 'nofollow')

		if (
			!_robotsMetaTagInfoInitial ||
			!_robotsMetaTagInfoInitial.tag ||
			!_robotsMetaTagInfoInitial.comment
		)
			return

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
let _canonicalLinkTagInfoInitial = __generateDefaultHandlerSEOMetaTag({
	tag: (() => {
		const tmpEl =
			document.head.querySelector('link[rel="canonical"]') ||
			document.createElement('link')
		tmpEl.setAttribute('rel', 'canonical')
		return tmpEl
	})(),
	comment: _seoCommentTagList.canonical || null,
	setup(url) {
		if (!(typeof url === 'string') || !/^[http://|https://]/g.test(url)) return

		if (
			!_canonicalLinkTagInfoInitial ||
			!_canonicalLinkTagInfoInitial.tag ||
			!_canonicalLinkTagInfoInitial.tag.parentElement ||
			!_canonicalLinkTagInfoInitial.comment
		)
			return

		_canonicalLinkTagInfoInitial.comment.replaceWith(
			_canonicalLinkTagInfoInitial.tag
		)

		_canonicalLinkTagInfoInitial.tag.setAttribute('href', url)
	},
}) // canonical meta tag

// ANCHOR - define inital object for alternate link tag
let _alternateLinkTagInfoInitial = __generateDefaultHandlerSEOMetaTag<{
	lang: string
	country: string
}>({
	tag: (() => {
		const elAlternateLinkTag = document.querySelectorAll(
			'link[rel="alternate"]'
		) as unknown as Array<LinkHTMLAttributes>

		if (!elAlternateLinkTag.length) return

		const tmpTagList = {}

		elAlternateLinkTag.forEach(function (elLinkTag) {
			if (elLinkTag.hreflang) {
				tmpTagList[elLinkTag.hreflang.toLowerCase()] = elLinkTag
			} else {
				console.error('Alternate link tag need hrefLang attributes!')
			}
		})

		return tmpTagList as Element
	})(),
	init: function (params) {
		if (!params) return
		const { lang, country } = params
		const tmpLocaleCodeIdKey = lang + '-' + country.toLowerCase()

		if (!_alternateLinkTagInfoInitial || !_alternateLinkTagInfoInitial.tag)
			return

		if (
			_alternateLinkTagInfoInitial.tag[tmpLocaleCodeIdKey] &&
			_alternateLinkTagInfoInitial.tag[tmpLocaleCodeIdKey] instanceof
				HTMLLinkElement
		)
			return

		const tmpEl =
			document.head.querySelector('link[rel="alternate"]') ||
			document.createElement('link')
		tmpEl.setAttribute('rel', 'alternate')
		tmpEl.setAttribute('hrefLang', lang + '-' + country)
		_alternateLinkTagInfoInitial.tag[tmpLocaleCodeIdKey] = tmpEl
	},

	comment: _seoCommentTagList.alternate || null,

	setup: function (url) {
		if (!(typeof url === 'string') || !/^[http://|https://]/g.test(url)) {
			return
		}

		if (
			!_alternateLinkTagInfoInitial ||
			!_alternateLinkTagInfoInitial.tag ||
			!_alternateLinkTagInfoInitial.comment
		)
			return

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

interface ISetupMetaTagParams {
	[SeoTagsEnum.title]?: string
	[SeoTagsEnum.keywords]?: string
	[SeoTagsEnum.description]?: string
	[SeoTagsEnum.og_description]?: string
	[SeoTagsEnum.og_type]?: string
	[SeoTagsEnum.og_title]?: string
	[SeoTagsEnum.og_url]?: string
	[SeoTagsEnum.og_site_name]?: string
	[SeoTagsEnum.og_image]?: string
	[SeoTagsEnum.og_image_width]?: string
	[SeoTagsEnum.og_image_height]?: string
	[SeoTagsEnum.twitter_title]?: string
}
const _setMetaTag = (objSetup: ISetupMetaTagParams) => {
	if (!objSetup) {
		return
	}

	objSetup['og:description'] = objSetup['twitter:title'] = objSetup.description

	for (const key in objSetup) {
		if (objSetup[key] && typeof objSetup[key] !== 'object') {
			_metaTagInfoInitial[key].setup(objSetup[key])
		} else {
			_metaTagInfoInitial[key].remove(key)
		}
	}
} // _setMetaTag()

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

export const setMetaTag = _setMetaTag
export const removeMetaTag = _removeMetaTag
export const setRobotsTag =
	_robotsMetaTagInfoInitial?.setup as ExcludeUndefined<
		ExcludeUndefined<typeof _robotsMetaTagInfoInitial>['setup']
	>
export const removeRobotsTag =
	_robotsMetaTagInfoInitial?.remove as ExcludeUndefined<
		ExcludeUndefined<typeof _robotsMetaTagInfoInitial>['remove']
	>
export const setCanonicalTag =
	_canonicalLinkTagInfoInitial?.setup as ExcludeUndefined<
		ExcludeUndefined<typeof _canonicalLinkTagInfoInitial>['setup']
	>
export const removeCanonicalTag =
	_canonicalLinkTagInfoInitial?.remove as ExcludeUndefined<
		ExcludeUndefined<typeof _canonicalLinkTagInfoInitial>['remove']
	>
export const initAlternateTag =
	_alternateLinkTagInfoInitial?.init as ExcludeUndefined<
		ExcludeUndefined<typeof _alternateLinkTagInfoInitial>['init']
	>
export const setAlternateTag =
	_alternateLinkTagInfoInitial?.setup as ExcludeUndefined<
		ExcludeUndefined<typeof _alternateLinkTagInfoInitial>['setup']
	>
