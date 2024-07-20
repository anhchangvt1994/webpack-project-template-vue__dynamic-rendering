import { UserInfoState } from 'app/store/UserStore'
import { ICertCustomizationInfo } from './types'

export default function useCertificateCustomizationInfo(): ICertCustomizationInfo {
	return {
		user: UserInfoState,
	}
}
