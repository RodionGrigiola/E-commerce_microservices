export enum EcomEvent {
  ACCOUNT_REGISTERED = "auth.account.registered",

  PROFILE_UPDATED = "users.profile.updated",
  PROFILE_DELETED = "users.profile.deleted",
}

export interface AccountRegisteredPayload {
  id: string;
  email: string;
  createdAt: string;
}

export interface ProfileUpdatedPayload {
  id: string;
  email?: string;
}

export interface ProfileDeletedPayload {
  id: string;
}

export interface EcomEventPayloads {
  [EcomEvent.ACCOUNT_REGISTERED]: AccountRegisteredPayload;
  [EcomEvent.PROFILE_UPDATED]: ProfileUpdatedPayload;
  [EcomEvent.PROFILE_DELETED]: ProfileDeletedPayload;
}
