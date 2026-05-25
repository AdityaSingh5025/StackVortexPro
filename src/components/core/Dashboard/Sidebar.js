import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from "react-redux"
import { VscSignOut } from "react-icons/vsc"
import { HiMenu, HiX } from "react-icons/hi"
import SidebarLink from './SidebarLink'
import { sidebarLinks } from "../../../data/dashboard-links"
import { logout } from "../../../services/operations/authAPI"
import ConfirmationModal from '../../common/ConfirmationModal'
import { useMobileMenu } from '../../../context/MobileMenuContext'

const Sidebar = () => {

    const { user, loading: profileLoading } = useSelector(
        (state) => state.profile
      )
      const { loading: authLoading } = useSelector((state) => state.auth)
      const dispatch = useDispatch()
      const navigate = useNavigate()
      const [confirmationModal, setConfirmationModal] = useState(null)
      const { isSidebarOpen, toggleSidebar, closeAll } = useMobileMenu()

      if (profileLoading || authLoading) {
        return (
          <div className="grid h-[calc(100vh-3.5rem)] min-w-[220px] items-center border-r-[1px] border-r-richblack-700 bg-richblack-800">
            <div className="spinner"></div>
          </div>
        )
      }

  const sidebarContent = (
    <div className='flex h-full flex-col py-10'>
      <div className='flex flex-col'>
        {sidebarLinks.map((link) => {
          if (link.type && user?.accountType !== link.type) return null;
          return (
            <div key={link.id} onClick={() => closeAll()}>
              <SidebarLink link={link} iconName={link.icon} />
            </div>
          )
        })}
      </div>

      <div className="mx-auto mt-6 mb-6 h-[1px] w-10/12 bg-richblack-700" />

      <div className='flex flex-col'>
        <div onClick={() => closeAll()}>
          <SidebarLink link={{ name: "Settings", path: "/dashboard/settings" }} iconName="VscSettingsGear" />
        </div>
        <button onClick={() => {
          closeAll()
          setConfirmationModal({
            text1: "Are you sure?",
            text2: "You will be logged out of your account.",
            btn1Text: "Logout",
            btn2Text: "Cancel",
            btn1Handler: () => dispatch(logout(navigate)),
            btn2Handler: () => setConfirmationModal(null),
          })
        }}
        className="px-8 py-2 text-sm font-medium text-richblack-300">
          <div className="flex items-center gap-x-2">
            <VscSignOut className="text-lg" />
            <span>Logout</span>
          </div>
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile hamburger toggle button */}
      <button
        className="fixed top-[3.8rem] left-3 z-50 flex items-center justify-center rounded-md bg-richblack-700 p-2 text-richblack-5 shadow-md md:hidden"
        onClick={() => toggleSidebar()}
        aria-label="Toggle sidebar"
      >
        {isSidebarOpen ? <HiX className="text-xl" /> : <HiMenu className="text-xl" />}
      </button>

      {/* Mobile overlay backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-60 md:hidden"
          onClick={() => closeAll()}
        />
      )}

      {/* Mobile sidebar drawer */}
      <div
        className={`fixed top-[3.5rem] left-0 z-40 h-[calc(100vh-3.5rem)] w-[220px] border-r-[1px] border-r-richblack-700 bg-richblack-800 transition-transform duration-300 md:hidden ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </div>

      {/* Desktop sidebar (always visible) */}
      <div className='hidden md:flex h-[calc(100vh-3.5rem)] min-w-[220px] flex-col border-r-[1px] border-r-richblack-700 bg-richblack-800'>
        {sidebarContent}
      </div>

      {confirmationModal && <ConfirmationModal modalData={confirmationModal} />}
    </>
  )
}

export default Sidebar