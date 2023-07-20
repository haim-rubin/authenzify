import {
  UserSchema,
  VerificationSchema,
  PermissionSchema,
  PermissionsGroupSchema,
} from '../../databases/mongodb/entities/schema'
import { initModelsCollections } from '../../databases/mongodb/initialize-models-collections'
import { connect } from '../../databases/mongodb/connection'
import { IDalPermissionsService, IDalUsersService } from '../../../interfaces'
import { TModelsCollections } from '../../databases/mongodb/types'
import { MongoUsersService } from './MongoUsersService'
import { MongoVerificationsService } from './VerificationsService'
import { IDalVerificationsService } from '../../../interfaces/IVerificationService'
import { MongoPermissionsService } from './MongoPermissionsService'

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
      {
        modelInfo: { key: 'Permission', schema: PermissionSchema },
        collectionInfo: { name: 'permission', alias: 'permissions' },
      },
      {
        modelInfo: { key: 'PermissionsGroup', schema: PermissionsGroupSchema },
        collectionInfo: { name: 'permission', alias: 'permissions' },
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
  iDalPermissionsService: IDalPermissionsService
}> => {
  const modelsCollections = await initMongoDb({ config })
  const iDalUsersService = new MongoUsersService(modelsCollections)
  const iDalVerificationsService = new MongoVerificationsService(
    modelsCollections,
  )
  const iDalPermissionsService = new MongoPermissionsService(modelsCollections)
  return { iDalUsersService, iDalVerificationsService, iDalPermissionsService }
}
