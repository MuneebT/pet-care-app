import { Timestamp } from 'firebase/firestore';

export type RecordType = 'vaccination' | 'treatment' | 'checkup' | 'surgery' | 'other';

export interface HealthRecord {
  id?: string;
  petId: string;
  recordType: RecordType;
  name: string;
  description: string;
  date: Timestamp | Date;
  medicine?: string;
  dosage?: string;
  notes?: string;
  vetId: string;
  vetName: string;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

export interface HealthRecordFormData {
  recordType: RecordType;
  name: string;
  description: string;
  date: string;
  medicine: string;
  dosage: string;
  notes: string;
}
