import { CaretDoubleLeft, CaretDoubleRight, DotsThreeVertical } from '@phosphor-icons/react'
import { assets } from '../../assets/assets'
import { createContext, useState } from 'react'

export const SidebarContext = createContext()

export default function Sidebar({ children }) {
  const [expanded, setExpanded] = useState(true)

  return (
    <aside className={`h-screen ${expanded ? 'w-64' : 'w-20'} transition-all duration-300`}>
      <nav className="h-full flex flex-col bg-slate-200 border-r border-gray-400 shadow-sm">
        {/* Sidebar Header */}
        <div className={`p-4 pb-2 flex items-center ${expanded ? 'justify-between' : 'justify-center'}`}>
          <img src={assets.faviconBlackFilled} className={`overflow-hidden transition-all ${expanded ? 'w-8 p-1' : 'w-0'}`} alt="Logo" />
          <div className={`flex justify-center items-center overflow-hidden transition-all text-nowrap ${expanded ? 'w-fit' : 'w-0'}`}>
            <h1 className={`text-2xl font-bold text-black transition-all mx-3 ${expanded ? 'w-fit' : 'w-0'}`}>KTM AGRI</h1>
          </div>
          <button 
            onClick={() => setExpanded((curr) => !curr)} 
            className="p-1.5 rounded-lg bg-gray-50 hover:bg-amber-600 transition-all duration-300" >
            {expanded ? <CaretDoubleLeft weight='duotone' size={20} /> : <CaretDoubleRight weight='duotone' size={20} />}
          </button>
        </div>

        {/* Sidebar Items */}
        <SidebarContext.Provider value={{ expanded }}>
          <ul className="flex-1 px-3">{children}</ul>
        </SidebarContext.Provider>

        {/* Sidebar Footer */}
{/* 
        <div className="border-t flex p-3">
          <img
            src={assets.faviconWhiteFilled}
            alt="User Avatar"
            className="w-10 h-10 rounded-md bg-black"
          />
          <div className={`flex justify-between items-center overflow-hidden transition-all ${expanded ? 'w-52 ml-3' : 'w-0'}`}>
            <div className="leading-4">
              <h4 className="font-semibold">Admin</h4>
              <span className="text-xs text-black">admin@ktm-agri.lk</span>
            </div>
            <DotsThreeVertical size={20} weight='bold' />
          </div>
        </div> */}
      </nav>
    </aside>
  )
}