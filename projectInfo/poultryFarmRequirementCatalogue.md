# Poultry Farm Management System - Requirement Catalogue

## Functional Requirements

| Req. ID | Requirement Description | Priority | Mandatory/Optional | Weight | Category |
|---------|-------------------------|----------|-------------------|--------|----------|
| FR-01 | The system shall allow the admin to record income and expense transactions. | High | Mandatory | High | Financial Management |
| FR-02 | The system shall enable the admin to manage buyer, seller, and employee information, including CRUD operations. | High | Mandatory | High | User Management |
| FR-03 | The system shall provide functionality to track inventory, including eggs, chicks, chickens, feed, medication, and supplies (including CRUD operations). | High | Mandatory | High | Inventory Management |
| FR-04 | The system shall enable admins and employees to record inventory item expiration or damages. | Medium | Mandatory | Medium | Inventory Management |
| FR-05 | The system shall automatically update the inventory status upon transactions and other actions (e.g., sales, purchases, expiration, damage, death). | High | Mandatory | High | Inventory Management |
| FR-06 | The system shall allow the admin to set thresholds and generate alerts for low stock levels. | High | Mandatory | High | Notifications & Alerts |
| FR-07 | The system shall allow the admin to search and filter inventory and transaction records efficiently. | High | Mandatory | High | Search & Query |
| FR-08 | The system shall generate financial reports, including profit and loss statements. | High | Mandatory | High | Reporting |
| FR-09 | The system shall generate inventory summary reports. | High | Mandatory | High | Reporting |
| FR-10 | The system shall allow the admin to place new orders for eggs, chicks and even chickens. | High | Mandatory | High | Order Management |
| FR-11 | The system shall allow the admin to set deadlines for order deliveries manually. | High | Mandatory | High | Order Management |
| FR-12 | The system should enable employees to update order status (e.g., ongoing, ready, completed). | Medium | Mandatory | Medium | Order Management |
| FR-13 | The system shall provide a dashboard summarizing financial and inventory statuses. | Medium | Mandatory | Medium | Dashboard & Analytics |
| FR-14 | The system should provide visual aids like graphs or charts for financial data and inventory statuses. | Medium | Optional | Medium | Dashboard & Analytics |
| FR-15 | The system should support generating reports in multiple formats, such as PDF and Excel. | Low | Optional | Low | Reporting |

## Non-Functional Requirements

| Req. ID | Requirement Description | Priority | Mandatory/Optional | Weight | Category |
|---------|-------------------------|----------|-------------------|--------|----------|
| NFR-01 | The system shall have a user-friendly interface, for both Admin and Employees. | High | Mandatory | High | Usability |
| NFR-02 | The system shall be responsive and accessible across multiple devices, including desktops, tablets, and phones. | Medium | Mandatory | High | Accessibility |
| NFR-03 | The system shall support concurrent users without performance degradation. | Medium | Mandatory | Medium | Performance |
| NFR-04 | The system shall have a high availability rate. | High | Mandatory | High | Reliability |
| NFR-05 | The system shall provide regular automatic backups of all critical data. | High | Mandatory | High | Data Integrity |
| NFR-06 | The system shall implement role-based access control to ensure data security and prevent unauthorized access. | High | Mandatory | High | Security |
| NFR-07 | The system should include data encryption for sensitive information, such as passwords. | High | Mandatory | High | Security |
| NFR-08 | The system shall validate all inputs to prevent errors. | High | Mandatory | High | Validation |
| NFR-09 | The system should support scalability to accommodate future growth, including increased inventory or users. | Medium | Optional | Medium | Scalability |
| NFR-10 | The system shall follow best practices for web application security. | High | Mandatory | High | Security |
| NFR-11 | The system shall handle data exports efficiently, supporting common formats like CSV and Excel. | Medium | Optional | Medium | Data Portability |

## Glossary

| Term | Definition |
|------|------------|
| Admin | User with full system access and administrative privileges |
| CRUD | Create, Read, Update, Delete operations |
| Employee | User with limited access to system functions based on role |
| Inventory | Stock of items including eggs, chicks, chickens, feed, medication, and supplies |
| Dashboard | Visual interface displaying key system metrics and information |
| Role-based access control | Security mechanism restricting system access based on user roles |

## Categories Overview

| Category | Description |
|----------|-------------|
| Financial Management | Requirements related to handling income, expenses, and financial transactions |
| User Management | Requirements for managing system users and their information |
| Inventory Management | Requirements for tracking and managing stock items |
| Order Management | Requirements related to creating and processing orders |
| Reporting | Requirements for generating various system reports |
| Dashboard & Analytics | Requirements for visual data representation and analysis |
| Security | Requirements ensuring system and data protection |
| Performance | Requirements related to system speed and efficiency |
| Usability | Requirements ensuring ease of use and user satisfaction |
| Accessibility | Requirements ensuring system can be used across various devices |
| Data Integrity | Requirements ensuring data accuracy and reliability |
