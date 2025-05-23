import React from 'react';
import { SidebarItem, SubMenu } from '../shared/SidebarItem';
import { House, ShoppingCart, Bird, ArchiveBox, SignOut } from '@phosphor-icons/react';
import { useAuth } from '../../context/AuthContext';

export default function EmployeeSidebarContent() {
    const { logout } = useAuth();

    return (
        <>
            <SidebarItem 
                icon={<House size={20} weight="duotone" />} 
                text="Dashboard" 
                to="/employee/dashboard" 
            />
            <SidebarItem 
                icon={<ShoppingCart size={20} weight="duotone" />} 
                text="Orders" 
                to="/employee/orders" 
            />
            <SubMenu 
                icon={<Bird size={20} weight="duotone" />} 
                text="Live Stock"
            >
                <SidebarItem text="Eggs" to="/employee/livestock/eggs" />
                <SidebarItem text="Chicks" to="/employee/livestock/chicks" />
                <SidebarItem text="Chickens" to="/employee/livestock/chickens" />
            </SubMenu>
            <SubMenu 
                icon={<ArchiveBox size={20} weight="duotone" />} 
                text="Inventory"
            >
                <SidebarItem text="Feed" to="/employee/inventory/feed" />
                <SidebarItem text="Medications" to="/employee/inventory/medication" />
                <SidebarItem text="Other" to="/employee/inventory/other" />
            </SubMenu>
            
            <SidebarItem
                icon={<SignOut size={20} weight="duotone" />} 
                text="Logout" 
                to="/signin" 
                onClick={logout}
            />
        </>
    );
}