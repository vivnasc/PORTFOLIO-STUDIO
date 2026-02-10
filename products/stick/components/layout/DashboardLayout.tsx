'use client'

import { Sidebar } from './Sidebar'
import { Header } from './Header'

interface NavItem {
  label: string
  href: string
  icon?: React.ReactNode
}

interface DashboardLayoutProps {
  children: React.ReactNode
  productName: string
  navItems: NavItem[]
}

export function DashboardLayout({ children, productName, navItems }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen">
      <Sidebar productName={productName} navItems={navItems} />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}
