import React, { createContext, useContext, useState } from 'react'

// Tracks which mobile menu is currently open: 'navbar' | 'sidebar' | null
const MobileMenuContext = createContext(null)

export const MobileMenuProvider = ({ children }) => {
  const [openMenu, setOpenMenu] = useState(null)

  const openNavbar = () => setOpenMenu('navbar')
  const openSidebar = () => setOpenMenu('sidebar')
  const closeAll = () => setOpenMenu(null)

  const toggleNavbar = () => setOpenMenu((prev) => (prev === 'navbar' ? null : 'navbar'))
  const toggleSidebar = () => setOpenMenu((prev) => (prev === 'sidebar' ? null : 'sidebar'))

  return (
    <MobileMenuContext.Provider
      value={{
        openMenu,
        isNavbarOpen: openMenu === 'navbar',
        isSidebarOpen: openMenu === 'sidebar',
        toggleNavbar,
        toggleSidebar,
        closeAll,
      }}
    >
      {children}
    </MobileMenuContext.Provider>
  )
}

export const useMobileMenu = () => useContext(MobileMenuContext)
