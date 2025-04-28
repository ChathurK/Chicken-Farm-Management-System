# CHICKEN-FARM-MANAGEMENT-SYSTEM-II Project Structure

```
CHICKEN-FARM-MANAGEMENT-SYSTEM-II/
│
├── .gitignore
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
│   │   │   ├── inventoryController.js
│   │   │   ├── livestockController.js
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
│   │   │   ├── Inventory.js
│   │   │   ├── Livestock.js
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
│   │   │   ├── inventory.js
│   │   │   ├── livestock.js
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
│   │   │   │   └── DashboardLayout.jsx
│   │   │   ├── employee/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── DashboardLayout.jsx
│   │   │   │   └── EmployeeSidebarContent.jsx
│   │   │   ├── shared/
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   ├── SidebarItem.jsx
│   │   │   │   └── Topbar.jsx
│   │   │   └── landing/
│   │   │       ├── About.jsx
│   │   │       ├── ContactUs.jsx
│   │   │       ├── Footer.jsx
│   │   │       ├── Header.jsx
│   │   │       ├── LandingPage.jsx
│   │   │       ├── Navbar.jsx
│   │   │       └── Services.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── App.jsx
│   │   ├── index.css
│   │   ├── main.jsx
│   │   └── routes.jsx
│   ├── .gitignore
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
│
└── projectInfo/
    ├── colors.md
    ├── database.sql
    ├── poultryFarmRequirementCatalogue.md
    ├── projectInfo.md
    └── projectStructure.md
```