import { DashboardLayout } from '@/components/layout/DashboardLayout'

const navItems = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Pattern Detection', href: '/features/pattern-detection' },
  { label: 'Settings', href: '/settings' },
  { label: 'Billing', href: '/billing' },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout productName="RiskLoop" navItems={navItems}>
      {children}
    </DashboardLayout>
  )
}
