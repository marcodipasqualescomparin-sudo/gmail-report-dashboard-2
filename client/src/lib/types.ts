export type AndreaniReport = {
  id: number;
  userId: number;
  subject: string;
  priority: 'ALTA' | 'MEDIA' | 'BASSA';
  summary?: string | null;
  sender?: string | null;
  messageId?: string | null;
  receivedAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type DdtReport = {
  id: number;
  userId: number;
  reportType: 'DDT' | 'TRASFERIMENTO';
  reportNumber: string;
  sender?: string | null;
  recipient?: string | null;
  supplier?: string | null;
  productCategory: 'iPhone' | 'iPad' | 'MacBook' | 'Apple Watch';
  quantity?: number | null;
  details?: string | null;
  messageId?: string | null;
  receivedAt: Date;
  createdAt: Date;
  updatedAt: Date;
};
