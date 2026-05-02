# PCBUILDER E-commerce Project Documentation

## Project Overview

**Project Title:** PCBUILDER - Custom PC Components E-commerce Platform  
**Course:** E-commerce Development  
**Date:** April 23, 2026  
**Team:** [Your Name/Team Members]

## 1. Introduction

PCBUILDER is a comprehensive e-commerce web application designed for buying and selling computer hardware components. The platform allows users to browse a catalog of PC parts including processors, graphics cards, motherboards, RAM, storage, and power supplies, add items to a shopping cart, and complete secure online purchases through PayPal integration.

The project implements a full-stack solution with a responsive frontend, RESTful backend API, MySQL database, and payment gateway integration, following modern web development best practices.

## 2. Project Objectives

- **Understand E-commerce Architecture:** Implement end-to-end online shopping functionality from product display to payment capture
- **Database Design:** Create a relational database to store products, orders, and customer information
- **API Development:** Build RESTful APIs using Node.js and Express.js
- **Frontend-Backend Integration:** Connect client-side JavaScript with server-side APIs
- **Payment Processing:** Integrate PayPal payment gateway for secure transactions
- **User Experience:** Provide intuitive shopping experience with cart management and checkout flow

## 3. Technologies Used

### Frontend Technologies
- **HTML5:** Semantic markup and page structure
- **CSS3:** Responsive styling with Bootstrap 5 framework
- **JavaScript (ES6+):** Client-side logic, DOM manipulation, and API communication
- **Bootstrap 5:** UI components and responsive grid system

### Backend Technologies
- **Node.js:** Server-side JavaScript runtime environment
- **Express.js:** Web framework for REST API development
- **MySQL:** Relational database management system
- **MySQL2:** Node.js driver for MySQL database connection

### Payment Integration
- **PayPal JS SDK:** Client-side payment buttons and processing
- **PayPal Orders API:** Server-side order creation and payment capture

### Development Tools
- **npm:** Package management and dependency installation
- **dotenv:** Environment variable management
- **CORS:** Cross-origin resource sharing middleware
- **Body-parser:** Request body parsing middleware

## 4. System Architecture

### 3-Tier Architecture

```
┌─────────────────┐
│   Presentation  │ ← HTML/CSS/JS Frontend
│     Layer       │
├─────────────────┤
│   Application   │ ← Node.js + Express API
│     Layer       │
├─────────────────┤
│     Data        │ ← MySQL Database
│     Layer       │
└─────────────────┘
```

### Component Breakdown

#### Presentation Layer
- **Product Catalog:** Dynamic display of PC components
- **Shopping Cart:** Client-side cart management using localStorage
- **Checkout Process:** Shipping form and payment integration
- **Navigation:** Responsive navigation across all pages

#### Application Layer
- **REST API Endpoints:** `/api/products`, `/api/orders`, `/api/orders/:id/capture`
- **Business Logic:** Order processing and payment handling
- **PayPal Integration:** Secure payment processing
- **Error Handling:** Comprehensive error management

#### Data Layer
- **Products Table:** Component catalog with specifications
- **Orders Table:** Customer order information
- **Order Items Table:** Order line items with quantities

## 5. Database Design

### Database Schema

#### Products Table
```sql
CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  category VARCHAR(50),
  specs JSON,
  in_stock BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Orders Table
```sql
CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  street_address VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  zip_code VARCHAR(20) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  payment_id VARCHAR(255),
  payment_status VARCHAR(50) DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Order Items Table
```sql
CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
);
```

### Sample Data

The database is populated with 30+ PC components across 6 categories:
- **CPUs:** Intel and AMD processors (6 products)
- **GPUs:** NVIDIA and AMD graphics cards (6 products)
- **Motherboards:** Various chipsets and form factors (6 products)
- **RAM:** DDR4 and DDR5 memory kits (6 products)
- **Storage:** SSDs and HDDs (6 products)
- **PSUs:** Power supplies with various wattages (6 products)

## 6. API Documentation

### GET /api/products
**Description:** Retrieve all available products  
**Response:** JSON array of product objects

```json
[
  {
    "id": 1,
    "name": "Intel Core i5-12400F",
    "price": 13690.00,
    "image_url": "https://...",
    "category": "CPU",
    "specs": {"Cores": "6", "Threads": "12"},
    "in_stock": true
  }
]
```

### POST /api/orders
**Description:** Create a new order  
**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "street_address": "123 Main St",
  "city": "New York",
  "state": "NY",
  "zip_code": "10001",
  "items": [
    {"product_id": 1, "quantity": 1, "price": 13690.00}
  ],
  "total_amount": 13690.00
}
```

**Response:**
```json
{
  "orderId": 123,
  "paypalOrderId": "PAYPAL_ORDER_ID"
}
```

### POST /api/orders/:id/capture
**Description:** Capture PayPal payment for an order  
**Request Body:**
```json
{
  "paypalOrderId": "PAYPAL_ORDER_ID"
}
```

**Response:**
```json
{
  "success": true,
  "captureId": "PAYMENT_CAPTURE_ID"
}
```

## 7. Key Features

### 7.1 Product Catalog
- **Dynamic Loading:** Products fetched from database via API
- **Category Organization:** Components grouped by type (CPU, GPU, etc.)
- **Product Details:** Images, specifications, and pricing
- **Stock Status:** Real-time availability checking

### 7.2 Shopping Cart
- **Client-Side Storage:** Cart data stored in browser localStorage
- **Add/Remove Items:** Intuitive cart management
- **Quantity Updates:** Increment/decrement item quantities
- **Persistent Cart:** Cart contents survive browser sessions

### 7.3 Checkout Process
- **Shipping Information:** Comprehensive customer details form
- **Order Summary:** Review items before payment
- **PayPal Integration:** Secure payment processing
- **Order Confirmation:** Success/failure feedback

### 7.4 Payment Processing
- **PayPal Smart Buttons:** Debit/credit card and PayPal wallet options
- **PCI Compliance:** Secure payment data handling
- **Order Status Tracking:** Pending → Completed status updates
- **Transaction Records:** Complete payment history in database

## 8. Implementation Details

### Frontend Implementation
- **Responsive Design:** Mobile-first approach with Bootstrap
- **Modular JavaScript:** Separate files for cart, checkout, and API logic
- **Event Handling:** Dynamic DOM manipulation and user interactions
- **Error Handling:** User-friendly error messages and validation

### Backend Implementation
- **Express Routing:** RESTful endpoint definitions
- **Database Queries:** Parameterized queries for security
- **PayPal SDK Integration:** Official PayPal JavaScript SDK usage
- **Environment Configuration:** Secure credential management

### Security Considerations
- **Input Validation:** Server-side validation of all inputs
- **SQL Injection Prevention:** Parameterized database queries
- **CORS Configuration:** Proper cross-origin request handling
- **Environment Variables:** Sensitive data stored securely

## 9. Setup and Installation

### Prerequisites
- Node.js (v14+)
- MySQL Server
- PayPal Developer Account

### Installation Steps

1. **Clone/Download Project Files**
   ```
   cd path/to/project
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Database Setup**
   ```bash
   mysql -u root -p < database.sql
   ```

4. **Environment Configuration**
   Update `.env` file with your credentials:
   ```
   DB_PASSWORD=your_mysql_password
   PAYPAL_CLIENT_ID=your_paypal_client_id
   PAYPAL_CLIENT_SECRET=your_paypal_client_secret
   ```

5. **Start Server**
   ```bash
   npm start
   ```

6. **Access Application**
   Open `http://localhost:3000` in browser

## 10. Project Workflow

### User Journey
1. **Browse Products:** User visits category pages or product catalog
2. **Add to Cart:** Items added to shopping cart with quantities
3. **Review Cart:** Cart sidebar shows items, quantities, and totals
4. **Checkout:** User fills shipping information
5. **Payment:** PayPal handles secure payment processing
6. **Confirmation:** Order completed with success message

### Technical Flow
1. **Frontend Request:** JavaScript fetches products from API
2. **Database Query:** Server queries MySQL for product data
3. **API Response:** JSON data returned to frontend
4. **Order Creation:** Customer data sent to create order
5. **PayPal Order:** Server creates PayPal order for payment
6. **Payment Capture:** PayPal processes payment and updates database

## 11. Challenges and Solutions

### Challenge 1: Frontend-Backend Integration
**Problem:** Connecting static HTML with dynamic API data  
**Solution:** Created modular JavaScript files for API communication

### Challenge 2: Payment Gateway Integration
**Problem:** Complex PayPal SDK implementation  
**Solution:** Used official PayPal documentation and SDK examples

### Challenge 3: Database Design
**Problem:** Modeling complex product specifications  
**Solution:** Used JSON column for flexible product specs

### Challenge 4: Cart Persistence
**Problem:** Maintaining cart across browser sessions  
**Solution:** Implemented localStorage with error handling

## 12. Testing and Validation

### Manual Testing Checklist
- [ ] Product catalog loads correctly
- [ ] Add to cart functionality works
- [ ] Cart persistence across page reloads
- [ ] Checkout form validation
- [ ] PayPal payment flow
- [ ] Order creation in database
- [ ] Payment status updates

### API Testing
- [ ] GET /api/products returns valid JSON
- [ ] POST /api/orders creates orders
- [ ] POST /api/orders/capture updates payment status

## 13. Future Enhancements

### Phase 2 Features
- **User Authentication:** Login/signup system
- **Order History:** Customer order tracking
- **Product Reviews:** User feedback system
- **Admin Panel:** Product and order management
- **Email Notifications:** Order confirmations
- **Inventory Management:** Stock level tracking

### Technical Improvements
- **Database Optimization:** Indexing and query optimization
- **Caching Layer:** Redis for performance improvement
- **API Documentation:** Swagger/OpenAPI specification
- **Testing Framework:** Unit and integration tests
- **Deployment:** Cloud hosting setup

## 14. Conclusion

The PCBUILDER e-commerce project successfully demonstrates a complete full-stack web application with modern technologies and best practices. The implementation covers all essential aspects of an online store including product management, shopping cart functionality, secure payment processing, and database persistence.

Key achievements:
- ✅ Complete 3-tier architecture implementation
- ✅ RESTful API development
- ✅ MySQL database design and integration
- ✅ PayPal payment gateway integration
- ✅ Responsive frontend with modern UI/UX
- ✅ Secure data handling and validation

The project provides a solid foundation for a production e-commerce platform and demonstrates proficiency in full-stack web development.

## 15. References

- [Express.js Documentation](https://expressjs.com/)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [PayPal Developer Documentation](https://developer.paypal.com/)
- [Bootstrap 5 Documentation](https://getbootstrap.com/docs/5.0/)
- [MDN Web Docs](https://developer.mozilla.org/)

---

**Prepared by:** [Your Name]  
**Date:** April 23, 2026  
**Project Repository:** [GitHub Link if applicable]