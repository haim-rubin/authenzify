import {
  UserSchema,
  VerificationSchema,
} from '../../databases/mongodb/entities/schema'
import { initModelsCollections } from '../../databases/mongodb/initialize-models-collections'
import { connect } from '../../databases/mongodb/connection'
import { IDalUsersService } from '../../../interfaces'
import { TModelsCollections } from '../../databases/mongodb/types'
import { MongoUsersService } from './MongoUsersService'
import { MongoVerificationsService } from './VerificationsService'
import { IDalVerificationsService } from '../../../interfaces/IUsersService'

export const initMongoDb = async ({
  config,
}: {
  config: any
}): Promise<TModelsCollections> => {
  const connection = await connect(config)
  const modelsCollections = initModelsCollections({
    connection,
    modelsInfo: [
      {
        modelInfo: { key: 'User', schema: UserSchema },
        collectionInfo: { name: 'user', alias: 'users' },
      },
      {
        modelInfo: { key: 'Verification', schema: VerificationSchema },
        collectionInfo: { name: 'verification', alias: 'verifications' },
      },
    ],
  })

  return modelsCollections
}

export const initMongoDalServices = async ({
  config,
}: {
  config: any
}): Promise<{
  iDalUsersService: IDalUsersService
  iDalVerificationsService: IDalVerificationsService
}> => {
  const modelsCollections = await initMongoDb({ config })
  const iDalUsersService = new MongoUsersService(modelsCollections)
  const iDalVerificationsService = new MongoVerificationsService(
    modelsCollections,
  )
  return { iDalUsersService, iDalVerificationsService }
}
