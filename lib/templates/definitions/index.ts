export interface IndustryTemplateDef {
  id: string;
  name: string;
  slug: string;
  industry: string;
  description: string;
  icon: string;
  features: string[];
  enabledModules: Record<string, boolean>;
  crmCustomFields: any[];
  whatsappTemplates: any[];
}

export const industryTemplates: IndustryTemplateDef[] = [
  {
    id: "real-estate",
    name: "Real Estate CRM",
    slug: "real-estate",
    industry: "Real Estate",
    description: "Tailored for property management, realtors, and agencies.",
    icon: "Building",
    features: ["Property Listings", "Lead Matching", "Contract Management"],
    enabledModules: {
      accounts: true,
      opportunities: true,
      contacts: true,
      leads: true,
      contracts: true,
      products: true,
      targets: false,
      inventory: false,
      purchaseOrders: false,
    },
    crmCustomFields: [
      { name: "Property Type", type: "string" },
      { name: "Budget", type: "number" },
      { name: "Location Preference", type: "string" },
    ],
    whatsappTemplates: [
      { name: "property_inquiry_reply", language: "en", status: "APPROVED" },
      { name: "property_inquiry_reply_ar", language: "ar", status: "APPROVED" },
    ],
  },
  {
    id: "smb",
    name: "Small Business (SMB)",
    slug: "smb",
    industry: "SMB",
    description: "General purpose CRM for small to medium businesses.",
    icon: "Briefcase",
    features: ["Sales Pipeline", "Invoicing", "Customer Support"],
    enabledModules: {
      accounts: true,
      opportunities: true,
      contacts: true,
      leads: true,
      contracts: false,
      products: true,
      targets: true,
      inventory: true,
      purchaseOrders: true,
    },
    crmCustomFields: [],
    whatsappTemplates: [
      { name: "welcome_message", language: "en", status: "APPROVED" },
      { name: "welcome_message_ar", language: "ar", status: "APPROVED" },
    ],
  },
  {
    id: "clinic",
    name: "Clinic Management",
    slug: "clinic",
    industry: "Healthcare",
    description: "Manage patients, appointments, and medical records.",
    icon: "Stethoscope",
    features: ["Patient Records", "Appointment Scheduling", "Prescription Tracking"],
    enabledModules: {
      accounts: false,
      opportunities: false,
      contacts: true, // Used for patients
      leads: false,
      contracts: false,
      products: false,
      targets: false,
      inventory: true,
      purchaseOrders: true,
    },
    crmCustomFields: [
      { name: "Medical History", type: "text" },
      { name: "Allergies", type: "text" },
      { name: "Next Appointment", type: "date" },
    ],
    whatsappTemplates: [
      { name: "appointment_reminder", language: "en", status: "APPROVED" },
      { name: "appointment_reminder_ar", language: "ar", status: "APPROVED" },
    ],
  },
  {
    id: "hardware-trading",
    name: "Hardware & Tools Trading",
    slug: "hardware-trading",
    industry: "Retail / Trading",
    description: "Inventory tracking, wholesale pricing, and supplier management.",
    icon: "Wrench",
    features: ["Inventory Management", "B2B Sales", "Purchase Orders"],
    enabledModules: {
      accounts: true, // Suppliers and B2B clients
      opportunities: true,
      contacts: true,
      leads: true,
      contracts: true,
      products: true, // Tools and hardware
      targets: false,
      inventory: true,
      purchaseOrders: true,
    },
    crmCustomFields: [
      { name: "SKU", type: "string" },
      { name: "Wholesale Price", type: "number" },
    ],
    whatsappTemplates: [
      { name: "order_confirmation", language: "en", status: "APPROVED" },
      { name: "order_confirmation_ar", language: "ar", status: "APPROVED" },
    ],
  },
  {
    id: "car-rental",
    name: "Car Rentals",
    slug: "car-rental",
    industry: "Automotive / Rental",
    description: "Fleet management, bookings, and customer agreements.",
    icon: "Car",
    features: ["Fleet Tracking", "Booking System", "Damage Reports"],
    enabledModules: {
      accounts: false,
      opportunities: true, // Bookings
      contacts: true, // Renters
      leads: true,
      contracts: true, // Rental agreements
      products: true, // Vehicles
      targets: false,
      inventory: false,
      purchaseOrders: false,
    },
    crmCustomFields: [
      { name: "License Plate", type: "string" },
      { name: "Vehicle Model", type: "string" },
      { name: "Rental Start Date", type: "date" },
      { name: "Rental End Date", type: "date" },
    ],
    whatsappTemplates: [
      { name: "booking_confirmation", language: "en", status: "APPROVED" },
      { name: "booking_confirmation_ar", language: "ar", status: "APPROVED" },
      { name: "vehicle_return_reminder", language: "en", status: "APPROVED" },
      { name: "vehicle_return_reminder_ar", language: "ar", status: "APPROVED" },
    ],
  },
  {
    id: "hospitality",
    name: "Hospitality & Tourism CRM",
    slug: "hospitality",
    industry: "Hospitality",
    description: "Perfect for hotels, travel agencies, and luxury tours.",
    icon: "Hotel",
    features: ["Guest Profiles", "Booking Pipeline", "Activity Scheduling"],
    enabledModules: {
      accounts: true,
      opportunities: true,
      contacts: true,
      leads: true,
      contracts: true,
      products: true,
      targets: false,
      inventory: true,
      purchaseOrders: false,
    },
    crmCustomFields: [
      { name: "Room Preference", type: "string" },
      { name: "Travel Date", type: "date" },
    ],
    whatsappTemplates: [
      { name: "guest_welcome", language: "en", status: "APPROVED" },
      { name: "guest_welcome_ar", language: "ar", status: "APPROVED" },
      { name: "booking_details", language: "en", status: "APPROVED" },
      { name: "booking_details_ar", language: "ar", status: "APPROVED" },
    ],
  },
  {
    id: "construction",
    name: "Construction & Contracting CRM",
    slug: "construction",
    industry: "Construction",
    description: "Built for contractor coordination, project bidding, and raw material logistics.",
    icon: "Hammer",
    features: ["Subcontractor Tracking", "Bidding Pipeline", "Equipment Logs"],
    enabledModules: {
      accounts: true,
      opportunities: true,
      contacts: true,
      leads: true,
      contracts: true,
      products: true,
      targets: true,
      inventory: true,
      purchaseOrders: true,
    },
    crmCustomFields: [
      { name: "Project Phase", type: "string" },
      { name: "Subcontractor Rate", type: "number" },
    ],
    whatsappTemplates: [
      { name: "project_status_update", language: "en", status: "APPROVED" },
      { name: "project_status_update_ar", language: "ar", status: "APPROVED" },
    ],
  },
  {
    id: "education",
    name: "Education & Training CRM",
    slug: "education",
    industry: "Education",
    description: "Empower schools, academies, and training centers with student profiles, course sales, and schedules.",
    icon: "GraduationCap",
    features: ["Student Enrollment", "Course Sales", "Instructor Scheduling"],
    enabledModules: {
      accounts: true,
      opportunities: true,
      contacts: true,
      leads: true,
      contracts: false,
      products: true,
      targets: false,
      inventory: false,
      purchaseOrders: false,
    },
    crmCustomFields: [
      { name: "Course Selected", type: "string" },
      { name: "Grade Level", type: "string" },
    ],
    whatsappTemplates: [
      { name: "enrollment_confirm", language: "en", status: "APPROVED" },
      { name: "enrollment_confirm_ar", language: "ar", status: "APPROVED" },
    ],
  },
  {
    id: "legal-consulting",
    name: "Legal & Consulting CRM",
    slug: "legal-consulting",
    industry: "Legal / Consulting",
    description: "Strict client confidentiality, case files tracking, and hourly timesheet billing.",
    icon: "Scale",
    features: ["Case Management", "Client Confidentiality", "Timesheet Billing"],
    enabledModules: {
      accounts: true,
      opportunities: true,
      contacts: true,
      leads: true,
      contracts: true,
      products: true,
      targets: false,
      inventory: false,
      purchaseOrders: false,
    },
    crmCustomFields: [
      { name: "Case Reference Number", type: "string" },
      { name: "Billing Rate", type: "number" },
    ],
    whatsappTemplates: [
      { name: "case_update", language: "en", status: "APPROVED" },
      { name: "case_update_ar", language: "ar", status: "APPROVED" },
    ],
  },
  {
    id: "energy",
    name: "Oil, Gas & Energy CRM",
    slug: "energy",
    industry: "Energy",
    description: "Designed for supply-chain logistics, regional compliance, and large energy enterprise bids.",
    icon: "Flame",
    features: ["Bid & Tender Pipeline", "Logistics Milestones", "Compliance Checklists"],
    enabledModules: {
      accounts: true,
      opportunities: true,
      contacts: true,
      leads: true,
      contracts: true,
      products: true,
      targets: true,
      inventory: true,
      purchaseOrders: true,
    },
    crmCustomFields: [
      { name: "Rig Location", type: "string" },
      { name: "Tender Deadline", type: "date" },
    ],
    whatsappTemplates: [
      { name: "tender_bid_alert", language: "en", status: "APPROVED" },
      { name: "tender_bid_alert_ar", language: "ar", status: "APPROVED" },
    ],
  },
];
