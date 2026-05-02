# PCBUILDER E-commerce Application

A full-stack e-commerce application for PC components with Node.js backend, MySQL database, and PayPal payment integration.

## Features

- Dynamic product catalog from MySQL database
- Shopping cart with localStorage
- PayPal Smart Payment Buttons integration
- Order management with database persistence
- RESTful API for products and orders

## Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Payment**: PayPal JS SDK
- **Styling**: Bootstrap 5

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MySQL Server
- PayPal Developer Account (for developer test credentials)

### 1. Database Setup

1. Install MySQL and create a database user
2. Run the database setup script:

```bash
mysql -u root -p < database.sql
```

3. Update the `.env` file with your database credentials:

```
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=ecom_db
```

### 2. PayPal Setup

1. Create a PayPal Developer account at https://developer.paypal.com/
2. Create a PayPal developer test app and get your Client ID and Secret
3. Update the `.env` file:

```
PAYPAL_CLIENT_ID=your_client_id
PAYPAL_CLIENT_SECRET=your_client_secret
PAYPAL_ENVIRONMENT=developer_test_mode
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start the Server

```bash
npm start
```

For development with auto-restart:

```bash
npm run dev
```

The server will run on `http://localhost:3000`

### 5. Frontend Integration

To make the frontend dynamic (fetch products from API instead of hardcoded):

1. Update product pages to fetch from `/api/products`
2. Modify cart submission to send orders to `/api/orders`
3. Integrate PayPal buttons with the backend order creation

## API Endpoints

- `GET /api/products` - Get all products
- `POST /api/orders` - Create new order
- `POST /api/orders/:id/capture` - Capture PayPal payment

## Project Structure

```
├── index.html          # Home page
├── product.html        # Product categories page
├── CPU.html           # CPU products page
├── GPU.html           # GPU products page
├── MOTHERBOARD.html   # Motherboard products page
├── RAM.html           # RAM products page
├── STORAGE.html       # Storage products page
├── PSU.html           # PSU products page
├── cart.html          # Shopping cart page
├── style.css          # Main stylesheet
├── cart.js            # Cart functionality
├── catalog.js         # Product catalog logic
├── server.js          # Node.js backend server
├── package.json       # Node.js dependencies
├── database.sql       # MySQL database schema
├── .env               # Environment configuration
└── PHOTOS/            # Product images
```

## Currency Note

The current implementation assumes USD for PayPal transactions. If you need INR support, update the PayPal configuration and currency conversion logic.

## Development

- Frontend files are static HTML/CSS/JS
- Backend serves API endpoints
- Database stores products, orders, and order items
- PayPal handles secure payment processing

## Changes Made

Based on the PDF requirements, the following backend components have been added without modifying the existing frontend HTML/CSS:

### Added Files:
- `server.js` - Node.js Express server with REST API
- `package.json` - Node.js dependencies
- `.env` - Environment configuration
- `database.sql` - MySQL database schema and sample data
- `api.js` - Frontend API utility functions
- `checkout.html` - Checkout page with shipping form and PayPal integration
- `checkout.js` - Checkout logic with PayPal buttons
- `README.md` - This documentation

### Modified Files:
- `cart.js` - Changed "Proceed to Pay" button to "Checkout" link to checkout.html
- Added checkout page integration

### Features Implemented:
- Dynamic product catalog API (`GET /api/products`)
- Order creation API (`POST /api/orders`)
- Payment capture API (`POST /api/orders/:id/capture`)
- MySQL database with products, orders, and order_items tables
- PayPal Smart Payment Buttons integration
- Checkout flow with shipping form

### Setup Required:
1. Install MySQL and create database using `database.sql`
2. Update `.env` with your database and PayPal credentials
3. Run `npm install` and `npm start`
4. Update PayPal Client ID in checkout.html

The existing frontend remains unchanged, with backend functionality added alongside.
