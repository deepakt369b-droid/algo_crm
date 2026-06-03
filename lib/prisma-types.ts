// Auto-generated types to replace @prisma/client

export enum crm_Enrichment_Status {
  PENDING = "PENDING",
  RUNNING = "RUNNING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  SKIPPED = "SKIPPED",
}

export enum crm_AuditLog_Action {
  created = "created",
  updated = "updated",
  deleted = "deleted",
  restored = "restored",
  relation_added = "relation_added",
  relation_removed = "relation_removed",
}

export enum crm_Opportunity_Status {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  PENDING = "PENDING",
  CLOSED = "CLOSED",
}

export enum crm_Product_Type {
  PRODUCT = "PRODUCT",
  SERVICE = "SERVICE",
}

export enum crm_Product_Status {
  DRAFT = "DRAFT",
  ACTIVE = "ACTIVE",
  ARCHIVED = "ARCHIVED",
}

export enum crm_Billing_Period {
  MONTHLY = "MONTHLY",
  QUARTERLY = "QUARTERLY",
  ANNUALLY = "ANNUALLY",
  ONE_TIME = "ONE_TIME",
}

export enum crm_AccountProduct_Status {
  ACTIVE = "ACTIVE",
  EXPIRED = "EXPIRED",
  CANCELLED = "CANCELLED",
  PENDING = "PENDING",
}

export enum crm_Discount_Type {
  PERCENTAGE = "PERCENTAGE",
  FIXED = "FIXED",
}

export enum crm_Contracts_Status {
  NOTSTARTED = "NOTSTARTED",
  INPROGRESS = "INPROGRESS",
  SIGNED = "SIGNED",
}

export enum ExchangeRateSource {
  MANUAL = "MANUAL",
  ECB = "ECB",
}

export enum crm_Activity_Type {
  call = "call",
  meeting = "meeting",
  note = "note",
  email = "email",
}

export enum crm_Activity_Status {
  scheduled = "scheduled",
  completed = "completed",
  cancelled = "cancelled",
}

export enum DocumentSystemType {
  RECEIPT = "RECEIPT",
  CONTRACT = "CONTRACT",
  OFFER = "OFFER",
  OTHER = "OTHER",
}

export enum DocumentProcessingStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  READY = "READY",
  FAILED = "FAILED",
}

export enum taskStatus {
  ACTIVE = "ACTIVE",
  PENDING = "PENDING",
  COMPLETE = "COMPLETE",
}

export enum ActiveStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  PENDING = "PENDING",
}

export enum AppRole {
  superadmin = "superadmin",
  user = "user",
  manager = "manager",
  admin = "admin",
}

export enum Language {
  cz = "cz",
  en = "en",
  de = "de",
  uk = "uk",
  ar = "ar",
}

export enum ApiKeyScope {
  SYSTEM = "SYSTEM",
  USER = "USER",
}

export enum ApiKeyProvider {
  OPENAI = "OPENAI",
  FIRECRAWL = "FIRECRAWL",
  ANTHROPIC = "ANTHROPIC",
  GROQ = "GROQ",
}

export enum EmailFolder {
  INBOX = "INBOX",
  SENT = "SENT",
}

export enum Invoice_Status {
  DRAFT = "DRAFT",
  ISSUED = "ISSUED",
  SENT = "SENT",
  PARTIALLY_PAID = "PARTIALLY_PAID",
  PAID = "PAID",
  OVERDUE = "OVERDUE",
  CANCELLED = "CANCELLED",
  DISPUTED = "DISPUTED",
  REFUNDED = "REFUNDED",
  WRITTEN_OFF = "WRITTEN_OFF",
}

export enum Invoice_Type {
  INVOICE = "INVOICE",
  CREDIT_NOTE = "CREDIT_NOTE",
  PROFORMA = "PROFORMA",
}

export enum PurchaseOrderStatus {
  DRAFT = "DRAFT",
  PENDING_APPROVAL = "PENDING_APPROVAL",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  ORDERED = "ORDERED",
  PARTIALLY_RECEIVED = "PARTIALLY_RECEIVED",
  RECEIVED = "RECEIVED",
  CANCELLED = "CANCELLED",
}

export enum InventoryMovementType {
  RECEIVED = "RECEIVED",
  SHIPPED = "SHIPPED",
  ADJUSTMENT = "ADJUSTMENT",
  TRANSFER_IN = "TRANSFER_IN",
  TRANSFER_OUT = "TRANSFER_OUT",
  RETURN = "RETURN",
  WRITE_OFF = "WRITE_OFF",
}

export enum FeedbackStatus {
  OPEN = "OPEN",
  IN_PROGRESS = "IN_PROGRESS",
  RESOLVED = "RESOLVED",
  CLOSED = "CLOSED",
}

export enum FeedbackPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

export type crm_Accounts = {
  id: string;
  v: number;
  createdAt: Date;
  createdBy?: string;
  updatedAt?: Date;
  updatedBy?: string;
  annual_revenue?: string;
  assigned_to?: string;
  billing_city?: string;
  billing_country?: string;
  billing_postal_code?: string;
  billing_state?: string;
  billing_street?: string;
  company_id?: string;
  description?: string;
  email?: string;
  employees?: string;
  fax?: string;
  industry?: string;
  member_of?: string;
  name: string;
  office_phone?: string;
  shipping_city?: string;
  shipping_country?: string;
  shipping_postal_code?: string;
  shipping_state?: string;
  shipping_street?: string;
  status?: string;
  type?: string;
  vat?: string;
  website?: string;
  deletedAt?: Date;
  deletedBy?: string;
  contacts: crm_Contacts[];
  leads: crm_Leads[];
  converted_targets: crm_Targets[];
  industry_type?: crm_Industry_Type;
  opportunities: crm_Opportunities[];
  assigned_to_user?: Users;
  crm_accounts_tasks: crm_Accounts_Tasks[];
  contracts: crm_Contracts[];
  documents: DocumentsToAccounts[];
  watchers: AccountWatchers[];
  embedding?: crm_Embeddings_Accounts;
  emails: EmailsToAccounts[];
  accountProducts: crm_AccountProducts[];
  invoices: Invoices[];
  purchaseOrders: PurchaseOrders[];
};

export type crm_Leads = {
  id: string;
  v: number;
  createdAt?: Date;
  createdBy?: string;
  updatedAt?: Date;
  updatedBy?: string;
  firstName?: string;
  lastName: string;
  company?: string;
  jobTitle?: string;
  email?: string;
  phone?: string;
  description?: string;
  lead_source_id?: string;
  lead_status_id?: string;
  lead_type_id?: string;
  lead_source?: crm_Lead_Sources;
  lead_status?: crm_Lead_Statuses;
  lead_type?: crm_Lead_Types;
  refered_by?: string;
  campaign?: string;
  assigned_to?: string;
  assigned_to_user?: Users;
  accountsIDs?: string;
  assigned_accounts?: crm_Accounts;
  documents: DocumentsToLeads[];
  embedding?: crm_Embeddings_Leads;
  deletedAt?: Date;
  deletedBy?: string;
};

export type crm_Contact_Enrichment = {
  id: string;
  contactId: string;
  status: crm_Enrichment_Status;
  fields: String[];
  result?: any;
  error?: string;
  triggeredBy?: string;
  createdAt: Date;
  updatedAt: Date;
  contact: crm_Contacts;
  triggered_by_user?: Users;
};

export type crm_Target_Enrichment = {
  id: string;
  targetId: string;
  status: crm_Enrichment_Status;
  fields: String[];
  result?: any;
  error?: string;
  triggeredBy?: string;
  createdAt: Date;
  updatedAt: Date;
  target: crm_Targets;
  triggered_by_user?: Users;
};

export type crm_Target_Contact = {
  id: string;
  targetId: string;
  contactId?: string;
  name?: string;
  email?: string;
  title?: string;
  phone?: string;
  linkedinUrl?: string;
  source: string;
  enrichStatus: crm_Enrichment_Status;
  enrichedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  target: crm_Targets;
  contact?: crm_Contacts;
};

export type crm_Opportunities = {
  id: string;
  v: number;
  account?: string;
  assigned_to?: string;
  budget: any;
  campaign?: string;
  close_date?: Date;
  contact?: string;
  createdBy?: string;
  created_on?: Date;
  createdAt: Date;
  last_activity?: Date;
  updatedAt?: Date;
  updatedBy?: string;
  last_activity_by?: string;
  currency?: string;
  snapshot_rate?: any;
  description?: string;
  expected_revenue: any;
  name?: string;
  next_step?: string;
  sales_stage?: string;
  type?: string;
  status?: crm_Opportunity_Status;
  assigned_type?: crm_Opportunities_Type;
  assigned_sales_stage?: crm_Opportunities_Sales_Stages;
  assigned_to_user?: Users;
  created_by_user?: Users;
  assigned_account?: crm_Accounts;
  assigned_campaings?: crm_campaigns;
  assigned_currency?: Currency;
  documents: DocumentsToOpportunities[];
  contacts: ContactsToOpportunities[];
  embedding?: crm_Embeddings_Opportunities;
  lineItems: crm_OpportunityLineItems[];
  deletedAt?: Date;
  deletedBy?: string;
};

export type crm_campaigns = {
  id: string;
  v: number;
  name: string;
  description?: string;
  status?: string;
  channel?: string;
  template_id?: string;
  from_name?: string;
  reply_to?: string;
  scheduled_at?: Date;
  sent_at?: Date;
  created_by?: string;
  created_on?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  deletedBy?: string;
  template?: crm_campaign_templates;
  created_by_user?: Users;
  steps: crm_campaign_steps[];
  target_lists: CampaignToTargetLists[];
  sends: crm_campaign_sends[];
  opportunities: crm_Opportunities[];
};

export type crm_campaign_templates = {
  id: string;
  name: string;
  description?: string;
  subject_default?: string;
  content_html: string;
  content_json: any;
  created_by?: string;
  created_on?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  deletedBy?: string;
  created_by_user?: Users;
  campaigns: crm_campaigns[];
  steps: crm_campaign_steps[];
};

export type crm_campaign_steps = {
  id: string;
  campaign_id: string;
  order: number;
  template_id: string;
  subject: string;
  delay_days: number;
  send_to: string;
  scheduled_at?: Date;
  sent_at?: Date;
  campaign: crm_campaigns;
  template: crm_campaign_templates;
  sends: crm_campaign_sends[];
};

export type CampaignToTargetLists = {
  campaign_id: string;
  target_list_id: string;
  campaign: crm_campaigns;
  target_list: crm_TargetLists;
};

export type crm_campaign_sends = {
  id: string;
  campaign_id: string;
  step_id: string;
  target_id: string;
  email: string;
  status: string;
  resend_message_id?: string;
  unsubscribe_token: string;
  opened_at?: Date;
  clicked_at?: Date;
  unsubscribed_at?: Date;
  error_message?: string;
  sent_at?: Date;
  campaign: crm_campaigns;
  step: crm_campaign_steps;
  target: crm_Targets;
};

export type crm_Opportunities_Sales_Stages = {
  id: string;
  v: number;
  name: string;
  probability?: number;
  order?: number;
  assigned_opportunities_sales_stage: crm_Opportunities[];
};

export type crm_Opportunities_Type = {
  id: string;
  v: number;
  name: string;
  order?: number;
  assigned_opportunities: crm_Opportunities[];
};

export type crm_Contact_Types = {
  id: string;
  v: number;
  name: string;
  contacts: crm_Contacts[];
};

export type crm_Lead_Sources = {
  id: string;
  v: number;
  name: string;
  leads: crm_Leads[];
};

export type crm_Lead_Statuses = {
  id: string;
  v: number;
  name: string;
  leads: crm_Leads[];
};

export type crm_Lead_Types = {
  id: string;
  v: number;
  name: string;
  leads: crm_Leads[];
};

export type crm_Contacts = {
  id: string;
  v: number;
  account?: string;
  assigned_to?: string;
  birthday?: string;
  createdBy?: string;
  created_on?: Date;
  cratedAt?: Date;
  last_activity?: Date;
  updatedAt?: Date;
  updatedBy?: string;
  last_activity_by?: string;
  description?: string;
  email?: string;
  personal_email?: string;
  first_name?: string;
  last_name: string;
  office_phone?: string;
  mobile_phone?: string;
  website?: string;
  position?: string;
  status: boolean;
  social_twitter?: string;
  social_facebook?: string;
  social_linkedin?: string;
  social_skype?: string;
  social_instagram?: string;
  social_youtube?: string;
  social_tiktok?: string;
  contact_type_id?: string;
  contact_type?: crm_Contact_Types;
  tags: String[];
  notes: String[];
  assigned_to_user?: Users;
  crate_by_user?: Users;
  accountsIDs?: string;
  assigned_accounts?: crm_Accounts;
  opportunities: ContactsToOpportunities[];
  documents: DocumentsToContacts[];
  embedding?: crm_Embeddings_Contacts;
  emails: EmailsToContacts[];
  enrichments: crm_Contact_Enrichment[];
  converted_targets: crm_Targets[];
  target_contact_links: crm_Target_Contact[];
  deletedAt?: Date;
  deletedBy?: string;
};

export type crm_Contracts = {
  id: string;
  v: number;
  title: string;
  value: any;
  startDate?: Date;
  endDate?: Date;
  renewalReminderDate?: Date;
  customerSignedDate?: Date;
  companySignedDate?: Date;
  description?: string;
  account?: string;
  assigned_to?: string;
  createdAt?: Date;
  createdBy?: string;
  updatedAt?: Date;
  updatedBy?: string;
  status: crm_Contracts_Status;
  type?: string;
  currency?: string;
  snapshot_rate?: any;
  deletedAt?: Date;
  deletedBy?: string;
  assigned_account?: crm_Accounts;
  assigned_to_user?: Users;
  assigned_currency?: Currency;
  lineItems: crm_ContractLineItems[];
};

export type Currency = {
  code: string;
  name: string;
  symbol: string;
  isEnabled: boolean;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
  ratesFrom: ExchangeRate[];
  ratesTo: ExchangeRate[];
  opportunities: crm_Opportunities[];
  contracts: crm_Contracts[];
  products: crm_Products[];
  accountProducts: crm_AccountProducts[];
  invoices: Invoices[];
  purchaseOrders: PurchaseOrders[];
};

export type ExchangeRate = {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  rate: any;
  source: ExchangeRateSource;
  effectiveDate: Date;
  createdAt: Date;
  updatedAt: Date;
  from: Currency;
  to: Currency;
};

export type crm_SystemSettings = {
  key: string;
  value: string;
  updatedAt: Date;
};

export type crm_Activities = {
  id: string;
  type: crm_Activity_Type;
  title: string;
  description?: string;
  date: Date;
  duration?: number;
  outcome?: string;
  status: crm_Activity_Status;
  metadata?: any;
  createdBy?: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  deletedBy?: string;
  created_by_user?: Users;
  updated_by_user?: Users;
  links: crm_ActivityLinks[];
};

export type crm_ActivityLinks = {
  id: string;
  activityId: string;
  entityType: string;
  entityId: string;
  activity: crm_Activities;
};

export type Boards = {
  id: string;
  v: number;
  description: string;
  favourite?: boolean;
  favouritePosition?: bigint;
  icon?: string;
  position?: bigint;
  title: string;
  user: string;
  visibility?: string;
  sharedWith: String[];
  createdAt?: Date;
  createdBy?: string;
  updatedAt?: Date;
  updatedBy?: string;
  deletedAt?: Date;
  deletedBy?: string;
  assigned_user?: Users;
  sections: Sections[];
  watchers: BoardWatchers[];
};

export type Employees = {
  id: string;
  v: number;
  avatar: string;
  email?: string;
  name: string;
  salary: bigint;
  status: string;
};

export type ImageUpload = {
  id: string;
};

export type Documents = {
  id: string;
  v?: number;
  date_created?: Date;
  createdAt?: Date;
  last_updated?: Date;
  updatedAt?: Date;
  document_name: string;
  created_by_user?: string;
  createdBy?: string;
  description?: string;
  document_type?: string;
  favourite?: boolean;
  document_file_mimeType: string;
  document_file_url: string;
  status?: string;
  visibility?: string;
  tags?: any;
  key?: string;
  size?: number;
  assigned_user?: string;
  connected_documents: String[];
  content_text?: string;
  summary?: string;
  content_hash?: string;
  thumbnail_url?: string;
  processing_status: DocumentProcessingStatus;
  processing_error?: string;
  version: number;
  parent_document_id?: string;
  deletedAt?: Date;
  deletedBy?: string;
  created_by?: Users;
  assigned_to_user?: Users;
  documents_type?: Documents_Types;
  document_system_type?: DocumentSystemType;
  opportunities: DocumentsToOpportunities[];
  contacts: DocumentsToContacts[];
  tasks: DocumentsToTasks[];
  crm_accounts_tasks: DocumentsToCrmAccountsTasks[];
  leads: DocumentsToLeads[];
  accounts: DocumentsToAccounts[];
  parent_document?: Documents;
  child_versions: Documents[];
  chunks: crm_Document_Chunks[];
  embedding_record?: crm_Embeddings_Documents;
};

export type Documents_Types = {
  id: string;
  v: number;
  name: string;
  assigned_documents: Documents[];
};

export type Sections = {
  id: string;
  v: number;
  board: string;
  title: string;
  position?: bigint;
  tasks: Tasks[];
  board_relation?: Boards;
};

export type crm_Industry_Type = {
  id: string;
  v: number;
  name: string;
  accounts: crm_Accounts[];
};

export type Tasks = {
  id: string;
  v: number;
  content?: string;
  createdAt?: Date;
  createdBy?: string;
  updatedAt?: Date;
  updatedBy?: string;
  dueDateAt?: Date;
  lastEditedAt?: Date;
  position: bigint;
  priority: string;
  section?: string;
  tags?: any;
  title: string;
  likes?: bigint;
  user?: string;
  taskStatus?: taskStatus;
  comments: tasksComments[];
  assigned_user?: Users;
  assigned_section?: Sections;
  documents: DocumentsToTasks[];
};

export type crm_Accounts_Tasks = {
  id: string;
  v: number;
  content?: string;
  createdAt?: Date;
  createdBy?: string;
  updatedAt?: Date;
  updatedBy?: string;
  dueDateAt?: Date;
  priority: string;
  tags?: any;
  title: string;
  likes?: bigint;
  user?: string;
  taskStatus?: taskStatus;
  comments: tasksComments[];
  assigned_user?: Users;
  account?: string;
  crm_accounts?: crm_Accounts;
  documents: DocumentsToCrmAccountsTasks[];
};

export type tasksComments = {
  id: string;
  v: number;
  comment: string;
  createdAt: Date;
  task?: string;
  user: string;
  assigned_crm_account_task?: string;
  assigned_crm_account_task_task?: crm_Accounts_Tasks;
  assigned_task?: Tasks;
  assigned_user?: Users;
};

export type TodoList = {
  id: string;
  createdAt: string;
  description: string;
  title: string;
  url: string;
  user: string;
};

export type Users = {
  id: string;
  v: number;
  account_name?: string;
  avatar?: string;
  email: string;
  emailVerified: boolean;
  image?: string;
  role: AppRole;
  created_on: Date;
  updated_at?: Date;
  lastLoginAt?: Date;
  name?: string;
  password?: string;
  username?: string;
  userStatus: ActiveStatus;
  userLanguage: Language;
  banned: boolean;
  banReason?: string;
  banExpires?: Date;
  isSuperAdmin: boolean;
  tenantId?: string;
  accessibleTabs: String[];
  tasksComment: tasksComments[];
  created_by_documents: Documents[];
  assigned_documents: Documents[];
  tasks: Tasks[];
  crm_accounts_tasks: crm_Accounts_Tasks[];
  accounts: crm_Accounts[];
  leads: crm_Leads[];
  created_by_user: crm_Opportunities[];
  assigned_opportunity: crm_Opportunities[];
  assigned_contacts: crm_Contacts[];
  crated_contacts: crm_Contacts[];
  apiKeys: ApiKeys[];
  assigned_contracts: crm_Contracts[];
  boards: Boards[];
  watching_boards: BoardWatchers[];
  watching_accounts: AccountWatchers[];
  created_targets: crm_Targets[];
  created_target_lists: crm_TargetLists[];
  apiTokens: ApiToken[];
  emailAccounts: EmailAccount[];
  emails: Email[];
  enrichments_triggered: crm_Contact_Enrichment[];
  target_enrichments_triggered: crm_Target_Enrichment[];
  created_campaigns: crm_campaigns[];
  created_campaign_templates: crm_campaign_templates[];
  auditLogs: crm_AuditLog[];
  created_products: crm_Products[];
  activities_created: crm_Activities[];
  activities_updated: crm_Activities[];
  report_configs: crm_Report_Config[];
  report_schedules: crm_Report_Schedule[];
  sessions: Session[];
  authAccounts: Account[];
  createdInvoices: Invoices[];
  invoicePayments: Invoice_Payments[];
  invoiceAttachments: Invoice_Attachments[];
  invoiceActivity: Invoice_Activity[];
  createdPurchaseOrders: PurchaseOrders[];
  updatedPurchaseOrders: PurchaseOrders[];
  requestedPurchaseOrders: PurchaseOrders[];
  approvedPurchaseOrders: PurchaseOrders[];
  createdWarehouses: InventoryWarehouse[];
  updatedWarehouses: InventoryWarehouse[];
  inventoryMovements: InventoryMovement[];
  feedbackTickets: FeedbackTicket[];
  feedbackResponses: FeedbackTicket[];
};

export type crm_AuditLog = {
  id: string;
  entityType: string;
  entityId: string;
  action: crm_AuditLog_Action;
  changes?: any;
  userId?: string;
  createdAt: Date;
  user?: Users;
};

export type crm_Report_Config = {
  id: string;
  name: string;
  category: string;
  filters: any;
  isShared: boolean;
  createdBy: string;
  user: Users;
  schedules: crm_Report_Schedule[];
  createdAt: Date;
  updatedAt: Date;
};

export type crm_Report_Schedule = {
  id: string;
  reportConfigId: string;
  cronExpression: string;
  recipients: any;
  format: string;
  isActive: boolean;
  lastSentAt?: Date;
  createdBy: string;
  reportConfig: crm_Report_Config;
  user: Users;
  createdAt: Date;
  updatedAt: Date;
};

export type ApiKeys = {
  id: string;
  scope: ApiKeyScope;
  userId?: string;
  provider: ApiKeyProvider;
  encryptedKey: string;
  createdAt: Date;
  updatedAt: Date;
  user?: Users;
};

export type systemServices = {
  id: string;
  v: number;
  name: string;
  serviceUrl?: string;
  serviceId?: string;
  serviceKey?: string;
  servicePassword?: string;
  servicePort?: string;
  description?: string;
};

export type DocumentsToOpportunities = {
  document_id: string;
  opportunity_id: string;
  document: Documents;
  opportunity: crm_Opportunities;
};

export type DocumentsToContacts = {
  document_id: string;
  contact_id: string;
  document: Documents;
  contact: crm_Contacts;
};

export type DocumentsToTasks = {
  document_id: string;
  task_id: string;
  document: Documents;
  task: Tasks;
};

export type DocumentsToCrmAccountsTasks = {
  document_id: string;
  crm_accounts_task_id: string;
  document: Documents;
  crm_accounts_task: crm_Accounts_Tasks;
};

export type DocumentsToLeads = {
  document_id: string;
  lead_id: string;
  document: Documents;
  lead: crm_Leads;
};

export type DocumentsToAccounts = {
  document_id: string;
  account_id: string;
  document: Documents;
  account: crm_Accounts;
};

export type AccountWatchers = {
  account_id: string;
  user_id: string;
  account: crm_Accounts;
  user: Users;
};

export type BoardWatchers = {
  board_id: string;
  user_id: string;
  board: Boards;
  user: Users;
};

export type ContactsToOpportunities = {
  contact_id: string;
  opportunity_id: string;
  contact: crm_Contacts;
  opportunity: crm_Opportunities;
};

export type crm_Targets = {
  id: string;
  first_name?: string;
  last_name: string;
  email?: string;
  mobile_phone?: string;
  office_phone?: string;
  company?: string;
  company_website?: string;
  personal_website?: string;
  position?: string;
  social_x?: string;
  social_linkedin?: string;
  social_instagram?: string;
  social_facebook?: string;
  status: boolean;
  tags: String[];
  notes: String[];
  created_by?: string;
  created_on?: Date;
  updatedAt?: Date;
  updatedBy?: string;
  personal_email?: string;
  company_email?: string;
  company_phone?: string;
  city?: string;
  country?: string;
  industry?: string;
  employees?: string;
  description?: string;
  converted_at?: Date;
  converted_account_id?: string;
  converted_contact_id?: string;
  deletedAt?: Date;
  deletedBy?: string;
  crate_by_user?: Users;
  target_lists: TargetsToTargetLists[];
  enrichments: crm_Target_Enrichment[];
  target_contacts: crm_Target_Contact[];
  campaign_sends: crm_campaign_sends[];
  converted_account?: crm_Accounts;
  converted_contact?: crm_Contacts;
};

export type crm_TargetLists = {
  id: string;
  name: string;
  description?: string;
  status: boolean;
  created_by?: string;
  created_on?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  deletedBy?: string;
  crate_by_user?: Users;
  targets: TargetsToTargetLists[];
  campaign_lists: CampaignToTargetLists[];
};

export type TargetsToTargetLists = {
  target_id: string;
  target_list_id: string;
  target: crm_Targets;
  target_list: crm_TargetLists;
};

export type crm_Embeddings_Accounts = {
  id: string;
  account_id: string;
  embedding: any;
  content_hash: string;
  embedded_at: Date;
  account: crm_Accounts;
};

export type crm_Embeddings_Contacts = {
  id: string;
  contact_id: string;
  embedding: any;
  content_hash: string;
  embedded_at: Date;
  contact: crm_Contacts;
};

export type crm_Embeddings_Leads = {
  id: string;
  lead_id: string;
  embedding: any;
  content_hash: string;
  embedded_at: Date;
  lead: crm_Leads;
};

export type crm_Embeddings_Opportunities = {
  id: string;
  opportunity_id: string;
  embedding: any;
  content_hash: string;
  embedded_at: Date;
  opportunity: crm_Opportunities;
};

export type crm_Embeddings_Documents = {
  id: string;
  document_id: string;
  embedding: any;
  content_hash: string;
  embedded_at: Date;
  document: Documents;
};

export type crm_Document_Chunks = {
  id: string;
  document_id: string;
  chunk_index: number;
  chunk_text: string;
  embedding: any;
  embedded_at: Date;
  document: Documents;
};

export type ApiToken = {
  id: string;
  name: string;
  tokenHash: string;
  tokenPrefix: string;
  userId: string;
  user: Users;
  expiresAt?: Date;
  revokedAt?: Date;
  lastUsedAt?: Date;
  createdAt: Date;
};

export type EmailAccount = {
  id: string;
  userId: string;
  label: string;
  imapHost: string;
  imapPort: number;
  imapSsl: boolean;
  smtpHost: string;
  smtpPort: number;
  smtpSsl: boolean;
  username: string;
  passwordEncrypted: string;
  isActive: boolean;
  sentFolderName: string;
  lastSyncedAt?: Date;
  inboxLastUid?: number;
  sentLastUid?: number;
  createdAt: Date;
  updatedAt: Date;
  user: Users;
  emails: Email[];
};

export type Email = {
  id: string;
  emailAccountId: string;
  userId: string;
  rfcMessageId: string;
  imapUid?: number;
  folder: EmailFolder;
  subject?: string;
  fromName?: string;
  fromEmail?: string;
  toRecipients: any;
  ccRecipients: any;
  bccRecipients: any;
  bodyText?: string;
  bodyHtml?: string;
  sentAt?: Date;
  isRead: boolean;
  isDeleted: boolean;
  updatedAt: Date;
  createdAt: Date;
  account: EmailAccount;
  user: Users;
  embedding?: EmailEmbedding;
  contacts: EmailsToContacts[];
  accounts: EmailsToAccounts[];
};

export type EmailEmbedding = {
  id: string;
  emailId: string;
  embedding: any;
  contentHash: string;
  embeddedAt: Date;
  email: Email;
};

export type EmailsToContacts = {
  emailId: string;
  contactId: string;
  email: Email;
  contact: crm_Contacts;
};

export type EmailsToAccounts = {
  emailId: string;
  accountId: string;
  email: Email;
  account: crm_Accounts;
};

export type Session = {
  id: string;
  expiresAt: Date;
  token: string;
  createdAt: Date;
  updatedAt: Date;
  ipAddress?: string;
  userAgent?: string;
  userId: string;
  user: Users;
};

export type Account = {
  id: string;
  accountId: string;
  providerId: string;
  userId: string;
  user: Users;
  accessToken?: string;
  refreshToken?: string;
  idToken?: string;
  accessTokenExpiresAt?: Date;
  refreshTokenExpiresAt?: Date;
  scope?: string;
  password?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Verification = {
  id: string;
  identifier: string;
  value: string;
  expiresAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
};

export type crm_ProductCategories = {
  id: string;
  name: string;
  description?: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy?: string;
  products: crm_Products[];
};

export type crm_Products = {
  id: string;
  name: string;
  description?: string;
  sku?: string;
  type: crm_Product_Type;
  status: crm_Product_Status;
  unit_price: any;
  unit_cost?: any;
  currency: string;
  tax_rate?: any;
  unit?: string;
  is_recurring: boolean;
  billing_period?: crm_Billing_Period;
  categoryId?: string;
  v: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy?: string;
  deletedAt?: Date;
  deletedBy?: string;
  category?: crm_ProductCategories;
  assigned_currency?: Currency;
  created_by_user?: Users;
  accountProducts: crm_AccountProducts[];
  opportunityLineItems: crm_OpportunityLineItems[];
  contractLineItems: crm_ContractLineItems[];
  invoiceLineItems: Invoice_LineItems[];
  purchaseOrderLineItems: PurchaseOrderLineItems[];
  stock: InventoryStock[];
  movements: InventoryMovement[];
  thresholds: ReorderThreshold[];
};

export type crm_AccountProducts = {
  id: string;
  accountId: string;
  productId: string;
  quantity: number;
  custom_price?: any;
  currency: string;
  snapshot_rate?: any;
  status: crm_AccountProduct_Status;
  start_date: Date;
  end_date?: Date;
  renewal_date?: Date;
  notes?: string;
  v: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy?: string;
  account: crm_Accounts;
  product: crm_Products;
  assigned_currency?: Currency;
};

export type crm_OpportunityLineItems = {
  id: string;
  opportunityId: string;
  productId?: string;
  name: string;
  sku?: string;
  description?: string;
  quantity: number;
  unit_price: any;
  discount_type: crm_Discount_Type;
  discount_value: any;
  line_total: any;
  currency: string;
  sort_order: number;
  v: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy?: string;
  opportunity: crm_Opportunities;
  product?: crm_Products;
};

export type crm_ContractLineItems = {
  id: string;
  contractId: string;
  productId?: string;
  name: string;
  sku?: string;
  description?: string;
  quantity: number;
  unit_price: any;
  discount_type: crm_Discount_Type;
  discount_value: any;
  line_total: any;
  currency: string;
  sort_order: number;
  v: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy?: string;
  contract: crm_Contracts;
  product?: crm_Products;
};

export type Invoices = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  createdByUser: Users;
  type: Invoice_Type;
  status: Invoice_Status;
  number?: string;
  numberOverridden: boolean;
  seriesId?: string;
  series?: Invoice_Series;
  accountId: string;
  account: crm_Accounts;
  billingSnapshot?: any;
  issueDate?: Date;
  taxableSupplyDate?: Date;
  dueDate?: Date;
  currency: string;
  currencyRef: Currency;
  baseCurrency?: string;
  fxRateToBase?: any;
  subtotal: any;
  discountTotal: any;
  vatTotal: any;
  grandTotal: any;
  paidTotal: any;
  balanceDue: any;
  bankName?: string;
  bankAccount?: string;
  iban?: string;
  swift?: string;
  variableSymbol?: string;
  publicNotes?: string;
  internalNotes?: string;
  originalInvoiceId?: string;
  originalInvoice?: Invoices;
  creditNotes: Invoices[];
  pdfStorageKey?: string;
  pdfGeneratedAt?: Date;
  searchVector?: any;
  lineItems: Invoice_LineItems[];
  payments: Invoice_Payments[];
  activity: Invoice_Activity[];
  attachments: Invoice_Attachments[];
};

export type Invoice_LineItems = {
  id: string;
  invoiceId: string;
  invoice: Invoices;
  position: number;
  productId?: string;
  product?: crm_Products;
  description: string;
  quantity: any;
  unitPrice: any;
  discountPercent: any;
  taxRateId?: string;
  taxRate?: Invoice_TaxRates;
  taxRateSnapshot?: any;
  lineSubtotal: any;
  lineVat: any;
  lineTotal: any;
};

export type Invoice_Payments = {
  id: string;
  invoiceId: string;
  invoice: Invoices;
  paidAt: Date;
  amount: any;
  method?: string;
  reference?: string;
  note?: string;
  createdBy: string;
  createdByUser: Users;
  createdAt: Date;
};

export type Invoice_Attachments = {
  id: string;
  invoiceId: string;
  invoice: Invoices;
  storageKey: string;
  filename: string;
  mimeType: string;
  size: number;
  uploadedBy: string;
  uploadedByUser: Users;
  uploadedAt: Date;
  isPrimaryPdf: boolean;
};

export type Invoice_Activity = {
  id: string;
  invoiceId: string;
  invoice: Invoices;
  actorId: string;
  actor: Users;
  action: string;
  meta?: any;
  createdAt: Date;
};

export type Invoice_TaxRates = {
  id: string;
  name: string;
  rate: any;
  isDefault: boolean;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  lineItems: Invoice_LineItems[];
  defaultForSettings: Invoice_Settings[];
};

export type Invoice_Series = {
  id: string;
  name: string;
  prefixTemplate: string;
  resetPolicy: string;
  currentYear?: number;
  counter: number;
  isDefault: boolean;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  invoices: Invoices[];
  defaultForSettings: Invoice_Settings[];
};

export type Invoice_Settings = {
  id: string;
  baseCurrency: string;
  defaultSeriesId?: string;
  defaultSeries?: Invoice_Series;
  defaultTaxRateId?: string;
  defaultTaxRate?: Invoice_TaxRates;
  defaultDueDays: number;
  bankName?: string;
  bankAccount?: string;
  iban?: string;
  swift?: string;
  footerText?: string;
  companyName?: string;
  companyAddress?: string;
  companyCity?: string;
  companyZip?: string;
  companyCountry?: string;
  companyVatId?: string;
  companyTaxId?: string;
  companyRegNo?: string;
  companyEmail?: string;
  companyPhone?: string;
  companyWebsite?: string;
  updatedAt: Date;
};

export type PurchaseOrders = {
  id: string;
  orderNumber: string;
  vendorId: string;
  vendor: crm_Accounts;
  status: PurchaseOrderStatus;
  orderDate: Date;
  expectedDeliveryDate?: Date;
  deliveredDate?: Date;
  subtotal: any;
  taxTotal: any;
  grandTotal: any;
  currency: string;
  currencyRef?: Currency;
  notes?: string;
  termsAndConditions?: string;
  shippingAddress?: any;
  billingAddress?: any;
  requestedBy: string;
  approvedBy?: string;
  approvedAt?: Date;
  rejectionReason?: string;
  createdBy: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  deletedBy?: string;
  lineItems: PurchaseOrderLineItems[];
  createdByUser: Users;
  updatedByUser?: Users;
  requestedByUser: Users;
  approvedByUser?: Users;
};

export type PurchaseOrderLineItems = {
  id: string;
  purchaseOrderId: string;
  purchaseOrder: PurchaseOrders;
  productId?: string;
  product?: crm_Products;
  description: string;
  quantity: any;
  unitPrice: any;
  taxRate?: any;
  lineTotal: any;
  receivedQuantity: any;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

export type InventoryWarehouse = {
  id: string;
  name: string;
  code: string;
  description?: string;
  address?: string;
  city?: string;
  country?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy?: string;
  stock: InventoryStock[];
  thresholds: ReorderThreshold[];
  movements: InventoryMovement[];
  createdByUser?: Users;
  updatedByUser?: Users;
};

export type InventoryStock = {
  id: string;
  productId: string;
  warehouseId: string;
  quantity: any;
  createdAt: Date;
  updatedAt: Date;
  product: crm_Products;
  warehouse: InventoryWarehouse;
};

export type InventoryMovement = {
  id: string;
  productId: string;
  warehouseId: string;
  type: InventoryMovementType;
  quantity: any;
  reference?: string;
  note?: string;
  createdAt: Date;
  createdBy: string;
  product: crm_Products;
  warehouse: InventoryWarehouse;
  createdByUser?: Users;
};

export type ReorderThreshold = {
  id: string;
  productId: string;
  warehouseId: string;
  minQuantity: any;
  maxQuantity?: any;
  reorderPoint: any;
  reorderQuantity: any;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy?: string;
  product: crm_Products;
  warehouse: InventoryWarehouse;
};

export type FeedbackTicket = {
  id: string;
  ticketRef: string;
  userId: string;
  subject?: string;
  message: string;
  status: FeedbackStatus;
  priority: FeedbackPriority;
  category?: string;
  response?: string;
  respondedBy?: string;
  respondedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  user: Users;
  responder?: Users;
};

export type crm_Industry_Templates = {
  id: string;
  name: string;
  slug: string;
  industry: string;
  description?: string;
  icon?: string;
  features: String[];
  crmCustomFields?: any;
  whatsappTemplates?: any;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type crm_Whatsapp_Instances = {
  id: string;
  tenantId: string;
  instanceName: string;
  phoneNumber?: string;
  status: string;
  qrCode?: string;
  credentials?: any;
  connectionConfig?: any;
  createdAt: Date;
  updatedAt: Date;
};

export type crm_Tenant_Subscriptions = {
  id: string;
  tenantId: string;
  planName: string;
  status: string;
  billingCycle: string;
  startDate: Date;
  endDate?: Date;
  features?: any;
  usage?: any;
  paymentMethod?: string;
  lastPaymentDate?: Date;
  nextBillingDate?: Date;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  createdAt: Date;
  updatedAt: Date;
};

