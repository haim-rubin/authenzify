import { v4 } from 'uuid'
export const DATABASE_ID_PREFIX = Object.freeze({
  USER: 'usr',
  VERIFICATION: 'vrf',
  PERMISSION: 'prm',
  PERMISSIONS_GROUP: 'role',
  TENANT: 'tnt',
})

const generateId = () => {
  return v4()
}

export const generateUserId = () => {
  return `${DATABASE_ID_PREFIX.USER}_${generateId()}`
}

export const generateVerificationId = () => {
  return `${DATABASE_ID_PREFIX.VERIFICATION}_${generateId()}`
}

export const generatePermissionId = () => {
  return `${DATABASE_ID_PREFIX.PERMISSION}_${generateId()}`
}

export const generatePermissionsGroupId = () => {
  return `${DATABASE_ID_PREFIX.PERMISSIONS_GROUP}_${generateId()}`
}

export const generateTenantId = () => {
  return `${DATABASE_ID_PREFIX.TENANT}_${generateId()}`
}
