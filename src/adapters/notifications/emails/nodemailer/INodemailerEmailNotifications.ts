import { IEmailInfo } from '../util/types-interfaces'

export type TEmailConfig = {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
}

export interface INodemailerEmailNotifications {
  configure(emailConfig: TEmailConfig): Promise<any>
  sendMail(emailInfo: IEmailInfo): Promise<any>
}
