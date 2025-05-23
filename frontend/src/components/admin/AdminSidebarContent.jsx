import React from 'react';
import { SidebarItem, SubMenu } from '../shared/SidebarItem';
import { House, CalendarDots, ShoppingCart, CurrencyCircleDollar, Bird, ArchiveBox, Storefront, UserPlus, UsersThree, SignOut } from '@phosphor-icons/react';
import { useAuth } from '../../context/AuthContext';

export default function AdminSidebarContent() {
  const { logout } = useAuth();

  return (
    <>
      <SidebarItem
        icon={<House size={20} weight="duotone" />}
        text="Dashboard"
        to="/admin/dashboard"
      />
      {/* <SidebarItem
        icon={<CalendarDots size={20} weight="duotone" />}
        text="Calendar"
        to="/admin/calendar"
      /> */}
      <SidebarItem
        icon={<ShoppingCart size={20} weight="duotone" />}
        text="Orders"
        to="/admin/orders"
      />
      <SubMenu
        icon={<CurrencyCircleDollar size={20} weight="duotone" />}
        text="Finance"
      >
        <SidebarItem text="Transactions" to="/admin/finance/transactions" />
        <SidebarItem text="Financial Reports" to="/admin/finance/reports" />
      </SubMenu>
      <SubMenu icon={<Bird size={20} weight="duotone" />} text="Live Stock">
        <SidebarItem text="Eggs" to="/admin/livestock/eggs" />
        <SidebarItem text="Chicks" to="/admin/livestock/chicks" />
        <SidebarItem text="Chickens" to="/admin/livestock/chickens" />
      </SubMenu>
      <SubMenu icon={<ArchiveBox size={20} weight="duotone" />} text="Inventory">
        <SidebarItem text="Feed" to="/admin/inventory/feed" />
        <SidebarItem text="Medications" to="/admin/inventory/medication" />
        <SidebarItem text="Other" to="/admin/inventory/other" />
        <SidebarItem text="Reports" to="/admin/inventory/reports" />
      </SubMenu>
      <SidebarItem
        icon={<Storefront size={20} weight="duotone" />}
        text="Buyers"
        to="/admin/buyers"
      />
      <SidebarItem
        icon={<UserPlus size={20} weight="duotone" />}
        text="Sellers"
        to="/admin/sellers"
      />
      <SidebarItem
        icon={<UsersThree size={20} weight="duotone" />}
        text="Employees"
        to="/admin/employees"
      />

      <SidebarItem
        icon={<SignOut size={20} weight="duotone" />}
        text="Logout"
        to="/signin"
        onClick={logout}
      />
    </>
  );
}
