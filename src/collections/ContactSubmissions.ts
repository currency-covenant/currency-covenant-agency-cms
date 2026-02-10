import { CollectionConfig } from 'payload/types';

export const ContactSubmissions: CollectionConfig = {
  slug: 'contact-submissions',
  labels: { singular: 'Contact Submission', plural: 'Contact Submissions' },
  access: {
    // Public create – anyone (including unauthenticated visitors) can submit a contact message
    create: () => true,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'email', type: 'email', required: true },
    { name: 'phone', type: 'text' },
    { name: 'message', type: 'textarea', required: true },
  ],
};
