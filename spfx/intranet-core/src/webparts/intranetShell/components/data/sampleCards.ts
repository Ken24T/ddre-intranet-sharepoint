import type { IFunctionCard } from '../FunctionCard';

/**
 * Sample function cards for each hub.
 * In production, this would come from SharePoint lists or configuration.
 */
export const sampleCards: IFunctionCard[] = [
  // Home Hub
  {
    id: 'quick-links',
    hubKey: 'home',
    title: 'Quick Links',
    description: 'Access frequently used resources and tools',
    icon: 'Link',
  },
  {
    id: 'announcements',
    hubKey: 'home',
    title: 'Announcements',
    description: 'Latest company news and updates',
    icon: 'Megaphone',
  },
  {
    id: 'my-tasks',
    hubKey: 'home',
    title: 'My Tasks',
    description: 'View and manage your assigned tasks',
    icon: 'CheckList',
  },
  {
    id: 'forms',
    hubKey: 'home',
    title: 'Forms',
    description: 'Access Cognito Forms library for requests and submissions',
    icon: 'PageList',
  },
  {
    id: 'qr-code-creator',
    hubKey: 'home',
    title: 'QR Code Creator',
    description: 'Generate QR codes for links, text, and more',
    icon: 'QRCode',
  },

  // Administration Hub
  {
    id: 'user-management',
    hubKey: 'administration',
    title: 'User Management',
    description: 'Manage user accounts and permissions',
    icon: 'People',
  },
  {
    id: 'system-settings',
    hubKey: 'administration',
    title: 'System Settings',
    description: 'Configure system-wide settings',
    icon: 'Settings',
  },
  {
    id: 'audit-logs',
    hubKey: 'administration',
    title: 'Audit Logs',
    description: 'View system audit trail and activity logs',
    icon: 'ComplianceAudit',
  },
  {
    id: 'surveys',
    hubKey: 'administration',
    title: 'Surveys',
    description: 'Owner, Tenant, Contractor and Staff annual surveys',
    icon: 'Questionnaire',
  },

  // Office Hub
  {
    id: 'staff-directory',
    hubKey: 'office',
    title: 'Staff Directory',
    description: 'Find contact information for team members',
    icon: 'ContactCard',
  },
  {
    id: 'meeting-rooms',
    hubKey: 'office',
    title: 'Meeting Rooms',
    description: 'Book meeting rooms and resources',
    icon: 'Room',
  },
  {
    id: 'leave-requests',
    hubKey: 'office',
    title: 'Leave Requests',
    description: 'Submit and track leave applications',
    icon: 'Calendar',
  },
  {
    id: 'expense-claims',
    hubKey: 'office',
    title: 'Expense Claims',
    description: 'Submit expense reports for reimbursement',
    icon: 'Money',
  },
  {
    id: 'staff-availability',
    hubKey: 'office',
    title: 'Staff Availability',
    description: 'View rosters, office days and team schedules',
    icon: 'ScheduleEventAction',
  },

  // Property Management Hub
  {
    id: 'propertyme',
    hubKey: 'property-management',
    title: 'PropertyMe',
    description: 'Access PropertyMe property management system',
    icon: 'CityNext',
    url: 'https://app.propertyme.com',
    openInNewTab: true,
  },
  {
    id: 'vault',
    hubKey: 'sales',
    title: 'Vault',
    description: 'Secure document storage and management',
    icon: 'Lock',
  },
  {
    id: 'maintenance-requests',
    hubKey: 'property-management',
    title: 'Maintenance Requests',
    description: 'Track and manage property maintenance',
    icon: 'Repair',
  },
  {
    id: 'inspections',
    hubKey: 'property-management',
    title: 'Inspections',
    description: 'Schedule and review property inspections',
    icon: 'Checklist',
  },
  {
    id: 'pm-reports',
    hubKey: 'property-management',
    title: 'Reports',
    description: 'Property management reports and analytics',
    icon: 'ReportDocument',
  },
  {
    id: 'pm-dashboard',
    hubKey: 'property-management',
    title: 'PM Dashboard',
    description: 'Entries and Vacates Dashboard',
    icon: 'ViewDashboard',
  },

  // Sales Hub
  {
    id: 'listings',
    hubKey: 'sales',
    title: 'Listings',
    description: 'Manage property listings and campaigns',
    icon: 'Home',
  },
  {
    id: 'leads',
    hubKey: 'sales',
    title: 'Leads',
    description: 'Track and manage sales leads',
    icon: 'ContactList',
  },
  {
    id: 'sales-reports',
    hubKey: 'sales',
    title: 'Sales Reports',
    description: 'View sales performance and metrics',
    icon: 'BarChartVertical',
  },
  {
    id: 'commissions',
    hubKey: 'sales',
    title: 'Commissions',
    description: 'Track sales commissions and payouts',
    icon: 'Money',
  },

  // Document Library (shown on library hub)
  {
    id: 'templates',
    hubKey: 'library',
    title: 'Templates',
    description: 'Document templates and forms',
    icon: 'DocumentSet',
  },
  {
    id: 'policies',
    hubKey: 'library',
    title: 'Policies & Procedures',
    description: 'Company policies and procedure documents',
    icon: 'Library',
  },
  {
    id: 'contracts',
    hubKey: 'library',
    title: 'Contracts',
    description: 'Contract templates and agreements',
    icon: 'PageEdit',
  },
];

/**
 * Hub metadata with titles and descriptions.
 */
export const hubInfo: Record<string, { title: string; description: string }> = {
  home: {
    title: 'Home',
    description: 'Your personalized dashboard',
  },
  library: {
    title: 'Document Library',
    description: 'Access documents, templates, and resources',
  },
  administration: {
    title: 'Administration',
    description: 'Office processes, staff support, and business operations',
  },
  office: {
    title: 'Office',
    description: 'Office operations and staff resources',
  },
  'property-management': {
    title: 'Property Management',
    description: 'Property management tools and systems',
  },
  sales: {
    title: 'Sales',
    description: 'Sales tools and performance tracking',
  },
};
