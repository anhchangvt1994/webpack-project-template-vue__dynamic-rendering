export type IUserInfo = {
	email: string
}

export const UserInfoState = reactive<IUserInfo>({
	email: '',
})
