import { DashboardLayout } from '@/components/layout/DashboardLayout'

const navItems = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Habit Tracker', href: '/features/habit-tracker' },
  { label: 'Settings', href: '/settings' },
  { label: 'Billing', href: '/billing' },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout productName="Stick" navItems={navItems}>
      {children}
    </DashboardLayout>
  )
}
