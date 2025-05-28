import { TVerificationDetails } from '../types'
export interface IVerification {
  id: string
  userId: string
  type: string
  isDeleted: boolean
  extraInfo: any
}

export interface IDalVerificationsService {
  findById({ id, type }: { id: string; type: string }): Promise<IVerification>
  findByUserId({
    userId,
    type,
  }: {
    userId: string
    type: string
  }): Promise<IVerification>
  findOne({
    id,
    type,
    isDeleted,
  }: {
    id: string
    type: string
    isDeleted: boolean
  }): Promise<IVerification>
  create(verification: TVerificationDetails): Promise<IVerification>
  find(filter: any): Promise<[IVerification]>
  delete(id: string): Promise<boolean>
}

export interface IVerificationsService {
  createVerification(
    verificationDetails: TVerificationDetails,
  ): Promise<IVerification>
}
