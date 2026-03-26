import { useState } from 'react'

import { Outlet } from 'react-router-dom'

import { Sidebar } from './Sidebar'

import { TopBar } from './TopBar'



export function Layout() {

  const [sidebarOpen, setSidebarOpen] = useState(false)



  return (

    <div className="flex h-screen bg-white dark:bg-slate-950 overflow-hidden">

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">

        <TopBar onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-gray-50 dark:bg-slate-900">

          <Outlet />

        </main>

      </div>

    </div>

  )

}

