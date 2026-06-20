export type Role = 'Admin' | 'Manager' | 'Employee';
export type ArticleStatus = 'Draft' | 'Published' | 'Archived';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar: string;
}

export interface Category {
  id: string;
  name: string;
  parentId?: string;
  icon: string;
  color: string;
  articleCount: number;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  categoryId: string;
  tags: string[];
  authorId: string;
  status: ArticleStatus;
  visibility: 'Company' | 'Managers' | 'Private';
  createdAt: string;
  updatedAt: string;
  views: number;
  favorite: boolean;
}

export interface Activity {
  id: string;
  userId: string;
  action: string;
  target: string;
  timestamp: string;
}

export interface Version {
  id: string;
  articleId: string;
  version: number;
  authorId: string;
  timestamp: string;
  summary: string;
}

export const users: User[] = [
  { id: 'u1', name: 'Aryan Barde', email: 'aryan@nexus.local', role: 'Admin', avatar: 'AB' },
  { id: 'u2', name: 'Priya Shah', email: 'priya@nexus.local', role: 'Manager', avatar: 'PS' },
  { id: 'u3', name: 'Virat Kohli', email: 'virat.kohli@rcb.com', role: 'Employee', avatar: 'VK' }
];

export const categories: Category[] = [
  { id: 'hr', name: 'HR Policies', icon: 'Users', color: '#2563eb', articleCount: 18 },
  { id: 'leave', name: 'Leave Policies', parentId: 'hr', icon: 'CalendarDays', color: '#2563eb', articleCount: 5 },
  { id: 'attendance', name: 'Attendance', parentId: 'hr', icon: 'Clock3', color: '#2563eb', articleCount: 4 },
  { id: 'payroll', name: 'Payroll', parentId: 'hr', icon: 'BadgeDollarSign', color: '#2563eb', articleCount: 6 },
  { id: 'sops', name: 'SOPs', icon: 'ClipboardList', color: '#059669', articleCount: 24 },
  { id: 'onboarding', name: 'Onboarding Guides', icon: 'Route', color: '#7c3aed', articleCount: 11 },
  { id: 'it', name: 'IT Documentation', icon: 'MonitorCog', color: '#0891b2', articleCount: 15 },
  { id: 'training', name: 'Training Materials', icon: 'GraduationCap', color: '#ca8a04', articleCount: 9 },
  { id: 'engineering', name: 'Engineering Docs', icon: 'Braces', color: '#dc2626', articleCount: 20 },
  { id: 'backend', name: 'Backend', parentId: 'engineering', icon: 'Server', color: '#dc2626', articleCount: 8 },
  { id: 'frontend', name: 'Frontend', parentId: 'engineering', icon: 'PanelsTopLeft', color: '#dc2626', articleCount: 7 },
  { id: 'devops', name: 'DevOps', parentId: 'engineering', icon: 'CloudCog', color: '#dc2626', articleCount: 5 },
  { id: 'finance', name: 'Finance Procedures', icon: 'ReceiptText', color: '#16a34a', articleCount: 13 },
  { id: 'support', name: 'Customer Support Guides', icon: 'Headphones', color: '#ea580c', articleCount: 10 }
];

export const tags = ['SOP', 'HR', 'IT', 'Finance', 'Security', 'Onboarding', 'Engineering', 'Support', 'Training'];

export const articles: Article[] = [
  {
    id: 'a1',
    title: 'Employee Onboarding Guide',
    slug: 'employee-onboarding-guide',
    content: '<h1>Employee Onboarding Guide</h1><p>Use this guide to set up new joiners across HR, IT, payroll, and department handover.</p><ul><li>Create employee profile</li><li>Assign Nexus ERP role</li><li>Schedule manager intro</li></ul>',
    categoryId: 'onboarding',
    tags: ['Onboarding', 'HR', 'IT'],
    authorId: 'u1',
    status: 'Published',
    visibility: 'Company',
    createdAt: '2026-02-12T09:00:00.000Z',
    updatedAt: '2026-06-18T10:30:00.000Z',
    views: 1840,
    favorite: true
  },
  {
    id: 'a2',
    title: 'Leave Approval Workflow',
    slug: 'leave-approval-workflow',
    content: '<h1>Leave Approval Workflow</h1><p>Employees request leave in Nexus HR. Managers review balance, staffing impact, and payroll cutoff.</p>',
    categoryId: 'leave',
    tags: ['HR', 'SOP'],
    authorId: 'u2',
    status: 'Published',
    visibility: 'Company',
    createdAt: '2026-03-04T09:00:00.000Z',
    updatedAt: '2026-06-16T14:15:00.000Z',
    views: 1390,
    favorite: false
  },
  {
    id: 'a3',
    title: 'Purchase Order Creation SOP',
    slug: 'purchase-order-creation-sop',
    content: '<h1>Purchase Order Creation SOP</h1><p>Finance and procurement teams create purchase orders after vendor validation and budget approval.</p><blockquote>Always attach approved quotations before publishing the PO.</blockquote>',
    categoryId: 'finance',
    tags: ['Finance', 'SOP'],
    authorId: 'u1',
    status: 'Published',
    visibility: 'Managers',
    createdAt: '2026-01-08T09:00:00.000Z',
    updatedAt: '2026-06-13T11:20:00.000Z',
    views: 980,
    favorite: true
  },
  {
    id: 'a4',
    title: 'Production Incident Report Template',
    slug: 'production-incident-report-template',
    content: '<h1>Incident Report</h1><p>Capture impact, timeline, root cause, owner, and preventive actions.</p>',
    categoryId: 'devops',
    tags: ['Engineering', 'SOP'],
    authorId: 'u2',
    status: 'Draft',
    visibility: 'Managers',
    createdAt: '2026-06-08T09:00:00.000Z',
    updatedAt: '2026-06-19T12:45:00.000Z',
    views: 215,
    favorite: false
  }
];

export const activities: Activity[] = [
  { id: 'act1', userId: 'u1', action: 'updated', target: 'Employee Onboarding Guide', timestamp: '2026-06-20T10:00:00.000Z' },
  { id: 'act2', userId: 'u2', action: 'published', target: 'Leave Approval Workflow', timestamp: '2026-06-19T16:20:00.000Z' },
  { id: 'act3', userId: 'u1', action: 'created category', target: 'DevOps', timestamp: '2026-06-19T08:45:00.000Z' }
];

export const versions: Version[] = [
  { id: 'v1', articleId: 'a1', version: 12, authorId: 'u1', timestamp: '2026-06-18T10:30:00.000Z', summary: 'Updated IT checklist and payroll timing.' },
  { id: 'v2', articleId: 'a1', version: 11, authorId: 'u2', timestamp: '2026-05-24T13:10:00.000Z', summary: 'Added manager introduction flow.' },
  { id: 'v3', articleId: 'a2', version: 6, authorId: 'u2', timestamp: '2026-06-16T14:15:00.000Z', summary: 'Clarified manager approval conditions.' }
];
