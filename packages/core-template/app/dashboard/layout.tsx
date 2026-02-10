import { DashboardLayout } from '@/components/layout/DashboardLayout'

const defaultNavItems = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Settings', href: '/settings' },
  { label: 'Billing', href: '/billing' },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const productName = process.env.NEXT_PUBLIC_PRODUCT_NAME || 'Product'

  return (
    <DashboardLayout productName={productName} navItems={defaultNavItems}>
      {children}
    </DashboardLayout>
  )
}
