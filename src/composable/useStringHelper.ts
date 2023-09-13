import {
	generateSentenceCase,
	generateTitleCase,
	getSlug,
	getSlugWithoutDash,
	getUnsignedLetters,
} from 'utils/StringHelper'

export const useSlug = () => {
	const state = ref<string>()
	const setState = (param: string) => {
		state.value = getSlug(param)
	}

	return [state, setState]
} // useSlug

export const useSlugWithoutDash = () => {
	const state = ref<string>()
	const setState = (param: string) => {
		state.value = getSlugWithoutDash(param)
	}

	return [state, setState]
} // useSlugWithoutDash

export const useUnsignedLetters = () => {
	const state = ref<string>()
	const setState = (param: string) => {
		state.value = getUnsignedLetters(param)
	}

	return [state, setState]
} // useUnsignedLetters

export const useTitleCase = () => {
	const state = ref<string>()
	const setState = (param: string) => {
		state.value = generateTitleCase(param)
	}

	return [state, setState]
} // useTitleCase

export const useSentenceCase = () => {
	const state = ref<string>()
	const setState = (param: string) => {
		state.value = generateSentenceCase(param)
	}

	return [state, setState]
} // useSentenceCase
