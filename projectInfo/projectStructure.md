# CHICKEN-FARM-MANAGEMENT-SYSTEM-II Project Structure

```
CHICKEN-FARM-MANAGEMENT-SYSTEM-II/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── buyerController.js
│   │   │   ├── chickController.js
│   │   │   ├── chickenController.js
│   │   │   ├── eggController.js
│   │   │   ├── employeeController.js
│   │   │   ├── inventoryController.js
│   │   │   ├── orderController.js
│   │   │   ├── sellerController.js
│   │   │   ├── transactionController.js
│   │   │   └── userController.js
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   ├── models/
│   │   │   ├── Buyer.js
│   │   │   ├── Chick.js
│   │   │   ├── Chicken.js
│   │   │   ├── Egg.js
│   │   │   ├── Employee.js
│   │   │   ├── Inventory.js
│   │   │   ├── Order.js
│   │   │   ├── Seller.js
│   │   │   ├── Transaction.js
│   │   │   └── User.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── buyers.js
│   │   │   ├── chickens.js
│   │   │   ├── chicks.js
│   │   │   ├── eggs.js
│   │   │   ├── employees.js
│   │   │   ├── inventory.js
│   │   │   ├── orders.js
│   │   │   ├── sellers.js
│   │   │   ├── transactions.js
│   │   │   └── users.js
│   │   ├── utils/
│   │   │   ├── dbSetup.sql
│   │   │   └── seedData.js
│   │   └── index.js
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   │   ├── aboutUs.svg
│   │   │   ├── assets.js
│   │   │   ├── faviconBlackFilled.png
│   │   │   ├── faviconWhiteFilled.png
│   │   │   ├── landingPageBg.jpg
│   │   │   └── signInPageBg.jpg
│   │   ├── components/
│   │   │   ├── NotFound.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── ScreenSizeIndicator.jsx
│   │   │   ├── SignIn.jsx
│   │   │   ├── SignUp.jsx
│   │   │   ├── Unauthorized.jsx
│   │   │   ├── admin/
│   │   │   │   ├── AdminSidebarContent.jsx
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── DashboardLayout.jsx
│   │   │   │   ├── buyers/
│   │   │   │   │   ├── BuyerDetails.jsx
│   │   │   │   │   ├── BuyerForm.jsx
│   │   │   │   │   ├── BuyerModal.jsx
│   │   │   │   │   ├── BuyerOrderHistory.jsx
│   │   │   │   │   └── Buyers.jsx
│   │   │   │   ├── calendar/
│   │   │   │   │   └── Calendar.jsx
│   │   │   │   ├── employees/
│   │   │   │   │   ├── EmployeeModal.jsx
│   │   │   │   │   └── Employees.jsx
│   │   │   │   ├── finance/
│   │   │   │   │   ├── FinancialReports.jsx
│   │   │   │   │   ├── index.js
│   │   │   │   │   ├── TransactionDetails.jsx
│   │   │   │   │   ├── TransactionForm.jsx
│   │   │   │   │   └── TransactionList.jsx
│   │   │   │   ├── inventory/
│   │   │   │   │   ├── feed/Feed.jsx
│   │   │   │   │   ├── medications/Medications.jsx
│   │   │   │   │   ├── other/Other.jsx
│   │   │   │   │   ├── reports/InventoryReports.jsx
│   │   │   │   │   ├── settings/ThresholdSettings.jsx
│   │   │   │   │   ├── tracking/
│   │   │   │   │   ├── Inventory.jsx
│   │   │   │   │   ├── InventoryAlerts.jsx
│   │   │   │   │   ├── InventoryDetails.jsx
│   │   │   │   │   ├── InventoryForm.jsx
│   │   │   │   │   └── InventoryModal.jsx
│   │   │   │   ├── livestock/
│   │   │   │   │   ├── chickens/ChickenModal.jsx
│   │   │   │   │   ├── chickens/Chickens.jsx
│   │   │   │   │   ├── chicks/ChickModal.jsx
│   │   │   │   │   ├── chicks/Chicks.jsx
│   │   │   │   │   ├── eggs/EggModal.jsx
│   │   │   │   │   ├── eggs/Eggs.jsx
│   │   │   │   │   └── Livestock.jsx
│   │   │   │   ├── orders/
│   │   │   │   │   ├── OrderDetails.jsx
│   │   │   │   │   ├── OrderForm.jsx
│   │   │   │   │   ├── OrderItemForm.jsx
│   │   │   │   │   └── Orders.jsx
│   │   │   │   └── sellers/
│   │   │   │       ├── AdminSidebarContent.jsx
│   │   │   │       ├── Dashboard.jsx
│   │   │   │       └── DashboardLayout.jsx
│   │   │   ├── employee/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── DashboardLayout.jsx
│   │   │   │   ├── EmployeeSidebarContent.jsx
│   │   │   │   ├── inventory/
│   │   │   │   │   ├── feed/Feed.jsx
│   │   │   │   │   ├── medications/Medications.jsx
│   │   │   │   │   ├── other/Other.jsx
│   │   │   │   │   ├── tracking/TransactionTracker.jsx
│   │   │   │   │   ├── Inventory.jsx
│   │   │   │   │   ├── InventoryDetails.jsx
│   │   │   │   │   └── InventoryUpdateForm.jsx
│   │   │   │   ├── livestock/
│   │   │   │   │   ├── chickens/Chickens.jsx
│   │   │   │   │   ├── chicks/Chicks.jsx
│   │   │   │   │   ├── eggs/Eggs.jsx
│   │   │   │   │   └── Livestock.jsx
│   │   │   │   └── orders/
│   │   │   │       ├── OrderDetails.jsx
│   │   │   │       └── Orders.jsx
│   │   │   ├── landing/
│   │   │   │   ├── About.jsx
│   │   │   │   ├── ContactUs.jsx
│   │   │   │   ├── Footer.jsx
│   │   │   │   ├── Header.jsx
│   │   │   │   ├── LandingPage.jsx
│   │   │   │   ├── Navbar.jsx
│   │   │   │   └── Services.jsx
│   │   │   ├── profile/
│   │   │   │   ├── PasswordForm.jsx
│   │   │   │   ├── Profile.jsx
│   │   │   │   └── ProfileForm.jsx
│   │   │   └── shared/
│   │   │       ├── ContactModal.jsx
│   │   │       ├── InventoryModal.jsx
│   │   │       ├── Pagination.jsx
│   │   │       ├── Sidebar.jsx
│   │   │       ├── SidebarItem.jsx
│   │   │       ├── Tabs.jsx
│   │   │       └── Topbar.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── utils/
│   │   │   ├── api.js
│   │   │   └── InventoryAPI.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   ├── main.jsx
│   │   └── routes.jsx
│   ├── .gitignore
│   ├── .prettierignore
│   ├── .prettierrc.cjs
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
│
└── projectInfo/
    ├── .gitignore
    ├── poultryFarmRequirementCatalogue.md
    ├── projectInfo.md
    └── projectStructure.md
```