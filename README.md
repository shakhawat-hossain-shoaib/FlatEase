# FlatEase — Smart Apartment Management System

FlatEase is a web-based apartment management system built to replace messy WhatsApp chats, paper logs, and forgotten reminders. It helps apartment managers and tenants handle complaints, payments, leases, and sensitive documents in one secure place.

This project is built as an academic and portfolio-ready application using **Laravel** and **React**, with a strong focus on security, automation, and real-world usability.

---

## 📦 Project Overview

| ID           | Name               | Email                                      | Role      |
|--------------|--------------------|--------------------------------------------|-----------|
| 20230104081  | Shakhawat Hossain  | shakhawat.cse.20230104081@aust.edu          | Backend   |
| 20230104076  | Partha Ratul       | parthas.ratul@gmail.com                    | Backend   |
| 20230104079  | MD Abid Khan       | gisankhan299@gmail.com                     | Frontend |
| 20230104084  | Hasan Al Mahmud    | mahi708b@gmail.com                         | Frontend |

---

## 🎯 Objective

- Digitize apartment and tenant management
- Securely store sensitive tenant documents (NID, lease agreements)
- Track leases and automatically alert before expiry
- Improve communication between tenants and administrators
- Reduce manual errors and forgotten deadlines

---

## 👥 Target Audience

- Apartment and building administrators  
- Property managers  
- Residential tenants  

---

## 🧰 Tech Stack

### Backend
- Laravel (PHP)
- RESTful API architecture
- Laravel Sanctum (JWT-based authentication)
- MySQL database

### Frontend
- React.js
- Tailwind CSS

### Rendering Method
- Client-Side Rendering (CSR)

---

## 🔐 Authentication & Security

- JWT-based authentication using Laravel Sanctum
- Role-based access control (Admin / Tenant)
- Encrypted sensitive fields (e.g., NID numbers)
- Secure file storage outside public directories
- CSRF protection

---

## ✨ Key Features

### Core Features
- Apartment and tenant management
- Complaint and maintenance tracking
- Rent and service charge records
- Admin and tenant dashboards
- Notification system

### Exclusive Feature
- Auto-expiry lease alert system  
  - Alerts 30 days before lease expiry  
  - Alerts 7 days before lease expiry  
  - Flags expired leases  

### Secure Document Storage
- Encrypted storage for:
  - National ID (NID)
  - Lease agreements
- Admin-only access
- No public document URLs

---

## 🔄 CRUD Operations

CRUD functionality is implemented for:
- Tenants
- Apartments
- Leases
- Complaints
- Payments
- Documents

---

## 🌐 API Endpoints (Approximate)

### Authentication
- `POST /api/login`
- `POST /api/register`
- `POST /api/logout`

### Tenants
- `GET /api/tenants`
- `POST /api/tenants`
- `PUT /api/tenants/{id}`
- `DELETE /api/tenants/{id}`

### Apartments
- `GET /api/apartments`
- `POST /api/apartments`

### Leases
- `GET /api/leases`
- `POST /api/leases`
- `PUT /api/leases/{id}`

### Complaints
- `GET /api/complaints`
- `POST /api/complaints`
- `PUT /api/complaints/{id}`

### Documents
- `POST /api/documents/upload`
- `GET /api/documents/{id}`

### Notifications
- `GET /api/notifications`

---

## 🗺️ Project Milestones

### Milestone 1 — Foundation
- Laravel and React project setup
- Database design and migrations
- JWT authentication
- Role-based access
- Basic dashboard UI

### Milestone 2 — Core Functionality
- Apartment and tenant CRUD
- Complaint management system
- Rent and service charge records
- Secure document upload with encryption
- Admin and tenant dashboards

### Milestone 3 — Automation & Finalization
- Lease auto-expiry alert system
- Notification system (dashboard and email)
- UI refinement and responsiveness
- Security testing
- Final deployment and documentation

---

## 🎨 Figma Mockup

Design reference for the UI and user flow: https://disc-voice-24868008.figma.site


---

## 📚 Why This Project Matters

This project solves a real operational problem faced by most apartment buildings. It combines backend security, frontend usability, and automation in a practical, production-style system suitable for academic evaluation and professional portfolios.

---

## 📄 License

This project is developed for academic purposes.
