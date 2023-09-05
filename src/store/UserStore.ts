export type IUserInfo = {
	email: string
}

export const UserInfo: IUserInfo = {
	email: '',
}

export const UserInfoState = reactive<IUserInfo>({
	email: '',
})
