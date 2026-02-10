import { DashboardLayout } from '@/components/layout/DashboardLayout'

const navItems = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Contacts', href: '/features/contacts' },
  { label: 'Settings', href: '/settings' },
  { label: 'Billing', href: '/billing' },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout productName="PeopleDB" navItems={navItems}>
      {children}
    </DashboardLayout>
  )
}
