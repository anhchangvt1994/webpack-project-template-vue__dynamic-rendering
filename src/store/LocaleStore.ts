export type ILocaleInfo = {
	lang?: string
	country?: string
}
export const LocaleState = reactive<ILocaleInfo>({})
export const setLocaleState = (locale: ILocaleInfo) => {
	if (!locale) return

	LocaleState.lang = locale.lang
	LocaleState.country = locale.country
}
