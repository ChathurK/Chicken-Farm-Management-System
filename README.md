# 🐔 Chicken Farm Management System

A comprehensive web-based management system designed for poultry farms to streamline operations, track inventory, manage finances, and automate day-to-day farm activities.


## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Contributing](#contributing)


## 🌟 Overview

This Chicken Farm Management System is designed to help poultry farm owners digitize their operations. The system supports farms with chickens that produce eggs, manage chick incubation, track inventory, handle transactions, and maintain comprehensive records.

### Problem Statement
Traditional poultry farms rely on manual record-keeping and inventory management, leading to:
- Inefficient tracking of livestock and egg production
- Manual financial record keeping
- Difficulty in monitoring inventory levels
- Limited insights into farm profitability

### Solution
A web-based management system that provides:
- Automated inventory tracking and alerts
- Financial management with profit/loss reporting
- Order management
- Employee and customer management
- Real-time dashboard with analytics


## ✨ Features

### 📊 Dashboard & Analytics
- Real-time overview of farm operations
- Financial summaries and inventory status
- Visual charts and graphs for data insights
- Performance metrics and key indicators

### 🐣 Livestock Management
- Track chickens, chicks, and egg production
- Record deaths, diseases, and treatments

### 📦 Inventory Management
- Track feed, medication, and supplies
- Automatic low-stock alerts and thresholds
- Expiration date monitoring
- CRUD operations for all inventory items

### 💰 Financial Management
- Record income and expense transactions
- Generate profit and loss statements
- Track payments to suppliers and from customers
- Export financial reports in multiple formats

### 👥 User Management
- Role-based access control (Admin/Employee)
- Manage buyer and seller information
- Secure authentication and authorization

### 📋 Order Management
- Create and track orders
- Set delivery deadlines and priorities
- Update order status and completion

### 📊 Reporting
- Generate comprehensive reports
- Export data in PDF and Excel formats
- Inventory summaries and financial statements
- Custom date range filtering


## 🛠 Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **MySQL** - Relational database
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **express-validator** - Input validation
- **helmet** - Security middleware
- **cors** - Cross-origin resource sharing

### Frontend
- **React** - User interface library
- **Vite** - Build tool and development server
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Phosphor Icons** - Icon library
- **Recharts** - Chart components
- **axios** - HTTP client
- **React Toastify** - Notifications

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **nodemon** - Development server auto-restart


## 📁 Project Structure

```
chicken-farm-management-system-II/
├── backend/                    # Node.js backend API
│   ├── src/
│   │   ├── config/            # Database configuration
│   │   ├── controllers/       # Business logic controllers
│   │   ├── middleware/        # Authentication & validation
│   │   ├── models/           # Database models
│   │   ├── routes/           # API route definitions
│   │   ├── utils/            # Utilities and seed data
│   │   └── index.js          # Application entry point
│   └── package.json
├── frontend/                  # React frontend application
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── context/          # React context providers
│   │   ├── utils/            # API utilities
│   │   ├── assets/           # Static assets
│   │   └── main.jsx          # Application entry point
│   └── package.json
└── projectInfo/              # Documentation and diagrams
    ├── diagrams/             # System diagrams
    └── *.md                  # Project documentation
```

## 📋 Prerequisites

Before running this project, make sure you have:

- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager
- **MySQL** (v8.0 or higher)
- **Git** for version control

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/ChathurK/Chicken-Farm-Management-System.git
cd Chicken-Farm-Management-System
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Modify environment variables file (Current .env file consists of my environment's configurations)
# Edit backend/.env
```

**Note:** The current `.env` file contains the developer's environment configurations. You'll need to modify it with your own database credentials and settings. [See Configuration section below ⚙️](#configuration) for detailed setup instructions.

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install
```

### 4. Database Setup

1. Create a MySQL database named `chicken_farm_db`
2. Run the database setup script:

```bash
npm run db
```

3. Seed the database with initial data:

```bash
npm run seed
```

## ⚙️ Configuration

### Backend Environment Variables

Modify the `.env` file in the backend directory:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=chicken_farm_db

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=24h

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:5173
```

### Frontend Configuration

Update the API base URL in `src/utils/api.js` if needed:

```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```

## 🎯 Usage

### Starting the Development Servers

1. **Start the Backend Server:**

```bash
cd backend
npm run dev
```

The backend will run on `http://localhost:5000`

2. **Start the Frontend Development Server:**

```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:5173`

### Default Login Credentials

- **Admin:**
  - Email: `admin@chickenfarm.com`
  - Password: `admin123`

- **Employee:**
  - Email: `employee@chickenfarm.com`
  - Password: `employee123`

### Building for Production

```bash
# Backend
cd backend
npm start

# Frontend
cd frontend
npm run build
npm run preview
```

## 📚 API Documentation

### Authentication Endpoints

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get user profile

### Main Resource Endpoints

- `/api/chickens` - Chicken management
- `/api/chicks` - Chick management
- `/api/eggs` - Egg inventory
- `/api/inventory` - General inventory
- `/api/orders` - Order management
- `/api/transactions` - Financial transactions
- `/api/buyers` - Buyer management
- `/api/sellers` - Seller management
- `/api/employees` - Employee management


## 🗄️ Database Schema

The system uses a MySQL database with the following main entities:

- **Users** - System users (Admin/Employee)
- **Chickens** - Adult chicken records
- **Chicks** - Young chicken records
- **Eggs** - Egg inventory and production
- **Inventory** - Feed, medication, supplies
- **Orders** - Customer orders
- **Transactions** - Financial records
- **Buyers/Sellers** - Customer information
- **Employees** - Staff records

Refer to `backend/src/utils/dbSetup.sql` for the complete schema.


## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a Pull Request


## 👨‍💻 Author

**ChathurK**
- GitHub: [@ChathurK](https://github.com/ChathurK)


## 🚧 Roadmap

- Mobile application development
- Advanced analytics and forecasting
- IoT integration for automated data collection
- Multi-farm support
- Automated backup system
- Email notification system
- Advanced reporting with custom filters


## 🐛 Known Issues

While the proposed system provides a comprehensive solution for managing chicken farm operations, it does have certain limitations:

### Feature Limitations
- **Limited scope for future expansion** - Some advanced features like real-time market price integration and comprehensive disease management systems were not included to keep the project manageable within given time and resource constraints
- **Missing automated integrations** - The system lacks integration with external APIs for market data, weather information, or veterinary databases
- **No IoT device integration** - Currently doesn't support automated data collection from sensors or smart farming equipment

### Manual Process Dependencies
- **Manual order deadline setting** - Order delivery deadlines must be set manually by administrators, which may lead to scheduling conflicts
- **Manual inventory transitions** - Some inventory status updates (expiration, damage, livestock deaths) require manual entry, potentially introducing human error
- **Limited automation** - Many processes that could be automated still require manual intervention and data entry

### Customization Constraints
- **Client-specific design** - The system is designed specifically for KTM AGRI and may require significant customization for other farm operations with different needs, scales, or business models
- **Limited scalability testing** - Performance with larger datasets (100+ chickens, thousands of transactions) has not been thoroughly tested
- **Single-farm architecture** - Current design doesn't support multi-farm operations or franchise management

### Technical Limitations
- **Basic reporting features** - Advanced analytics and predictive modeling capabilities are limited
- **Manual backup process** - Database backups are not automated and require manual intervention

---
**Happy Farming! 🐔🥚**