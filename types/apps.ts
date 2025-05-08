export enum AppName {
  GoogleDrive = 'Google Drive',
  Microsoft365 = 'Microsoft 365',
  Dropbox = 'Dropbox'
}

export enum Status {
  Connected = 'Connected',
  Disconnected = 'Disconnected',
}

export enum ManagedBy {
  Company = 'Company',
  Personal = 'Personal'
}

export enum Category {
  Storage = 'Storage',
  Productivity = 'Productivity'
}

export interface App {
  name: AppName;
  status: Status;
  category: Category;
  description?: string;
  icon: string;
  managedBy: ManagedBy;
  lastSync?: string;
  storageUsed?: string;
} 