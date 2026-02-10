import { DashboardLayout } from '@/components/layout/DashboardLayout'

const navItems = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Energy Tracking', href: '/features/energy-tracking' },
  { label: 'Settings', href: '/settings' },
  { label: 'Billing', href: '/billing' },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout productName="EnergyOS" navItems={navItems}>
      {children}
    </DashboardLayout>
  )
}
