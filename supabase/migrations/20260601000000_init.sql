CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;
-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "crm_Enrichment_Status" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "crm_AuditLog_Action" AS ENUM ('created', 'updated', 'deleted', 'restored', 'relation_added', 'relation_removed');

-- CreateEnum
CREATE TYPE "crm_Opportunity_Status" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING', 'CLOSED');

-- CreateEnum
CREATE TYPE "crm_Product_Type" AS ENUM ('PRODUCT', 'SERVICE');

-- CreateEnum
CREATE TYPE "crm_Product_Status" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "crm_Billing_Period" AS ENUM ('MONTHLY', 'QUARTERLY', 'ANNUALLY', 'ONE_TIME');

-- CreateEnum
CREATE TYPE "crm_AccountProduct_Status" AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELLED', 'PENDING');

-- CreateEnum
CREATE TYPE "crm_Discount_Type" AS ENUM ('PERCENTAGE', 'FIXED');

-- CreateEnum
CREATE TYPE "crm_Contracts_Status" AS ENUM ('NOTSTARTED', 'INPROGRESS', 'SIGNED');

-- CreateEnum
CREATE TYPE "ExchangeRateSource" AS ENUM ('MANUAL', 'ECB');

-- CreateEnum
CREATE TYPE "crm_Activity_Type" AS ENUM ('call', 'meeting', 'note', 'email');

-- CreateEnum
CREATE TYPE "crm_Activity_Status" AS ENUM ('scheduled', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "DocumentSystemType" AS ENUM ('RECEIPT', 'CONTRACT', 'OFFER', 'OTHER');

-- CreateEnum
CREATE TYPE "DocumentProcessingStatus" AS ENUM ('PENDING', 'PROCESSING', 'READY', 'FAILED');

-- CreateEnum
CREATE TYPE "taskStatus" AS ENUM ('ACTIVE', 'PENDING', 'COMPLETE');

-- CreateEnum
CREATE TYPE "ActiveStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING');

-- CreateEnum
CREATE TYPE "AppRole" AS ENUM ('superadmin', 'user', 'manager', 'admin');

-- CreateEnum
CREATE TYPE "Language" AS ENUM ('cz', 'en', 'de', 'uk', 'ar');

-- CreateEnum
CREATE TYPE "ApiKeyScope" AS ENUM ('SYSTEM', 'USER');

-- CreateEnum
CREATE TYPE "ApiKeyProvider" AS ENUM ('OPENAI', 'FIRECRAWL', 'ANTHROPIC', 'GROQ');

-- CreateEnum
CREATE TYPE "EmailFolder" AS ENUM ('INBOX', 'SENT');

-- CreateEnum
CREATE TYPE "Invoice_Status" AS ENUM ('DRAFT', 'ISSUED', 'SENT', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED', 'DISPUTED', 'REFUNDED', 'WRITTEN_OFF');

-- CreateEnum
CREATE TYPE "Invoice_Type" AS ENUM ('INVOICE', 'CREDIT_NOTE', 'PROFORMA');

-- CreateEnum
CREATE TYPE "PurchaseOrderStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'ORDERED', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "InventoryMovementType" AS ENUM ('RECEIVED', 'SHIPPED', 'ADJUSTMENT', 'TRANSFER_IN', 'TRANSFER_OUT', 'RETURN', 'WRITE_OFF');

-- CreateEnum
CREATE TYPE "FeedbackStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "FeedbackPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateTable
CREATE TABLE "crm_Accounts" (
    "id" UUID NOT NULL,
    "__v" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" UUID,
    "updatedAt" TIMESTAMP(3),
    "updatedBy" UUID,
    "annual_revenue" TEXT,
    "assigned_to" UUID,
    "billing_city" TEXT,
    "billing_country" TEXT,
    "billing_postal_code" TEXT,
    "billing_state" TEXT,
    "billing_street" TEXT,
    "company_id" TEXT,
    "description" TEXT,
    "email" TEXT,
    "employees" TEXT,
    "fax" TEXT,
    "industry" UUID,
    "member_of" TEXT,
    "name" TEXT NOT NULL,
    "office_phone" TEXT,
    "shipping_city" TEXT,
    "shipping_country" TEXT,
    "shipping_postal_code" TEXT,
    "shipping_state" TEXT,
    "shipping_street" TEXT,
    "status" TEXT DEFAULT 'Inactive',
    "type" TEXT DEFAULT 'Customer',
    "vat" TEXT,
    "website" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" UUID,

    CONSTRAINT "crm_Accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_Leads" (
    "id" UUID NOT NULL,
    "__v" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "createdBy" UUID,
    "updatedAt" TIMESTAMP(3),
    "updatedBy" UUID,
    "firstName" TEXT,
    "lastName" TEXT NOT NULL,
    "company" TEXT,
    "jobTitle" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "description" TEXT,
    "lead_source_id" UUID,
    "lead_status_id" UUID,
    "lead_type_id" UUID,
    "refered_by" TEXT,
    "campaign" TEXT,
    "assigned_to" UUID,
    "accountsIDs" UUID,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" UUID,

    CONSTRAINT "crm_Leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_Contact_Enrichment" (
    "id" UUID NOT NULL,
    "contactId" UUID NOT NULL,
    "status" "crm_Enrichment_Status" NOT NULL DEFAULT 'PENDING',
    "fields" TEXT[],
    "result" JSONB,
    "error" TEXT,
    "triggeredBy" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crm_Contact_Enrichment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_Target_Enrichment" (
    "id" UUID NOT NULL,
    "targetId" UUID NOT NULL,
    "status" "crm_Enrichment_Status" NOT NULL DEFAULT 'PENDING',
    "fields" TEXT[],
    "result" JSONB,
    "error" TEXT,
    "triggeredBy" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crm_Target_Enrichment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_Target_Contact" (
    "id" UUID NOT NULL,
    "targetId" UUID NOT NULL,
    "contactId" UUID,
    "name" TEXT,
    "email" TEXT,
    "title" TEXT,
    "phone" TEXT,
    "linkedinUrl" TEXT,
    "source" TEXT NOT NULL DEFAULT 'manual',
    "enrichStatus" "crm_Enrichment_Status" NOT NULL DEFAULT 'PENDING',
    "enrichedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crm_Target_Contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_Opportunities" (
    "id" UUID NOT NULL,
    "__v" INTEGER NOT NULL DEFAULT 0,
    "account" UUID,
    "assigned_to" UUID,
    "budget" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "campaign" UUID,
    "close_date" TIMESTAMP(3),
    "contact" UUID,
    "createdBy" UUID,
    "created_on" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_activity" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "updatedBy" UUID,
    "last_activity_by" UUID,
    "currency" VARCHAR(3),
    "snapshot_rate" DECIMAL(18,8),
    "description" TEXT,
    "expected_revenue" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "name" TEXT,
    "next_step" TEXT,
    "sales_stage" UUID,
    "type" UUID,
    "status" "crm_Opportunity_Status" DEFAULT 'ACTIVE',
    "deletedAt" TIMESTAMP(3),
    "deletedBy" UUID,

    CONSTRAINT "crm_Opportunities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_campaigns" (
    "id" UUID NOT NULL,
    "__v" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT,
    "channel" TEXT DEFAULT 'email',
    "template_id" UUID,
    "from_name" TEXT,
    "reply_to" TEXT,
    "scheduled_at" TIMESTAMP(3),
    "sent_at" TIMESTAMP(3),
    "created_by" UUID,
    "created_on" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "deletedBy" UUID,

    CONSTRAINT "crm_campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_campaign_templates" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "subject_default" TEXT,
    "content_html" TEXT NOT NULL,
    "content_json" JSONB NOT NULL,
    "created_by" UUID,
    "created_on" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "deletedBy" UUID,

    CONSTRAINT "crm_campaign_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_campaign_steps" (
    "id" UUID NOT NULL,
    "campaign_id" UUID NOT NULL,
    "order" INTEGER NOT NULL,
    "template_id" UUID NOT NULL,
    "subject" TEXT NOT NULL,
    "delay_days" INTEGER NOT NULL DEFAULT 0,
    "send_to" TEXT NOT NULL DEFAULT 'all',
    "scheduled_at" TIMESTAMP(3),
    "sent_at" TIMESTAMP(3),

    CONSTRAINT "crm_campaign_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignToTargetLists" (
    "campaign_id" UUID NOT NULL,
    "target_list_id" UUID NOT NULL,

    CONSTRAINT "CampaignToTargetLists_pkey" PRIMARY KEY ("campaign_id","target_list_id")
);

-- CreateTable
CREATE TABLE "crm_campaign_sends" (
    "id" UUID NOT NULL,
    "campaign_id" UUID NOT NULL,
    "step_id" UUID NOT NULL,
    "target_id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'queued',
    "resend_message_id" TEXT,
    "unsubscribe_token" TEXT NOT NULL,
    "opened_at" TIMESTAMP(3),
    "clicked_at" TIMESTAMP(3),
    "unsubscribed_at" TIMESTAMP(3),
    "error_message" TEXT,
    "sent_at" TIMESTAMP(3),

    CONSTRAINT "crm_campaign_sends_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_Opportunities_Sales_Stages" (
    "id" UUID NOT NULL,
    "__v" INTEGER NOT NULL DEFAULT 0,
    "name" TEXT NOT NULL,
    "probability" INTEGER,
    "order" INTEGER,

    CONSTRAINT "crm_Opportunities_Sales_Stages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_Opportunities_Type" (
    "id" UUID NOT NULL,
    "__v" INTEGER NOT NULL DEFAULT 0,
    "name" TEXT NOT NULL,
    "order" INTEGER,

    CONSTRAINT "crm_Opportunities_Type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_Contact_Types" (
    "id" UUID NOT NULL,
    "__v" INTEGER NOT NULL DEFAULT 0,
    "name" TEXT NOT NULL,

    CONSTRAINT "crm_Contact_Types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_Lead_Sources" (
    "id" UUID NOT NULL,
    "__v" INTEGER NOT NULL DEFAULT 0,
    "name" TEXT NOT NULL,

    CONSTRAINT "crm_Lead_Sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_Lead_Statuses" (
    "id" UUID NOT NULL,
    "__v" INTEGER NOT NULL DEFAULT 0,
    "name" TEXT NOT NULL,

    CONSTRAINT "crm_Lead_Statuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_Lead_Types" (
    "id" UUID NOT NULL,
    "__v" INTEGER NOT NULL DEFAULT 0,
    "name" TEXT NOT NULL,

    CONSTRAINT "crm_Lead_Types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_Contacts" (
    "id" UUID NOT NULL,
    "__v" INTEGER NOT NULL DEFAULT 0,
    "account" UUID,
    "assigned_to" UUID,
    "birthday" TEXT,
    "createdBy" UUID,
    "created_on" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "cratedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "last_activity" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "updatedBy" UUID,
    "last_activity_by" UUID,
    "description" TEXT,
    "email" TEXT,
    "personal_email" TEXT,
    "first_name" TEXT,
    "last_name" TEXT NOT NULL,
    "office_phone" TEXT,
    "mobile_phone" TEXT,
    "website" TEXT,
    "position" TEXT,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "social_twitter" TEXT,
    "social_facebook" TEXT,
    "social_linkedin" TEXT,
    "social_skype" TEXT,
    "social_instagram" TEXT,
    "social_youtube" TEXT,
    "social_tiktok" TEXT,
    "contact_type_id" UUID,
    "tags" TEXT[],
    "notes" TEXT[],
    "accountsIDs" UUID,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" UUID,

    CONSTRAINT "crm_Contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_Contracts" (
    "id" UUID NOT NULL,
    "__v" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "value" DECIMAL(18,2) NOT NULL,
    "startDate" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "renewalReminderDate" TIMESTAMP(3),
    "customerSignedDate" TIMESTAMP(3),
    "companySignedDate" TIMESTAMP(3),
    "description" TEXT,
    "account" UUID,
    "assigned_to" UUID,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "createdBy" UUID,
    "updatedAt" TIMESTAMP(3),
    "updatedBy" UUID,
    "status" "crm_Contracts_Status" NOT NULL DEFAULT 'NOTSTARTED',
    "type" TEXT,
    "currency" VARCHAR(3),
    "snapshot_rate" DECIMAL(18,8),
    "deletedAt" TIMESTAMP(3),
    "deletedBy" UUID,

    CONSTRAINT "crm_Contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Currency" (
    "code" VARCHAR(3) NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" VARCHAR(5) NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Currency_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "ExchangeRate" (
    "id" UUID NOT NULL,
    "fromCurrency" VARCHAR(3) NOT NULL,
    "toCurrency" VARCHAR(3) NOT NULL,
    "rate" DECIMAL(18,8) NOT NULL,
    "source" "ExchangeRateSource" NOT NULL DEFAULT 'MANUAL',
    "effectiveDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExchangeRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_SystemSettings" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crm_SystemSettings_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "crm_Activities" (
    "id" UUID NOT NULL,
    "type" "crm_Activity_Type" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER,
    "outcome" TEXT,
    "status" "crm_Activity_Status" NOT NULL DEFAULT 'scheduled',
    "metadata" JSONB,
    "createdBy" UUID,
    "updatedBy" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "deletedBy" UUID,

    CONSTRAINT "crm_Activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_ActivityLinks" (
    "id" UUID NOT NULL,
    "activityId" UUID NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" UUID NOT NULL,

    CONSTRAINT "crm_ActivityLinks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Boards" (
    "id" UUID NOT NULL,
    "__v" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "favourite" BOOLEAN,
    "favouritePosition" BIGINT,
    "icon" TEXT,
    "position" BIGINT,
    "title" TEXT NOT NULL,
    "user" UUID NOT NULL,
    "visibility" TEXT,
    "sharedWith" UUID[],
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "createdBy" UUID,
    "updatedAt" TIMESTAMP(3),
    "updatedBy" UUID,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" UUID,

    CONSTRAINT "Boards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employees" (
    "id" UUID NOT NULL,
    "__v" INTEGER NOT NULL,
    "avatar" TEXT NOT NULL,
    "email" TEXT,
    "name" TEXT NOT NULL,
    "salary" BIGINT NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "Employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImageUpload" (
    "id" UUID NOT NULL,

    CONSTRAINT "ImageUpload_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Documents" (
    "id" UUID NOT NULL,
    "__v" INTEGER,
    "date_created" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "last_updated" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "document_name" TEXT NOT NULL,
    "created_by_user" UUID,
    "createdBy" UUID,
    "description" TEXT,
    "document_type" UUID,
    "favourite" BOOLEAN,
    "document_file_mimeType" TEXT NOT NULL,
    "document_file_url" TEXT NOT NULL,
    "status" TEXT,
    "visibility" TEXT,
    "tags" JSONB,
    "key" TEXT,
    "size" INTEGER,
    "assigned_user" UUID,
    "connected_documents" TEXT[],
    "content_text" TEXT,
    "summary" TEXT,
    "content_hash" TEXT,
    "thumbnail_url" TEXT,
    "processing_status" "DocumentProcessingStatus" NOT NULL DEFAULT 'PENDING',
    "processing_error" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "parent_document_id" UUID,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" UUID,
    "document_system_type" "DocumentSystemType" DEFAULT 'OTHER',

    CONSTRAINT "Documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Documents_Types" (
    "id" UUID NOT NULL,
    "__v" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Documents_Types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sections" (
    "id" UUID NOT NULL,
    "__v" INTEGER NOT NULL,
    "board" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "position" BIGINT,

    CONSTRAINT "Sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_Industry_Type" (
    "id" UUID NOT NULL,
    "__v" INTEGER NOT NULL DEFAULT 0,
    "name" TEXT NOT NULL,

    CONSTRAINT "crm_Industry_Type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tasks" (
    "id" UUID NOT NULL,
    "__v" INTEGER NOT NULL,
    "content" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "createdBy" UUID,
    "updatedAt" TIMESTAMP(3),
    "updatedBy" UUID,
    "dueDateAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "lastEditedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "position" BIGINT NOT NULL,
    "priority" TEXT NOT NULL,
    "section" UUID,
    "tags" JSONB,
    "title" TEXT NOT NULL,
    "likes" BIGINT DEFAULT 0,
    "user" UUID,
    "taskStatus" "taskStatus" DEFAULT 'ACTIVE',

    CONSTRAINT "Tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_Accounts_Tasks" (
    "id" UUID NOT NULL,
    "__v" INTEGER NOT NULL,
    "content" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "createdBy" UUID,
    "updatedAt" TIMESTAMP(3),
    "updatedBy" UUID,
    "dueDateAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "priority" TEXT NOT NULL,
    "tags" JSONB,
    "title" TEXT NOT NULL,
    "likes" BIGINT DEFAULT 0,
    "user" UUID,
    "taskStatus" "taskStatus" DEFAULT 'ACTIVE',
    "account" UUID,

    CONSTRAINT "crm_Accounts_Tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasksComments" (
    "id" UUID NOT NULL,
    "__v" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "task" UUID,
    "user" UUID NOT NULL,
    "assigned_crm_account_task" UUID,

    CONSTRAINT "tasksComments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TodoList" (
    "id" UUID NOT NULL,
    "createdAt" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "user" TEXT NOT NULL,

    CONSTRAINT "TodoList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Users" (
    "id" UUID NOT NULL,
    "__v" INTEGER NOT NULL DEFAULT 0,
    "account_name" TEXT,
    "avatar" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "role" "AppRole" NOT NULL DEFAULT 'user',
    "created_on" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "name" TEXT,
    "password" TEXT,
    "username" TEXT,
    "userStatus" "ActiveStatus" NOT NULL DEFAULT 'PENDING',
    "userLanguage" "Language" NOT NULL DEFAULT 'en',
    "banned" BOOLEAN NOT NULL DEFAULT false,
    "banReason" TEXT,
    "banExpires" TIMESTAMP(3),
    "isSuperAdmin" BOOLEAN NOT NULL DEFAULT false,
    "tenantId" TEXT,
    "accessibleTabs" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_AuditLog" (
    "id" UUID NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" UUID NOT NULL,
    "action" "crm_AuditLog_Action" NOT NULL,
    "changes" JSONB,
    "userId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "crm_AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_Report_Config" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "filters" JSONB NOT NULL,
    "isShared" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crm_Report_Config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_Report_Schedule" (
    "id" TEXT NOT NULL,
    "reportConfigId" TEXT NOT NULL,
    "cronExpression" TEXT NOT NULL,
    "recipients" JSONB NOT NULL,
    "format" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSentAt" TIMESTAMP(3),
    "createdBy" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crm_Report_Schedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiKeys" (
    "id" UUID NOT NULL,
    "scope" "ApiKeyScope" NOT NULL,
    "userId" UUID,
    "provider" "ApiKeyProvider" NOT NULL,
    "encryptedKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApiKeys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "systemServices" (
    "id" UUID NOT NULL,
    "__v" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "serviceUrl" TEXT,
    "serviceId" TEXT,
    "serviceKey" TEXT,
    "servicePassword" TEXT,
    "servicePort" TEXT,
    "description" TEXT,

    CONSTRAINT "systemServices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentsToOpportunities" (
    "document_id" UUID NOT NULL,
    "opportunity_id" UUID NOT NULL,

    CONSTRAINT "DocumentsToOpportunities_pkey" PRIMARY KEY ("document_id","opportunity_id")
);

-- CreateTable
CREATE TABLE "DocumentsToContacts" (
    "document_id" UUID NOT NULL,
    "contact_id" UUID NOT NULL,

    CONSTRAINT "DocumentsToContacts_pkey" PRIMARY KEY ("document_id","contact_id")
);

-- CreateTable
CREATE TABLE "DocumentsToTasks" (
    "document_id" UUID NOT NULL,
    "task_id" UUID NOT NULL,

    CONSTRAINT "DocumentsToTasks_pkey" PRIMARY KEY ("document_id","task_id")
);

-- CreateTable
CREATE TABLE "DocumentsToCrmAccountsTasks" (
    "document_id" UUID NOT NULL,
    "crm_accounts_task_id" UUID NOT NULL,

    CONSTRAINT "DocumentsToCrmAccountsTasks_pkey" PRIMARY KEY ("document_id","crm_accounts_task_id")
);

-- CreateTable
CREATE TABLE "DocumentsToLeads" (
    "document_id" UUID NOT NULL,
    "lead_id" UUID NOT NULL,

    CONSTRAINT "DocumentsToLeads_pkey" PRIMARY KEY ("document_id","lead_id")
);

-- CreateTable
CREATE TABLE "DocumentsToAccounts" (
    "document_id" UUID NOT NULL,
    "account_id" UUID NOT NULL,

    CONSTRAINT "DocumentsToAccounts_pkey" PRIMARY KEY ("document_id","account_id")
);

-- CreateTable
CREATE TABLE "AccountWatchers" (
    "account_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,

    CONSTRAINT "AccountWatchers_pkey" PRIMARY KEY ("account_id","user_id")
);

-- CreateTable
CREATE TABLE "BoardWatchers" (
    "board_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,

    CONSTRAINT "BoardWatchers_pkey" PRIMARY KEY ("board_id","user_id")
);

-- CreateTable
CREATE TABLE "ContactsToOpportunities" (
    "contact_id" UUID NOT NULL,
    "opportunity_id" UUID NOT NULL,

    CONSTRAINT "ContactsToOpportunities_pkey" PRIMARY KEY ("contact_id","opportunity_id")
);

-- CreateTable
CREATE TABLE "crm_Targets" (
    "id" UUID NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT NOT NULL,
    "email" TEXT,
    "mobile_phone" TEXT,
    "office_phone" TEXT,
    "company" TEXT,
    "company_website" TEXT,
    "personal_website" TEXT,
    "position" TEXT,
    "social_x" TEXT,
    "social_linkedin" TEXT,
    "social_instagram" TEXT,
    "social_facebook" TEXT,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "tags" TEXT[],
    "notes" TEXT[],
    "created_by" UUID,
    "created_on" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "updatedBy" UUID,
    "personal_email" TEXT,
    "company_email" TEXT,
    "company_phone" TEXT,
    "city" TEXT,
    "country" TEXT,
    "industry" TEXT,
    "employees" TEXT,
    "description" TEXT,
    "converted_at" TIMESTAMP(3),
    "converted_account_id" UUID,
    "converted_contact_id" UUID,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" UUID,

    CONSTRAINT "crm_Targets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_TargetLists" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "created_by" UUID,
    "created_on" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "deletedBy" UUID,

    CONSTRAINT "crm_TargetLists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TargetsToTargetLists" (
    "target_id" UUID NOT NULL,
    "target_list_id" UUID NOT NULL,

    CONSTRAINT "TargetsToTargetLists_pkey" PRIMARY KEY ("target_id","target_list_id")
);

-- CreateTable
CREATE TABLE "crm_Embeddings_Accounts" (
    "id" UUID NOT NULL,
    "account_id" UUID NOT NULL,
    "embedding" extensions.vector(1536) NOT NULL,
    "content_hash" TEXT NOT NULL,
    "embedded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "crm_Embeddings_Accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_Embeddings_Contacts" (
    "id" UUID NOT NULL,
    "contact_id" UUID NOT NULL,
    "embedding" extensions.vector(1536) NOT NULL,
    "content_hash" TEXT NOT NULL,
    "embedded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "crm_Embeddings_Contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_Embeddings_Leads" (
    "id" UUID NOT NULL,
    "lead_id" UUID NOT NULL,
    "embedding" extensions.vector(1536) NOT NULL,
    "content_hash" TEXT NOT NULL,
    "embedded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "crm_Embeddings_Leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_Embeddings_Opportunities" (
    "id" UUID NOT NULL,
    "opportunity_id" UUID NOT NULL,
    "embedding" extensions.vector(1536) NOT NULL,
    "content_hash" TEXT NOT NULL,
    "embedded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "crm_Embeddings_Opportunities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_Embeddings_Documents" (
    "id" UUID NOT NULL,
    "document_id" UUID NOT NULL,
    "embedding" extensions.vector(1536) NOT NULL,
    "content_hash" TEXT NOT NULL,
    "embedded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "crm_Embeddings_Documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_Document_Chunks" (
    "id" UUID NOT NULL,
    "document_id" UUID NOT NULL,
    "chunk_index" INTEGER NOT NULL,
    "chunk_text" TEXT NOT NULL,
    "embedding" extensions.vector(1536) NOT NULL,
    "embedded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "crm_Document_Chunks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiToken" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "tokenPrefix" VARCHAR(8) NOT NULL,
    "userId" UUID NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "lastUsedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailAccount" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "label" TEXT NOT NULL,
    "imapHost" TEXT NOT NULL,
    "imapPort" INTEGER NOT NULL,
    "imapSsl" BOOLEAN NOT NULL DEFAULT true,
    "smtpHost" TEXT NOT NULL,
    "smtpPort" INTEGER NOT NULL,
    "smtpSsl" BOOLEAN NOT NULL DEFAULT true,
    "username" TEXT NOT NULL,
    "passwordEncrypted" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sentFolderName" TEXT NOT NULL DEFAULT 'Sent',
    "lastSyncedAt" TIMESTAMP(3),
    "inboxLastUid" INTEGER,
    "sentLastUid" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Email" (
    "id" UUID NOT NULL,
    "emailAccountId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "rfcMessageId" TEXT NOT NULL,
    "imapUid" INTEGER,
    "folder" "EmailFolder" NOT NULL,
    "subject" TEXT,
    "fromName" TEXT,
    "fromEmail" TEXT,
    "toRecipients" JSONB NOT NULL DEFAULT '[]',
    "ccRecipients" JSONB NOT NULL DEFAULT '[]',
    "bccRecipients" JSONB NOT NULL DEFAULT '[]',
    "bodyText" TEXT,
    "bodyHtml" TEXT,
    "sentAt" TIMESTAMP(3),
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Email_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailEmbedding" (
    "id" UUID NOT NULL,
    "emailId" UUID NOT NULL,
    "embedding" extensions.vector(1536) NOT NULL,
    "contentHash" TEXT NOT NULL,
    "embeddedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailEmbedding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailsToContacts" (
    "emailId" UUID NOT NULL,
    "contactId" UUID NOT NULL,

    CONSTRAINT "EmailsToContacts_pkey" PRIMARY KEY ("emailId","contactId")
);

-- CreateTable
CREATE TABLE "EmailsToAccounts" (
    "emailId" UUID NOT NULL,
    "accountId" UUID NOT NULL,

    CONSTRAINT "EmailsToAccounts_pkey" PRIMARY KEY ("emailId","accountId")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" UUID NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" UUID NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_ProductCategories" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" UUID NOT NULL,
    "updatedBy" UUID,

    CONSTRAINT "crm_ProductCategories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_Products" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sku" TEXT,
    "type" "crm_Product_Type" NOT NULL,
    "status" "crm_Product_Status" NOT NULL DEFAULT 'DRAFT',
    "unit_price" DECIMAL(18,2) NOT NULL,
    "unit_cost" DECIMAL(18,2),
    "currency" VARCHAR(3) NOT NULL,
    "tax_rate" DECIMAL(5,2),
    "unit" TEXT,
    "is_recurring" BOOLEAN NOT NULL DEFAULT false,
    "billing_period" "crm_Billing_Period",
    "categoryId" UUID,
    "__v" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" UUID NOT NULL,
    "updatedBy" UUID,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" UUID,

    CONSTRAINT "crm_Products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_AccountProducts" (
    "id" UUID NOT NULL,
    "accountId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "custom_price" DECIMAL(18,2),
    "currency" VARCHAR(3) NOT NULL,
    "snapshot_rate" DECIMAL(18,8),
    "status" "crm_AccountProduct_Status" NOT NULL DEFAULT 'ACTIVE',
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "renewal_date" TIMESTAMP(3),
    "notes" TEXT,
    "__v" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" UUID NOT NULL,
    "updatedBy" UUID,

    CONSTRAINT "crm_AccountProducts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_OpportunityLineItems" (
    "id" UUID NOT NULL,
    "opportunityId" UUID NOT NULL,
    "productId" UUID,
    "name" TEXT NOT NULL,
    "sku" TEXT,
    "description" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unit_price" DECIMAL(18,2) NOT NULL,
    "discount_type" "crm_Discount_Type" NOT NULL DEFAULT 'PERCENTAGE',
    "discount_value" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "line_total" DECIMAL(18,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "__v" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" UUID NOT NULL,
    "updatedBy" UUID,

    CONSTRAINT "crm_OpportunityLineItems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_ContractLineItems" (
    "id" UUID NOT NULL,
    "contractId" UUID NOT NULL,
    "productId" UUID,
    "name" TEXT NOT NULL,
    "sku" TEXT,
    "description" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unit_price" DECIMAL(18,2) NOT NULL,
    "discount_type" "crm_Discount_Type" NOT NULL DEFAULT 'PERCENTAGE',
    "discount_value" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "line_total" DECIMAL(18,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "__v" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" UUID NOT NULL,
    "updatedBy" UUID,

    CONSTRAINT "crm_ContractLineItems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoices" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" UUID NOT NULL,
    "type" "Invoice_Type" NOT NULL DEFAULT 'INVOICE',
    "status" "Invoice_Status" NOT NULL DEFAULT 'DRAFT',
    "number" TEXT,
    "numberOverridden" BOOLEAN NOT NULL DEFAULT false,
    "seriesId" UUID,
    "accountId" UUID NOT NULL,
    "billingSnapshot" JSONB,
    "issueDate" TIMESTAMP(3),
    "taxableSupplyDate" TIMESTAMP(3),
    "dueDate" TIMESTAMP(3),
    "currency" VARCHAR(3) NOT NULL,
    "baseCurrency" VARCHAR(3),
    "fxRateToBase" DECIMAL(18,8),
    "subtotal" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "discountTotal" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "vatTotal" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "grandTotal" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "paidTotal" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "balanceDue" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "bankName" TEXT,
    "bankAccount" TEXT,
    "iban" TEXT,
    "swift" TEXT,
    "variableSymbol" TEXT,
    "publicNotes" TEXT,
    "internalNotes" TEXT,
    "originalInvoiceId" UUID,
    "pdfStorageKey" TEXT,
    "pdfGeneratedAt" TIMESTAMP(3),
    "search_vector" tsvector,

    CONSTRAINT "Invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice_LineItems" (
    "id" UUID NOT NULL,
    "invoiceId" UUID NOT NULL,
    "position" INTEGER NOT NULL,
    "productId" UUID,
    "description" TEXT NOT NULL,
    "quantity" DECIMAL(14,4) NOT NULL,
    "unitPrice" DECIMAL(14,4) NOT NULL,
    "discountPercent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "taxRateId" UUID,
    "taxRateSnapshot" DECIMAL(5,2),
    "lineSubtotal" DECIMAL(14,2) NOT NULL,
    "lineVat" DECIMAL(14,2) NOT NULL,
    "lineTotal" DECIMAL(14,2) NOT NULL,

    CONSTRAINT "Invoice_LineItems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice_Payments" (
    "id" UUID NOT NULL,
    "invoiceId" UUID NOT NULL,
    "paidAt" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "method" TEXT,
    "reference" TEXT,
    "note" TEXT,
    "createdBy" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Invoice_Payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice_Attachments" (
    "id" UUID NOT NULL,
    "invoiceId" UUID NOT NULL,
    "storageKey" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "uploadedBy" UUID NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isPrimaryPdf" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Invoice_Attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice_Activity" (
    "id" UUID NOT NULL,
    "invoiceId" UUID NOT NULL,
    "actorId" UUID NOT NULL,
    "action" TEXT NOT NULL,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Invoice_Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice_TaxRates" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "rate" DECIMAL(5,2) NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_TaxRates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice_Series" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "prefixTemplate" TEXT NOT NULL,
    "resetPolicy" TEXT NOT NULL DEFAULT 'YEARLY',
    "currentYear" INTEGER,
    "counter" INTEGER NOT NULL DEFAULT 0,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_Series_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice_Settings" (
    "id" UUID NOT NULL,
    "baseCurrency" VARCHAR(3) NOT NULL,
    "defaultSeriesId" UUID,
    "defaultTaxRateId" UUID,
    "defaultDueDays" INTEGER NOT NULL DEFAULT 14,
    "bankName" TEXT,
    "bankAccount" TEXT,
    "iban" TEXT,
    "swift" TEXT,
    "footerText" TEXT,
    "companyName" TEXT,
    "companyAddress" TEXT,
    "companyCity" TEXT,
    "companyZip" TEXT,
    "companyCountry" TEXT,
    "companyVatId" TEXT,
    "companyTaxId" TEXT,
    "companyRegNo" TEXT,
    "companyEmail" TEXT,
    "companyPhone" TEXT,
    "companyWebsite" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_Settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseOrders" (
    "id" UUID NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "vendorId" UUID NOT NULL,
    "status" "PurchaseOrderStatus" NOT NULL DEFAULT 'DRAFT',
    "orderDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expectedDeliveryDate" TIMESTAMP(3),
    "deliveredDate" TIMESTAMP(3),
    "subtotal" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "taxTotal" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "grandTotal" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "currency" VARCHAR(3) NOT NULL,
    "notes" TEXT,
    "termsAndConditions" TEXT,
    "shippingAddress" JSONB,
    "billingAddress" JSONB,
    "requestedBy" UUID NOT NULL,
    "approvedBy" UUID,
    "approvedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdBy" UUID NOT NULL,
    "updatedBy" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" UUID,

    CONSTRAINT "PurchaseOrders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseOrderLineItems" (
    "id" UUID NOT NULL,
    "purchaseOrderId" UUID NOT NULL,
    "productId" UUID,
    "description" TEXT NOT NULL,
    "quantity" DECIMAL(14,4) NOT NULL,
    "unitPrice" DECIMAL(14,2) NOT NULL,
    "taxRate" DECIMAL(5,2),
    "lineTotal" DECIMAL(14,2) NOT NULL,
    "receivedQuantity" DECIMAL(14,4) NOT NULL DEFAULT 0,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PurchaseOrderLineItems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryWarehouse" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "address" TEXT,
    "city" TEXT,
    "country" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" UUID NOT NULL,
    "updatedBy" UUID,

    CONSTRAINT "InventoryWarehouse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryStock" (
    "id" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "warehouseId" UUID NOT NULL,
    "quantity" DECIMAL(14,4) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InventoryStock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryMovement" (
    "id" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "warehouseId" UUID NOT NULL,
    "type" "InventoryMovementType" NOT NULL,
    "quantity" DECIMAL(14,4) NOT NULL,
    "reference" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" UUID NOT NULL,

    CONSTRAINT "InventoryMovement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReorderThreshold" (
    "id" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "warehouseId" UUID NOT NULL,
    "minQuantity" DECIMAL(14,4) NOT NULL DEFAULT 0,
    "maxQuantity" DECIMAL(14,4),
    "reorderPoint" DECIMAL(14,4) NOT NULL DEFAULT 0,
    "reorderQuantity" DECIMAL(14,4) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" UUID NOT NULL,
    "updatedBy" UUID,

    CONSTRAINT "ReorderThreshold_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeedbackTicket" (
    "id" UUID NOT NULL,
    "ticketRef" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "subject" TEXT,
    "message" TEXT NOT NULL,
    "status" "FeedbackStatus" NOT NULL DEFAULT 'OPEN',
    "priority" "FeedbackPriority" NOT NULL DEFAULT 'MEDIUM',
    "category" TEXT,
    "response" TEXT,
    "respondedBy" UUID,
    "respondedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeedbackTicket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_Industry_Templates" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT DEFAULT 'Building',
    "features" TEXT[],
    "crmCustomFields" JSONB,
    "whatsappTemplates" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crm_Industry_Templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_Whatsapp_Instances" (
    "id" UUID NOT NULL,
    "tenantId" TEXT NOT NULL,
    "instanceName" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DISCONNECTED',
    "qrCode" TEXT,
    "credentials" JSONB,
    "connectionConfig" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crm_Whatsapp_Instances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_Tenant_Subscriptions" (
    "id" UUID NOT NULL,
    "tenantId" TEXT NOT NULL,
    "planName" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "billingCycle" TEXT NOT NULL DEFAULT 'MONTHLY',
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "features" JSONB,
    "usage" JSONB,
    "paymentMethod" TEXT,
    "lastPaymentDate" TIMESTAMP(3),
    "nextBillingDate" TIMESTAMP(3),
    "stripeSubscriptionId" TEXT,
    "stripeCustomerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crm_Tenant_Subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "crm_Accounts_assigned_to_idx" ON "crm_Accounts"("assigned_to");

-- CreateIndex
CREATE INDEX "crm_Accounts_industry_idx" ON "crm_Accounts"("industry");

-- CreateIndex
CREATE INDEX "crm_Accounts_createdBy_idx" ON "crm_Accounts"("createdBy");

-- CreateIndex
CREATE INDEX "crm_Accounts_updatedBy_idx" ON "crm_Accounts"("updatedBy");

-- CreateIndex
CREATE INDEX "crm_Accounts_status_idx" ON "crm_Accounts"("status");

-- CreateIndex
CREATE INDEX "crm_Accounts_type_idx" ON "crm_Accounts"("type");

-- CreateIndex
CREATE INDEX "crm_Accounts_createdAt_idx" ON "crm_Accounts"("createdAt");

-- CreateIndex
CREATE INDEX "crm_Accounts_deletedAt_idx" ON "crm_Accounts"("deletedAt");

-- CreateIndex
CREATE INDEX "crm_Leads_assigned_to_idx" ON "crm_Leads"("assigned_to");

-- CreateIndex
CREATE INDEX "crm_Leads_accountsIDs_idx" ON "crm_Leads"("accountsIDs");

-- CreateIndex
CREATE INDEX "crm_Leads_createdBy_idx" ON "crm_Leads"("createdBy");

-- CreateIndex
CREATE INDEX "crm_Leads_updatedBy_idx" ON "crm_Leads"("updatedBy");

-- CreateIndex
CREATE INDEX "crm_Leads_lead_source_id_idx" ON "crm_Leads"("lead_source_id");

-- CreateIndex
CREATE INDEX "crm_Leads_lead_status_id_idx" ON "crm_Leads"("lead_status_id");

-- CreateIndex
CREATE INDEX "crm_Leads_lead_type_id_idx" ON "crm_Leads"("lead_type_id");

-- CreateIndex
CREATE INDEX "crm_Leads_createdAt_idx" ON "crm_Leads"("createdAt");

-- CreateIndex
CREATE INDEX "crm_Leads_deletedAt_idx" ON "crm_Leads"("deletedAt");

-- CreateIndex
CREATE INDEX "crm_Contact_Enrichment_contactId_idx" ON "crm_Contact_Enrichment"("contactId");

-- CreateIndex
CREATE INDEX "crm_Contact_Enrichment_status_idx" ON "crm_Contact_Enrichment"("status");

-- CreateIndex
CREATE INDEX "crm_Contact_Enrichment_createdAt_idx" ON "crm_Contact_Enrichment"("createdAt");

-- CreateIndex
CREATE INDEX "crm_Contact_Enrichment_triggeredBy_idx" ON "crm_Contact_Enrichment"("triggeredBy");

-- CreateIndex
CREATE INDEX "crm_Target_Enrichment_targetId_idx" ON "crm_Target_Enrichment"("targetId");

-- CreateIndex
CREATE INDEX "crm_Target_Enrichment_status_idx" ON "crm_Target_Enrichment"("status");

-- CreateIndex
CREATE INDEX "crm_Target_Enrichment_createdAt_idx" ON "crm_Target_Enrichment"("createdAt");

-- CreateIndex
CREATE INDEX "crm_Target_Enrichment_triggeredBy_idx" ON "crm_Target_Enrichment"("triggeredBy");

-- CreateIndex
CREATE INDEX "crm_Target_Contact_targetId_idx" ON "crm_Target_Contact"("targetId");

-- CreateIndex
CREATE INDEX "crm_Target_Contact_enrichStatus_idx" ON "crm_Target_Contact"("enrichStatus");

-- CreateIndex
CREATE UNIQUE INDEX "crm_Target_Contact_targetId_email_key" ON "crm_Target_Contact"("targetId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "crm_Target_Contact_targetId_linkedinUrl_key" ON "crm_Target_Contact"("targetId", "linkedinUrl");

-- CreateIndex
CREATE INDEX "crm_Opportunities_account_idx" ON "crm_Opportunities"("account");

-- CreateIndex
CREATE INDEX "crm_Opportunities_assigned_to_idx" ON "crm_Opportunities"("assigned_to");

-- CreateIndex
CREATE INDEX "crm_Opportunities_campaign_idx" ON "crm_Opportunities"("campaign");

-- CreateIndex
CREATE INDEX "crm_Opportunities_contact_idx" ON "crm_Opportunities"("contact");

-- CreateIndex
CREATE INDEX "crm_Opportunities_createdBy_idx" ON "crm_Opportunities"("createdBy");

-- CreateIndex
CREATE INDEX "crm_Opportunities_sales_stage_idx" ON "crm_Opportunities"("sales_stage");

-- CreateIndex
CREATE INDEX "crm_Opportunities_type_idx" ON "crm_Opportunities"("type");

-- CreateIndex
CREATE INDEX "crm_Opportunities_status_idx" ON "crm_Opportunities"("status");

-- CreateIndex
CREATE INDEX "crm_Opportunities_createdAt_idx" ON "crm_Opportunities"("createdAt");

-- CreateIndex
CREATE INDEX "crm_Opportunities_close_date_idx" ON "crm_Opportunities"("close_date");

-- CreateIndex
CREATE INDEX "crm_Opportunities_status_sales_stage_idx" ON "crm_Opportunities"("status", "sales_stage");

-- CreateIndex
CREATE INDEX "crm_Opportunities_deletedAt_idx" ON "crm_Opportunities"("deletedAt");

-- CreateIndex
CREATE INDEX "crm_campaigns_deletedAt_idx" ON "crm_campaigns"("deletedAt");

-- CreateIndex
CREATE INDEX "crm_campaign_templates_created_by_idx" ON "crm_campaign_templates"("created_by");

-- CreateIndex
CREATE INDEX "crm_campaign_templates_deletedAt_idx" ON "crm_campaign_templates"("deletedAt");

-- CreateIndex
CREATE INDEX "crm_campaign_steps_campaign_id_idx" ON "crm_campaign_steps"("campaign_id");

-- CreateIndex
CREATE INDEX "crm_campaign_steps_scheduled_at_idx" ON "crm_campaign_steps"("scheduled_at");

-- CreateIndex
CREATE UNIQUE INDEX "crm_campaign_steps_campaign_id_order_key" ON "crm_campaign_steps"("campaign_id", "order");

-- CreateIndex
CREATE UNIQUE INDEX "crm_campaign_sends_unsubscribe_token_key" ON "crm_campaign_sends"("unsubscribe_token");

-- CreateIndex
CREATE INDEX "crm_campaign_sends_campaign_id_idx" ON "crm_campaign_sends"("campaign_id");

-- CreateIndex
CREATE INDEX "crm_campaign_sends_step_id_target_id_idx" ON "crm_campaign_sends"("step_id", "target_id");

-- CreateIndex
CREATE INDEX "crm_campaign_sends_resend_message_id_idx" ON "crm_campaign_sends"("resend_message_id");

-- CreateIndex
CREATE INDEX "crm_campaign_sends_status_idx" ON "crm_campaign_sends"("status");

-- CreateIndex
CREATE INDEX "crm_campaign_sends_unsubscribe_token_idx" ON "crm_campaign_sends"("unsubscribe_token");

-- CreateIndex
CREATE UNIQUE INDEX "crm_campaign_sends_step_id_target_id_key" ON "crm_campaign_sends"("step_id", "target_id");

-- CreateIndex
CREATE UNIQUE INDEX "crm_Contact_Types_name_key" ON "crm_Contact_Types"("name");

-- CreateIndex
CREATE INDEX "crm_Contact_Types_name_idx" ON "crm_Contact_Types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "crm_Lead_Sources_name_key" ON "crm_Lead_Sources"("name");

-- CreateIndex
CREATE INDEX "crm_Lead_Sources_name_idx" ON "crm_Lead_Sources"("name");

-- CreateIndex
CREATE UNIQUE INDEX "crm_Lead_Statuses_name_key" ON "crm_Lead_Statuses"("name");

-- CreateIndex
CREATE INDEX "crm_Lead_Statuses_name_idx" ON "crm_Lead_Statuses"("name");

-- CreateIndex
CREATE UNIQUE INDEX "crm_Lead_Types_name_key" ON "crm_Lead_Types"("name");

-- CreateIndex
CREATE INDEX "crm_Lead_Types_name_idx" ON "crm_Lead_Types"("name");

-- CreateIndex
CREATE INDEX "crm_Contacts_assigned_to_idx" ON "crm_Contacts"("assigned_to");

-- CreateIndex
CREATE INDEX "crm_Contacts_accountsIDs_idx" ON "crm_Contacts"("accountsIDs");

-- CreateIndex
CREATE INDEX "crm_Contacts_createdBy_idx" ON "crm_Contacts"("createdBy");

-- CreateIndex
CREATE INDEX "crm_Contacts_updatedBy_idx" ON "crm_Contacts"("updatedBy");

-- CreateIndex
CREATE INDEX "crm_Contacts_status_idx" ON "crm_Contacts"("status");

-- CreateIndex
CREATE INDEX "crm_Contacts_contact_type_id_idx" ON "crm_Contacts"("contact_type_id");

-- CreateIndex
CREATE INDEX "crm_Contacts_cratedAt_idx" ON "crm_Contacts"("cratedAt");

-- CreateIndex
CREATE INDEX "crm_Contacts_last_activity_idx" ON "crm_Contacts"("last_activity");

-- CreateIndex
CREATE INDEX "crm_Contacts_deletedAt_idx" ON "crm_Contacts"("deletedAt");

-- CreateIndex
CREATE INDEX "crm_Contracts_account_idx" ON "crm_Contracts"("account");

-- CreateIndex
CREATE INDEX "crm_Contracts_assigned_to_idx" ON "crm_Contracts"("assigned_to");

-- CreateIndex
CREATE INDEX "crm_Contracts_createdBy_idx" ON "crm_Contracts"("createdBy");

-- CreateIndex
CREATE INDEX "crm_Contracts_updatedBy_idx" ON "crm_Contracts"("updatedBy");

-- CreateIndex
CREATE INDEX "crm_Contracts_status_idx" ON "crm_Contracts"("status");

-- CreateIndex
CREATE INDEX "crm_Contracts_startDate_idx" ON "crm_Contracts"("startDate");

-- CreateIndex
CREATE INDEX "crm_Contracts_endDate_idx" ON "crm_Contracts"("endDate");

-- CreateIndex
CREATE INDEX "crm_Contracts_createdAt_idx" ON "crm_Contracts"("createdAt");

-- CreateIndex
CREATE INDEX "crm_Contracts_startDate_endDate_idx" ON "crm_Contracts"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "crm_Contracts_deletedAt_idx" ON "crm_Contracts"("deletedAt");

-- CreateIndex
CREATE INDEX "ExchangeRate_fromCurrency_idx" ON "ExchangeRate"("fromCurrency");

-- CreateIndex
CREATE INDEX "ExchangeRate_toCurrency_idx" ON "ExchangeRate"("toCurrency");

-- CreateIndex
CREATE UNIQUE INDEX "ExchangeRate_fromCurrency_toCurrency_key" ON "ExchangeRate"("fromCurrency", "toCurrency");

-- CreateIndex
CREATE INDEX "crm_Activities_date_idx" ON "crm_Activities"("date");

-- CreateIndex
CREATE INDEX "crm_Activities_type_idx" ON "crm_Activities"("type");

-- CreateIndex
CREATE INDEX "crm_Activities_status_idx" ON "crm_Activities"("status");

-- CreateIndex
CREATE INDEX "crm_Activities_createdBy_idx" ON "crm_Activities"("createdBy");

-- CreateIndex
CREATE INDEX "crm_Activities_createdAt_idx" ON "crm_Activities"("createdAt");

-- CreateIndex
CREATE INDEX "crm_Activities_deletedAt_idx" ON "crm_Activities"("deletedAt");

-- CreateIndex
CREATE INDEX "crm_ActivityLinks_activityId_idx" ON "crm_ActivityLinks"("activityId");

-- CreateIndex
CREATE INDEX "crm_ActivityLinks_entityType_entityId_activityId_idx" ON "crm_ActivityLinks"("entityType", "entityId", "activityId");

-- CreateIndex
CREATE INDEX "Boards_user_idx" ON "Boards"("user");

-- CreateIndex
CREATE INDEX "Boards_createdBy_idx" ON "Boards"("createdBy");

-- CreateIndex
CREATE INDEX "Boards_updatedBy_idx" ON "Boards"("updatedBy");

-- CreateIndex
CREATE INDEX "Boards_favourite_idx" ON "Boards"("favourite");

-- CreateIndex
CREATE INDEX "Boards_visibility_idx" ON "Boards"("visibility");

-- CreateIndex
CREATE INDEX "Boards_createdAt_idx" ON "Boards"("createdAt");

-- CreateIndex
CREATE INDEX "Boards_user_favourite_idx" ON "Boards"("user", "favourite");

-- CreateIndex
CREATE INDEX "Boards_deletedAt_idx" ON "Boards"("deletedAt");

-- CreateIndex
CREATE INDEX "Documents_created_by_user_idx" ON "Documents"("created_by_user");

-- CreateIndex
CREATE INDEX "Documents_assigned_user_idx" ON "Documents"("assigned_user");

-- CreateIndex
CREATE INDEX "Documents_document_type_idx" ON "Documents"("document_type");

-- CreateIndex
CREATE INDEX "Documents_createdBy_idx" ON "Documents"("createdBy");

-- CreateIndex
CREATE INDEX "Documents_status_idx" ON "Documents"("status");

-- CreateIndex
CREATE INDEX "Documents_visibility_idx" ON "Documents"("visibility");

-- CreateIndex
CREATE INDEX "Documents_favourite_idx" ON "Documents"("favourite");

-- CreateIndex
CREATE INDEX "Documents_createdAt_idx" ON "Documents"("createdAt");

-- CreateIndex
CREATE INDEX "Documents_document_system_type_idx" ON "Documents"("document_system_type");

-- CreateIndex
CREATE INDEX "Documents_content_hash_idx" ON "Documents"("content_hash");

-- CreateIndex
CREATE INDEX "Documents_parent_document_id_idx" ON "Documents"("parent_document_id");

-- CreateIndex
CREATE INDEX "Documents_processing_status_idx" ON "Documents"("processing_status");

-- CreateIndex
CREATE INDEX "Documents_deletedAt_idx" ON "Documents"("deletedAt");

-- CreateIndex
CREATE INDEX "Sections_board_idx" ON "Sections"("board");

-- CreateIndex
CREATE INDEX "Tasks_user_idx" ON "Tasks"("user");

-- CreateIndex
CREATE INDEX "Tasks_section_idx" ON "Tasks"("section");

-- CreateIndex
CREATE INDEX "Tasks_createdBy_idx" ON "Tasks"("createdBy");

-- CreateIndex
CREATE INDEX "Tasks_updatedBy_idx" ON "Tasks"("updatedBy");

-- CreateIndex
CREATE INDEX "Tasks_priority_idx" ON "Tasks"("priority");

-- CreateIndex
CREATE INDEX "Tasks_taskStatus_idx" ON "Tasks"("taskStatus");

-- CreateIndex
CREATE INDEX "Tasks_dueDateAt_idx" ON "Tasks"("dueDateAt");

-- CreateIndex
CREATE INDEX "Tasks_createdAt_idx" ON "Tasks"("createdAt");

-- CreateIndex
CREATE INDEX "Tasks_user_taskStatus_idx" ON "Tasks"("user", "taskStatus");

-- CreateIndex
CREATE INDEX "crm_Accounts_Tasks_user_idx" ON "crm_Accounts_Tasks"("user");

-- CreateIndex
CREATE INDEX "crm_Accounts_Tasks_account_idx" ON "crm_Accounts_Tasks"("account");

-- CreateIndex
CREATE INDEX "crm_Accounts_Tasks_createdBy_idx" ON "crm_Accounts_Tasks"("createdBy");

-- CreateIndex
CREATE INDEX "crm_Accounts_Tasks_updatedBy_idx" ON "crm_Accounts_Tasks"("updatedBy");

-- CreateIndex
CREATE INDEX "crm_Accounts_Tasks_priority_idx" ON "crm_Accounts_Tasks"("priority");

-- CreateIndex
CREATE INDEX "crm_Accounts_Tasks_taskStatus_idx" ON "crm_Accounts_Tasks"("taskStatus");

-- CreateIndex
CREATE INDEX "crm_Accounts_Tasks_dueDateAt_idx" ON "crm_Accounts_Tasks"("dueDateAt");

-- CreateIndex
CREATE INDEX "crm_Accounts_Tasks_createdAt_idx" ON "crm_Accounts_Tasks"("createdAt");

-- CreateIndex
CREATE INDEX "crm_Accounts_Tasks_account_taskStatus_idx" ON "crm_Accounts_Tasks"("account", "taskStatus");

-- CreateIndex
CREATE INDEX "tasksComments_task_idx" ON "tasksComments"("task");

-- CreateIndex
CREATE INDEX "tasksComments_user_idx" ON "tasksComments"("user");

-- CreateIndex
CREATE INDEX "tasksComments_assigned_crm_account_task_idx" ON "tasksComments"("assigned_crm_account_task");

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");

-- CreateIndex
CREATE INDEX "Users_email_idx" ON "Users"("email");

-- CreateIndex
CREATE INDEX "Users_userStatus_idx" ON "Users"("userStatus");

-- CreateIndex
CREATE INDEX "Users_userLanguage_idx" ON "Users"("userLanguage");

-- CreateIndex
CREATE INDEX "Users_role_idx" ON "Users"("role");

-- CreateIndex
CREATE INDEX "Users_created_on_idx" ON "Users"("created_on");

-- CreateIndex
CREATE INDEX "Users_lastLoginAt_idx" ON "Users"("lastLoginAt");

-- CreateIndex
CREATE INDEX "crm_AuditLog_entityType_entityId_createdAt_idx" ON "crm_AuditLog"("entityType", "entityId", "createdAt");

-- CreateIndex
CREATE INDEX "crm_AuditLog_userId_idx" ON "crm_AuditLog"("userId");

-- CreateIndex
CREATE INDEX "crm_AuditLog_createdAt_idx" ON "crm_AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "crm_AuditLog_entityType_createdAt_idx" ON "crm_AuditLog"("entityType", "createdAt");

-- CreateIndex
CREATE INDEX "crm_Report_Config_createdBy_idx" ON "crm_Report_Config"("createdBy");

-- CreateIndex
CREATE INDEX "crm_Report_Config_category_idx" ON "crm_Report_Config"("category");

-- CreateIndex
CREATE INDEX "crm_Report_Config_isShared_idx" ON "crm_Report_Config"("isShared");

-- CreateIndex
CREATE INDEX "crm_Report_Schedule_reportConfigId_idx" ON "crm_Report_Schedule"("reportConfigId");

-- CreateIndex
CREATE INDEX "crm_Report_Schedule_createdBy_idx" ON "crm_Report_Schedule"("createdBy");

-- CreateIndex
CREATE INDEX "crm_Report_Schedule_isActive_idx" ON "crm_Report_Schedule"("isActive");

-- CreateIndex
CREATE INDEX "crm_Report_Schedule_lastSentAt_idx" ON "crm_Report_Schedule"("lastSentAt");

-- CreateIndex
CREATE INDEX "ApiKeys_scope_provider_idx" ON "ApiKeys"("scope", "provider");

-- CreateIndex
CREATE INDEX "ApiKeys_userId_provider_idx" ON "ApiKeys"("userId", "provider");

-- CreateIndex
CREATE INDEX "DocumentsToOpportunities_document_id_idx" ON "DocumentsToOpportunities"("document_id");

-- CreateIndex
CREATE INDEX "DocumentsToOpportunities_opportunity_id_idx" ON "DocumentsToOpportunities"("opportunity_id");

-- CreateIndex
CREATE INDEX "DocumentsToContacts_document_id_idx" ON "DocumentsToContacts"("document_id");

-- CreateIndex
CREATE INDEX "DocumentsToContacts_contact_id_idx" ON "DocumentsToContacts"("contact_id");

-- CreateIndex
CREATE INDEX "DocumentsToTasks_document_id_idx" ON "DocumentsToTasks"("document_id");

-- CreateIndex
CREATE INDEX "DocumentsToTasks_task_id_idx" ON "DocumentsToTasks"("task_id");

-- CreateIndex
CREATE INDEX "DocumentsToCrmAccountsTasks_document_id_idx" ON "DocumentsToCrmAccountsTasks"("document_id");

-- CreateIndex
CREATE INDEX "DocumentsToCrmAccountsTasks_crm_accounts_task_id_idx" ON "DocumentsToCrmAccountsTasks"("crm_accounts_task_id");

-- CreateIndex
CREATE INDEX "DocumentsToLeads_document_id_idx" ON "DocumentsToLeads"("document_id");

-- CreateIndex
CREATE INDEX "DocumentsToLeads_lead_id_idx" ON "DocumentsToLeads"("lead_id");

-- CreateIndex
CREATE INDEX "DocumentsToAccounts_document_id_idx" ON "DocumentsToAccounts"("document_id");

-- CreateIndex
CREATE INDEX "DocumentsToAccounts_account_id_idx" ON "DocumentsToAccounts"("account_id");

-- CreateIndex
CREATE INDEX "AccountWatchers_account_id_idx" ON "AccountWatchers"("account_id");

-- CreateIndex
CREATE INDEX "AccountWatchers_user_id_idx" ON "AccountWatchers"("user_id");

-- CreateIndex
CREATE INDEX "BoardWatchers_board_id_idx" ON "BoardWatchers"("board_id");

-- CreateIndex
CREATE INDEX "BoardWatchers_user_id_idx" ON "BoardWatchers"("user_id");

-- CreateIndex
CREATE INDEX "ContactsToOpportunities_contact_id_idx" ON "ContactsToOpportunities"("contact_id");

-- CreateIndex
CREATE INDEX "ContactsToOpportunities_opportunity_id_idx" ON "ContactsToOpportunities"("opportunity_id");

-- CreateIndex
CREATE INDEX "crm_Targets_created_by_idx" ON "crm_Targets"("created_by");

-- CreateIndex
CREATE INDEX "crm_Targets_status_idx" ON "crm_Targets"("status");

-- CreateIndex
CREATE INDEX "crm_Targets_created_on_idx" ON "crm_Targets"("created_on");

-- CreateIndex
CREATE INDEX "crm_Targets_converted_account_id_idx" ON "crm_Targets"("converted_account_id");

-- CreateIndex
CREATE INDEX "crm_Targets_converted_contact_id_idx" ON "crm_Targets"("converted_contact_id");

-- CreateIndex
CREATE INDEX "crm_Targets_deletedAt_idx" ON "crm_Targets"("deletedAt");

-- CreateIndex
CREATE INDEX "crm_TargetLists_created_by_idx" ON "crm_TargetLists"("created_by");

-- CreateIndex
CREATE INDEX "crm_TargetLists_status_idx" ON "crm_TargetLists"("status");

-- CreateIndex
CREATE INDEX "crm_TargetLists_deletedAt_idx" ON "crm_TargetLists"("deletedAt");

-- CreateIndex
CREATE INDEX "TargetsToTargetLists_target_id_idx" ON "TargetsToTargetLists"("target_id");

-- CreateIndex
CREATE INDEX "TargetsToTargetLists_target_list_id_idx" ON "TargetsToTargetLists"("target_list_id");

-- CreateIndex
CREATE UNIQUE INDEX "crm_Embeddings_Accounts_account_id_key" ON "crm_Embeddings_Accounts"("account_id");

-- CreateIndex
CREATE UNIQUE INDEX "crm_Embeddings_Contacts_contact_id_key" ON "crm_Embeddings_Contacts"("contact_id");

-- CreateIndex
CREATE UNIQUE INDEX "crm_Embeddings_Leads_lead_id_key" ON "crm_Embeddings_Leads"("lead_id");

-- CreateIndex
CREATE UNIQUE INDEX "crm_Embeddings_Opportunities_opportunity_id_key" ON "crm_Embeddings_Opportunities"("opportunity_id");

-- CreateIndex
CREATE UNIQUE INDEX "crm_Embeddings_Documents_document_id_key" ON "crm_Embeddings_Documents"("document_id");

-- CreateIndex
CREATE INDEX "crm_Document_Chunks_document_id_idx" ON "crm_Document_Chunks"("document_id");

-- CreateIndex
CREATE UNIQUE INDEX "ApiToken_tokenHash_key" ON "ApiToken"("tokenHash");

-- CreateIndex
CREATE INDEX "ApiToken_userId_idx" ON "ApiToken"("userId");

-- CreateIndex
CREATE INDEX "EmailAccount_userId_idx" ON "EmailAccount"("userId");

-- CreateIndex
CREATE INDEX "EmailAccount_isActive_idx" ON "EmailAccount"("isActive");

-- CreateIndex
CREATE INDEX "Email_userId_idx" ON "Email"("userId");

-- CreateIndex
CREATE INDEX "Email_emailAccountId_idx" ON "Email"("emailAccountId");

-- CreateIndex
CREATE INDEX "Email_folder_idx" ON "Email"("folder");

-- CreateIndex
CREATE INDEX "Email_isDeleted_idx" ON "Email"("isDeleted");

-- CreateIndex
CREATE INDEX "Email_sentAt_idx" ON "Email"("sentAt");

-- CreateIndex
CREATE INDEX "Email_userId_folder_isDeleted_isRead_idx" ON "Email"("userId", "folder", "isDeleted", "isRead");

-- CreateIndex
CREATE UNIQUE INDEX "Email_emailAccountId_rfcMessageId_key" ON "Email"("emailAccountId", "rfcMessageId");

-- CreateIndex
CREATE UNIQUE INDEX "EmailEmbedding_emailId_key" ON "EmailEmbedding"("emailId");

-- CreateIndex
CREATE INDEX "EmailsToContacts_emailId_idx" ON "EmailsToContacts"("emailId");

-- CreateIndex
CREATE INDEX "EmailsToContacts_contactId_idx" ON "EmailsToContacts"("contactId");

-- CreateIndex
CREATE INDEX "EmailsToAccounts_emailId_idx" ON "EmailsToAccounts"("emailId");

-- CreateIndex
CREATE INDEX "EmailsToAccounts_accountId_idx" ON "EmailsToAccounts"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE INDEX "crm_ProductCategories_isActive_idx" ON "crm_ProductCategories"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "crm_Products_sku_key" ON "crm_Products"("sku");

-- CreateIndex
CREATE INDEX "crm_Products_status_idx" ON "crm_Products"("status");

-- CreateIndex
CREATE INDEX "crm_Products_type_idx" ON "crm_Products"("type");

-- CreateIndex
CREATE INDEX "crm_Products_categoryId_idx" ON "crm_Products"("categoryId");

-- CreateIndex
CREATE INDEX "crm_Products_createdBy_idx" ON "crm_Products"("createdBy");

-- CreateIndex
CREATE INDEX "crm_Products_deletedAt_idx" ON "crm_Products"("deletedAt");

-- CreateIndex
CREATE INDEX "crm_AccountProducts_accountId_idx" ON "crm_AccountProducts"("accountId");

-- CreateIndex
CREATE INDEX "crm_AccountProducts_productId_idx" ON "crm_AccountProducts"("productId");

-- CreateIndex
CREATE INDEX "crm_AccountProducts_status_idx" ON "crm_AccountProducts"("status");

-- CreateIndex
CREATE INDEX "crm_AccountProducts_accountId_productId_idx" ON "crm_AccountProducts"("accountId", "productId");

-- CreateIndex
CREATE INDEX "crm_OpportunityLineItems_opportunityId_idx" ON "crm_OpportunityLineItems"("opportunityId");

-- CreateIndex
CREATE INDEX "crm_OpportunityLineItems_productId_idx" ON "crm_OpportunityLineItems"("productId");

-- CreateIndex
CREATE INDEX "crm_ContractLineItems_contractId_idx" ON "crm_ContractLineItems"("contractId");

-- CreateIndex
CREATE INDEX "crm_ContractLineItems_productId_idx" ON "crm_ContractLineItems"("productId");

-- CreateIndex
CREATE INDEX "Invoices_accountId_idx" ON "Invoices"("accountId");

-- CreateIndex
CREATE INDEX "Invoices_status_idx" ON "Invoices"("status");

-- CreateIndex
CREATE INDEX "Invoices_issueDate_idx" ON "Invoices"("issueDate");

-- CreateIndex
CREATE INDEX "Invoices_dueDate_idx" ON "Invoices"("dueDate");

-- CreateIndex
CREATE INDEX "Invoices_createdBy_idx" ON "Invoices"("createdBy");

-- CreateIndex
CREATE INDEX "Invoices_originalInvoiceId_idx" ON "Invoices"("originalInvoiceId");

-- CreateIndex
CREATE UNIQUE INDEX "Invoices_seriesId_number_key" ON "Invoices"("seriesId", "number");

-- CreateIndex
CREATE INDEX "Invoice_LineItems_invoiceId_idx" ON "Invoice_LineItems"("invoiceId");

-- CreateIndex
CREATE INDEX "Invoice_LineItems_productId_idx" ON "Invoice_LineItems"("productId");

-- CreateIndex
CREATE INDEX "Invoice_LineItems_taxRateId_idx" ON "Invoice_LineItems"("taxRateId");

-- CreateIndex
CREATE INDEX "Invoice_Payments_invoiceId_idx" ON "Invoice_Payments"("invoiceId");

-- CreateIndex
CREATE INDEX "Invoice_Attachments_invoiceId_idx" ON "Invoice_Attachments"("invoiceId");

-- CreateIndex
CREATE INDEX "Invoice_Activity_invoiceId_idx" ON "Invoice_Activity"("invoiceId");

-- CreateIndex
CREATE UNIQUE INDEX "PurchaseOrders_orderNumber_key" ON "PurchaseOrders"("orderNumber");

-- CreateIndex
CREATE INDEX "PurchaseOrders_vendorId_idx" ON "PurchaseOrders"("vendorId");

-- CreateIndex
CREATE INDEX "PurchaseOrders_status_idx" ON "PurchaseOrders"("status");

-- CreateIndex
CREATE INDEX "PurchaseOrders_orderDate_idx" ON "PurchaseOrders"("orderDate");

-- CreateIndex
CREATE INDEX "PurchaseOrders_createdBy_idx" ON "PurchaseOrders"("createdBy");

-- CreateIndex
CREATE INDEX "PurchaseOrders_deletedAt_idx" ON "PurchaseOrders"("deletedAt");

-- CreateIndex
CREATE INDEX "PurchaseOrderLineItems_purchaseOrderId_idx" ON "PurchaseOrderLineItems"("purchaseOrderId");

-- CreateIndex
CREATE INDEX "PurchaseOrderLineItems_productId_idx" ON "PurchaseOrderLineItems"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryWarehouse_code_key" ON "InventoryWarehouse"("code");

-- CreateIndex
CREATE INDEX "InventoryWarehouse_isActive_idx" ON "InventoryWarehouse"("isActive");

-- CreateIndex
CREATE INDEX "InventoryWarehouse_code_idx" ON "InventoryWarehouse"("code");

-- CreateIndex
CREATE INDEX "InventoryStock_productId_idx" ON "InventoryStock"("productId");

-- CreateIndex
CREATE INDEX "InventoryStock_warehouseId_idx" ON "InventoryStock"("warehouseId");

-- CreateIndex
CREATE INDEX "InventoryStock_quantity_idx" ON "InventoryStock"("quantity");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryStock_productId_warehouseId_key" ON "InventoryStock"("productId", "warehouseId");

-- CreateIndex
CREATE INDEX "InventoryMovement_productId_idx" ON "InventoryMovement"("productId");

-- CreateIndex
CREATE INDEX "InventoryMovement_warehouseId_idx" ON "InventoryMovement"("warehouseId");

-- CreateIndex
CREATE INDEX "InventoryMovement_createdAt_idx" ON "InventoryMovement"("createdAt");

-- CreateIndex
CREATE INDEX "InventoryMovement_type_idx" ON "InventoryMovement"("type");

-- CreateIndex
CREATE INDEX "ReorderThreshold_productId_idx" ON "ReorderThreshold"("productId");

-- CreateIndex
CREATE INDEX "ReorderThreshold_warehouseId_idx" ON "ReorderThreshold"("warehouseId");

-- CreateIndex
CREATE INDEX "ReorderThreshold_reorderPoint_idx" ON "ReorderThreshold"("reorderPoint");

-- CreateIndex
CREATE UNIQUE INDEX "ReorderThreshold_productId_warehouseId_key" ON "ReorderThreshold"("productId", "warehouseId");

-- CreateIndex
CREATE UNIQUE INDEX "FeedbackTicket_ticketRef_key" ON "FeedbackTicket"("ticketRef");

-- CreateIndex
CREATE INDEX "FeedbackTicket_userId_idx" ON "FeedbackTicket"("userId");

-- CreateIndex
CREATE INDEX "FeedbackTicket_status_idx" ON "FeedbackTicket"("status");

-- CreateIndex
CREATE INDEX "FeedbackTicket_createdAt_idx" ON "FeedbackTicket"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "crm_Industry_Templates_slug_key" ON "crm_Industry_Templates"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "crm_Tenant_Subscriptions_tenantId_key" ON "crm_Tenant_Subscriptions"("tenantId");

-- AddForeignKey
ALTER TABLE "crm_Accounts" ADD CONSTRAINT "crm_Accounts_industry_fkey" FOREIGN KEY ("industry") REFERENCES "crm_Industry_Type"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_Accounts" ADD CONSTRAINT "crm_Accounts_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_Leads" ADD CONSTRAINT "crm_Leads_lead_source_id_fkey" FOREIGN KEY ("lead_source_id") REFERENCES "crm_Lead_Sources"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_Leads" ADD CONSTRAINT "crm_Leads_lead_status_id_fkey" FOREIGN KEY ("lead_status_id") REFERENCES "crm_Lead_Statuses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_Leads" ADD CONSTRAINT "crm_Leads_lead_type_id_fkey" FOREIGN KEY ("lead_type_id") REFERENCES "crm_Lead_Types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_Leads" ADD CONSTRAINT "crm_Leads_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_Leads" ADD CONSTRAINT "crm_Leads_accountsIDs_fkey" FOREIGN KEY ("accountsIDs") REFERENCES "crm_Accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_Contact_Enrichment" ADD CONSTRAINT "crm_Contact_Enrichment_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "crm_Contacts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_Contact_Enrichment" ADD CONSTRAINT "crm_Contact_Enrichment_triggeredBy_fkey" FOREIGN KEY ("triggeredBy") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_Target_Enrichment" ADD CONSTRAINT "crm_Target_Enrichment_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "crm_Targets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_Target_Enrichment" ADD CONSTRAINT "crm_Target_Enrichment_triggeredBy_fkey" FOREIGN KEY ("triggeredBy") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_Target_Contact" ADD CONSTRAINT "crm_Target_Contact_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "crm_Targets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_Target_Contact" ADD CONSTRAINT "crm_Target_Contact_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "crm_Contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_Opportunities" ADD CONSTRAINT "crm_Opportunities_type_fkey" FOREIGN KEY ("type") REFERENCES "crm_Opportunities_Type"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_Opportunities" ADD CONSTRAINT "crm_Opportunities_sales_stage_fkey" FOREIGN KEY ("sales_stage") REFERENCES "crm_Opportunities_Sales_Stages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_Opportunities" ADD CONSTRAINT "crm_Opportunities_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_Opportunities" ADD CONSTRAINT "crm_Opportunities_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_Opportunities" ADD CONSTRAINT "crm_Opportunities_account_fkey" FOREIGN KEY ("account") REFERENCES "crm_Accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_Opportunities" ADD CONSTRAINT "crm_Opportunities_campaign_fkey" FOREIGN KEY ("campaign") REFERENCES "crm_campaigns"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_Opportunities" ADD CONSTRAINT "crm_Opportunities_currency_fkey" FOREIGN KEY ("currency") REFERENCES "Currency"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_campaigns" ADD CONSTRAINT "crm_campaigns_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "crm_campaign_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_campaigns" ADD CONSTRAINT "crm_campaigns_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_campaign_templates" ADD CONSTRAINT "crm_campaign_templates_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_campaign_steps" ADD CONSTRAINT "crm_campaign_steps_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "crm_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_campaign_steps" ADD CONSTRAINT "crm_campaign_steps_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "crm_campaign_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignToTargetLists" ADD CONSTRAINT "CampaignToTargetLists_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "crm_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignToTargetLists" ADD CONSTRAINT "CampaignToTargetLists_target_list_id_fkey" FOREIGN KEY ("target_list_id") REFERENCES "crm_TargetLists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_campaign_sends" ADD CONSTRAINT "crm_campaign_sends_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "crm_campaigns"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_campaign_sends" ADD CONSTRAINT "crm_campaign_sends_step_id_fkey" FOREIGN KEY ("step_id") REFERENCES "crm_campaign_steps"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_campaign_sends" ADD CONSTRAINT "crm_campaign_sends_target_id_fkey" FOREIGN KEY ("target_id") REFERENCES "crm_Targets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_Contacts" ADD CONSTRAINT "crm_Contacts_contact_type_id_fkey" FOREIGN KEY ("contact_type_id") REFERENCES "crm_Contact_Types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_Contacts" ADD CONSTRAINT "crm_Contacts_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_Contacts" ADD CONSTRAINT "crm_Contacts_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_Contacts" ADD CONSTRAINT "crm_Contacts_accountsIDs_fkey" FOREIGN KEY ("accountsIDs") REFERENCES "crm_Accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_Contracts" ADD CONSTRAINT "crm_Contracts_account_fkey" FOREIGN KEY ("account") REFERENCES "crm_Accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_Contracts" ADD CONSTRAINT "crm_Contracts_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_Contracts" ADD CONSTRAINT "crm_Contracts_currency_fkey" FOREIGN KEY ("currency") REFERENCES "Currency"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExchangeRate" ADD CONSTRAINT "ExchangeRate_fromCurrency_fkey" FOREIGN KEY ("fromCurrency") REFERENCES "Currency"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExchangeRate" ADD CONSTRAINT "ExchangeRate_toCurrency_fkey" FOREIGN KEY ("toCurrency") REFERENCES "Currency"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_Activities" ADD CONSTRAINT "crm_Activities_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_Activities" ADD CONSTRAINT "crm_Activities_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_ActivityLinks" ADD CONSTRAINT "crm_ActivityLinks_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "crm_Activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Boards" ADD CONSTRAINT "Boards_user_fkey" FOREIGN KEY ("user") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Documents" ADD CONSTRAINT "Documents_created_by_user_fkey" FOREIGN KEY ("created_by_user") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Documents" ADD CONSTRAINT "Documents_assigned_user_fkey" FOREIGN KEY ("assigned_user") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Documents" ADD CONSTRAINT "Documents_document_type_fkey" FOREIGN KEY ("document_type") REFERENCES "Documents_Types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Documents" ADD CONSTRAINT "Documents_parent_document_id_fkey" FOREIGN KEY ("parent_document_id") REFERENCES "Documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sections" ADD CONSTRAINT "Sections_board_fkey" FOREIGN KEY ("board") REFERENCES "Boards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tasks" ADD CONSTRAINT "Tasks_user_fkey" FOREIGN KEY ("user") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tasks" ADD CONSTRAINT "Tasks_section_fkey" FOREIGN KEY ("section") REFERENCES "Sections"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_Accounts_Tasks" ADD CONSTRAINT "crm_Accounts_Tasks_user_fkey" FOREIGN KEY ("user") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_Accounts_Tasks" ADD CONSTRAINT "crm_Accounts_Tasks_account_fkey" FOREIGN KEY ("account") REFERENCES "crm_Accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasksComments" ADD CONSTRAINT "tasksComments_assigned_crm_account_task_fkey" FOREIGN KEY ("assigned_crm_account_task") REFERENCES "crm_Accounts_Tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasksComments" ADD CONSTRAINT "tasksComments_task_fkey" FOREIGN KEY ("task") REFERENCES "Tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasksComments" ADD CONSTRAINT "tasksComments_user_fkey" FOREIGN KEY ("user") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_AuditLog" ADD CONSTRAINT "crm_AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_Report_Config" ADD CONSTRAINT "crm_Report_Config_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_Report_Schedule" ADD CONSTRAINT "crm_Report_Schedule_reportConfigId_fkey" FOREIGN KEY ("reportConfigId") REFERENCES "crm_Report_Config"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_Report_Schedule" ADD CONSTRAINT "crm_Report_Schedule_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiKeys" ADD CONSTRAINT "ApiKeys_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentsToOpportunities" ADD CONSTRAINT "DocumentsToOpportunities_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "Documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentsToOpportunities" ADD CONSTRAINT "DocumentsToOpportunities_opportunity_id_fkey" FOREIGN KEY ("opportunity_id") REFERENCES "crm_Opportunities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentsToContacts" ADD CONSTRAINT "DocumentsToContacts_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "Documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentsToContacts" ADD CONSTRAINT "DocumentsToContacts_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "crm_Contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentsToTasks" ADD CONSTRAINT "DocumentsToTasks_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "Documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentsToTasks" ADD CONSTRAINT "DocumentsToTasks_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "Tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentsToCrmAccountsTasks" ADD CONSTRAINT "DocumentsToCrmAccountsTasks_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "Documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentsToCrmAccountsTasks" ADD CONSTRAINT "DocumentsToCrmAccountsTasks_crm_accounts_task_id_fkey" FOREIGN KEY ("crm_accounts_task_id") REFERENCES "crm_Accounts_Tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentsToLeads" ADD CONSTRAINT "DocumentsToLeads_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "Documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentsToLeads" ADD CONSTRAINT "DocumentsToLeads_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "crm_Leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentsToAccounts" ADD CONSTRAINT "DocumentsToAccounts_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "Documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentsToAccounts" ADD CONSTRAINT "DocumentsToAccounts_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "crm_Accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountWatchers" ADD CONSTRAINT "AccountWatchers_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "crm_Accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountWatchers" ADD CONSTRAINT "AccountWatchers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoardWatchers" ADD CONSTRAINT "BoardWatchers_board_id_fkey" FOREIGN KEY ("board_id") REFERENCES "Boards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoardWatchers" ADD CONSTRAINT "BoardWatchers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactsToOpportunities" ADD CONSTRAINT "ContactsToOpportunities_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "crm_Contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactsToOpportunities" ADD CONSTRAINT "ContactsToOpportunities_opportunity_id_fkey" FOREIGN KEY ("opportunity_id") REFERENCES "crm_Opportunities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_Targets" ADD CONSTRAINT "crm_Targets_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_Targets" ADD CONSTRAINT "crm_Targets_converted_account_id_fkey" FOREIGN KEY ("converted_account_id") REFERENCES "crm_Accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_Targets" ADD CONSTRAINT "crm_Targets_converted_contact_id_fkey" FOREIGN KEY ("converted_contact_id") REFERENCES "crm_Contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_TargetLists" ADD CONSTRAINT "crm_TargetLists_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TargetsToTargetLists" ADD CONSTRAINT "TargetsToTargetLists_target_id_fkey" FOREIGN KEY ("target_id") REFERENCES "crm_Targets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TargetsToTargetLists" ADD CONSTRAINT "TargetsToTargetLists_target_list_id_fkey" FOREIGN KEY ("target_list_id") REFERENCES "crm_TargetLists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_Embeddings_Accounts" ADD CONSTRAINT "crm_Embeddings_Accounts_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "crm_Accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_Embeddings_Contacts" ADD CONSTRAINT "crm_Embeddings_Contacts_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "crm_Contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_Embeddings_Leads" ADD CONSTRAINT "crm_Embeddings_Leads_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "crm_Leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_Embeddings_Opportunities" ADD CONSTRAINT "crm_Embeddings_Opportunities_opportunity_id_fkey" FOREIGN KEY ("opportunity_id") REFERENCES "crm_Opportunities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_Embeddings_Documents" ADD CONSTRAINT "crm_Embeddings_Documents_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "Documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_Document_Chunks" ADD CONSTRAINT "crm_Document_Chunks_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "Documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiToken" ADD CONSTRAINT "ApiToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailAccount" ADD CONSTRAINT "EmailAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Email" ADD CONSTRAINT "Email_emailAccountId_fkey" FOREIGN KEY ("emailAccountId") REFERENCES "EmailAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Email" ADD CONSTRAINT "Email_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailEmbedding" ADD CONSTRAINT "EmailEmbedding_emailId_fkey" FOREIGN KEY ("emailId") REFERENCES "Email"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailsToContacts" ADD CONSTRAINT "EmailsToContacts_emailId_fkey" FOREIGN KEY ("emailId") REFERENCES "Email"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailsToContacts" ADD CONSTRAINT "EmailsToContacts_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "crm_Contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailsToAccounts" ADD CONSTRAINT "EmailsToAccounts_emailId_fkey" FOREIGN KEY ("emailId") REFERENCES "Email"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailsToAccounts" ADD CONSTRAINT "EmailsToAccounts_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "crm_Accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_Products" ADD CONSTRAINT "crm_Products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "crm_ProductCategories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_Products" ADD CONSTRAINT "crm_Products_currency_fkey" FOREIGN KEY ("currency") REFERENCES "Currency"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_Products" ADD CONSTRAINT "crm_Products_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_AccountProducts" ADD CONSTRAINT "crm_AccountProducts_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "crm_Accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_AccountProducts" ADD CONSTRAINT "crm_AccountProducts_productId_fkey" FOREIGN KEY ("productId") REFERENCES "crm_Products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_AccountProducts" ADD CONSTRAINT "crm_AccountProducts_currency_fkey" FOREIGN KEY ("currency") REFERENCES "Currency"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_OpportunityLineItems" ADD CONSTRAINT "crm_OpportunityLineItems_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "crm_Opportunities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_OpportunityLineItems" ADD CONSTRAINT "crm_OpportunityLineItems_productId_fkey" FOREIGN KEY ("productId") REFERENCES "crm_Products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_ContractLineItems" ADD CONSTRAINT "crm_ContractLineItems_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "crm_Contracts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_ContractLineItems" ADD CONSTRAINT "crm_ContractLineItems_productId_fkey" FOREIGN KEY ("productId") REFERENCES "crm_Products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoices" ADD CONSTRAINT "Invoices_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoices" ADD CONSTRAINT "Invoices_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "Invoice_Series"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoices" ADD CONSTRAINT "Invoices_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "crm_Accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoices" ADD CONSTRAINT "Invoices_currency_fkey" FOREIGN KEY ("currency") REFERENCES "Currency"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoices" ADD CONSTRAINT "Invoices_originalInvoiceId_fkey" FOREIGN KEY ("originalInvoiceId") REFERENCES "Invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice_LineItems" ADD CONSTRAINT "Invoice_LineItems_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice_LineItems" ADD CONSTRAINT "Invoice_LineItems_productId_fkey" FOREIGN KEY ("productId") REFERENCES "crm_Products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice_LineItems" ADD CONSTRAINT "Invoice_LineItems_taxRateId_fkey" FOREIGN KEY ("taxRateId") REFERENCES "Invoice_TaxRates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice_Payments" ADD CONSTRAINT "Invoice_Payments_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice_Payments" ADD CONSTRAINT "Invoice_Payments_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice_Attachments" ADD CONSTRAINT "Invoice_Attachments_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice_Attachments" ADD CONSTRAINT "Invoice_Attachments_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice_Activity" ADD CONSTRAINT "Invoice_Activity_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice_Activity" ADD CONSTRAINT "Invoice_Activity_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice_Settings" ADD CONSTRAINT "Invoice_Settings_defaultSeriesId_fkey" FOREIGN KEY ("defaultSeriesId") REFERENCES "Invoice_Series"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice_Settings" ADD CONSTRAINT "Invoice_Settings_defaultTaxRateId_fkey" FOREIGN KEY ("defaultTaxRateId") REFERENCES "Invoice_TaxRates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrders" ADD CONSTRAINT "PurchaseOrders_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "crm_Accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrders" ADD CONSTRAINT "PurchaseOrders_currency_fkey" FOREIGN KEY ("currency") REFERENCES "Currency"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrders" ADD CONSTRAINT "PurchaseOrders_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrders" ADD CONSTRAINT "PurchaseOrders_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrders" ADD CONSTRAINT "PurchaseOrders_requestedBy_fkey" FOREIGN KEY ("requestedBy") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrders" ADD CONSTRAINT "PurchaseOrders_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrderLineItems" ADD CONSTRAINT "PurchaseOrderLineItems_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "PurchaseOrders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrderLineItems" ADD CONSTRAINT "PurchaseOrderLineItems_productId_fkey" FOREIGN KEY ("productId") REFERENCES "crm_Products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryWarehouse" ADD CONSTRAINT "InventoryWarehouse_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryWarehouse" ADD CONSTRAINT "InventoryWarehouse_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryStock" ADD CONSTRAINT "InventoryStock_productId_fkey" FOREIGN KEY ("productId") REFERENCES "crm_Products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryStock" ADD CONSTRAINT "InventoryStock_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "InventoryWarehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryMovement" ADD CONSTRAINT "InventoryMovement_productId_fkey" FOREIGN KEY ("productId") REFERENCES "crm_Products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryMovement" ADD CONSTRAINT "InventoryMovement_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "InventoryWarehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryMovement" ADD CONSTRAINT "InventoryMovement_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReorderThreshold" ADD CONSTRAINT "ReorderThreshold_productId_fkey" FOREIGN KEY ("productId") REFERENCES "crm_Products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReorderThreshold" ADD CONSTRAINT "ReorderThreshold_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "InventoryWarehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedbackTicket" ADD CONSTRAINT "FeedbackTicket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedbackTicket" ADD CONSTRAINT "FeedbackTicket_respondedBy_fkey" FOREIGN KEY ("respondedBy") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

