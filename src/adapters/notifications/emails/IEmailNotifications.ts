import { IUser } from '../../../interfaces'
import { IVerification } from '../../../interfaces/IUser'

export interface IEmailNotifications {
  sendActivationMail(user: IUser, verification: IVerification): Promise<any>
  sendVerificationMail(user: IUser, verification: IVerification): Promise<any>
  sendForgotPasswordMail(user: IUser, verification: IVerification): Promise<any>
}
