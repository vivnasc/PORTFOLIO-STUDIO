import { DashboardLayout } from '@/components/layout/DashboardLayout'

const navItems = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Filter', href: '/features/filter' },
  { label: 'Settings', href: '/settings' },
  { label: 'Billing', href: '/billing' },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout productName="CommitmentFilter" navItems={navItems}>
      {children}
    </DashboardLayout>
  )
}
