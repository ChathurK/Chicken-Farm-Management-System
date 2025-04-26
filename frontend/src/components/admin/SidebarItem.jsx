import { useContext, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { SidebarContext } from './Sidebar';
import { CaretDown } from '@phosphor-icons/react';

export function SidebarItem({ icon, text, alert, to, onClick }) {
    const { pathname } = useLocation();
    const { expanded } = useContext(SidebarContext);
    const navigate = useNavigate();
    const active = pathname === to;

    const handleClick = (e) => {
        if (onClick) {
            e.preventDefault();
            onClick();
            if (to) navigate(to);
        }
    };

    return (
        <li className={`relative flex items-center py-2 px-3 my-1 font-medium rounded-md cursor-pointer transition-colors group
            ${active ? "bg-amber-500 text-black" : "hover:bg-amber-400 text-gray-700 transition-colors duration-300"}`}>
            <Link to={to} className='flex justify-center items-center w-full' onClick={handleClick}>
                {icon}
                <span className={`overflow-hidden transition-all ${expanded ? "w-52 ml-3" : "w-0"}`}>{text}</span>
            </Link>
            {alert && (
                <div className={`absolute right-2 w-2 h-2 rounded-full bg-blue-400 ${expanded ? "" : "top-2"}`}></div>
            )}
        </li>
    )
}

export function SubMenu({ icon, text, children }) {
    const [open, setOpen] = useState(false);
    const { expanded } = useContext(SidebarContext);

    return (
        <li className='relative my-1'>
            <div 
                onClick={() => setOpen(!open)} 
                role="button"
                aria-expanded={open}
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setOpen(!open)}
                className={`flex justify-center items-center py-2 px-3 font-medium rounded-md cursor-pointer 
                transition-colors duration-300 hover:bg-amber-400 text-gray-700`}>
                {icon}
                <span className={`overflow-hidden transition-all ${expanded ? "w-40 ml-3" : "w-0 text-nowrap"}`}>
                    {text}
                </span>
                <CaretDown
                    className={`${expanded ? "" : "hidden"} ml-auto transition-transform ${open ? "rotate-180" : ""}`} weight='duotone' size={16} />

                {!expanded && (
                    <div className={`absolute left-full rounded-md px-2 py-1 ml-6 
                    bg-blue-100 text-blue-800 text-sm
                    invisible opacity-20 -translate-x-3 transition-all
                    group-hover:visible group-hover:opacity-100 group-hover:translate-x-0`}>
                        {text}
                    </div>
                )}
            </div>

            {expanded && open && (
                <ul className='pl-8'>
                    {children}
                </ul>
            )}
        </li>
    )
}