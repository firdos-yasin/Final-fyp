import { Protect, useClerk, useUser } from '@clerk/clerk-react'
import { Eraser, FileText, Hash, House, Image, LogOut, Scissors, SquarePen, User } from 'lucide-react'
import React from 'react'
import { NavLink } from 'react-router-dom'

const navIems = [
    {to: '/ai', label: 'Dashboard', Icon: House},
    {to: '/ai/write-article', label: 'Write Article', Icon: SquarePen},
    {to: '/ai/blog-titles', label: 'Blog Titles', Icon: Hash},
    {to: '/ai/generate-images', label: 'Generate Image', Icon: Image},
    {to: '/ai/remove-background', label: 'Remove Background', Icon: Eraser},
    {to: '/ai/remove-object', label: 'Remove Object', Icon: Scissors},
    {to: '/ai/review-resume', label: 'Review Resume', Icon: FileText},
    {to: '/ai/community', label: 'Community', Icon: User}
]

const Sidebar = ({ sidebar, setSidebar }) => {

  const { signOut, openUserProfile } = useClerk()
  const { user } = useUser()

  return (
    <div
      className={`w-60 bg-white border-r border-gray-100 flex flex-col
      justify-between items-center max-sm:absolute
      top-14 bottom-0 shadow-sm
      ${sidebar ? 'translate-x-0' : 'max-sm:-translate-x-full'}
      transition-all duration-300 ease-in-out`}
    >

      <div className='my-7 w-full'>

        {user && (
          <div className='flex flex-col items-center px-4 mb-2'>
            <div className='relative'>
              <img
                src={user.imageUrl}
                alt="User avatar"
                className='w-16 h-16 rounded-full ring-2 ring-offset-2 ring-[#3C81F6]/30'
              />
              <span className='absolute bottom-0 right-0 w-4 h-4 bg-green-400 rounded-full border-2 border-white'/>
            </div>
            <h1 className='mt-3 text-center font-semibold text-slate-700 text-sm'>
              {user.fullName}
            </h1>
            <span className='text-xs text-gray-400 mt-0.5'>
              <Protect plan='premium' fallback="Free Plan">✨ Premium</Protect>
            </span>
          </div>
        )}

        <div className='h-px bg-gray-100 mx-4 my-4'/>

        <div className='px-3 text-sm text-gray-600 font-medium space-y-1'>
          {navIems.map(({to, label, Icon}) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/ai'}
              onClick={() => setSidebar(false)}
              className={({isActive}) => `px-3.5 py-2.5 flex items-center gap-3 rounded-xl transition-all duration-200
              ${isActive
                ? 'bg-gradient-to-r from-[#3C81F6] to-[#9234EA] text-white shadow-md shadow-blue-100'
                : 'hover:bg-gray-50 hover:text-slate-800 hover:translate-x-1'}`}
            >
              {({isActive}) => (
                <>
                  <Icon className={`w-4 h-4 transition-all ${isActive ? 'text-white' : 'text-gray-400'}`}/>
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>

      <div className='w-full border-t border-gray-100 p-4 px-5 flex items-center justify-between bg-gray-50/50'>
        <div onClick={openUserProfile} className='flex gap-2.5 items-center cursor-pointer group'>
          <img
            src={user.imageUrl}
            className='w-8 h-8 rounded-full ring-2 ring-transparent group-hover:ring-[#3C81F6]/30 transition-all'
            alt=""
          />
          <div>
            <h1 className='text-sm font-medium text-slate-700'>{user.fullName}</h1>
            <p className='text-xs text-gray-400'>
              <Protect plan='premium' fallback="Free">Premium</Protect> Plan
            </p>
          </div>
        </div>
        <LogOut
          onClick={signOut}
          className='w-4 h-4 text-gray-400 hover:text-red-400 transition-all cursor-pointer hover:scale-110'
        />
      </div>

    </div>
  )
}

export default Sidebar