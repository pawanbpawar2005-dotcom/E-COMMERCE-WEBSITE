-- Create database
CREATE DATABASE IF NOT EXISTS ecom_db;
USE ecom_db;

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  category VARCHAR(50),
  specs JSON,
  in_stock BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
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

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Insert sample products
INSERT INTO products (name, price, image_url, category, specs, in_stock) VALUES
('Intel Core i5-12400F', 13690.00, 'https://imgs.search.brave.com/IguDIZ3UUyroqzGAGyaS74FSgimD49LSAl1rg4FKFNQ/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9maWxl/LmhzdGF0aWMubmV0/LzEwMDAwMjY3MTYv/ZmlsZS9nZWFydm4t/aW50ZWxfY29yZV9p/NV8xMjQwMGYtM18x/NjY4ODgyNWUwYzA0/NGI0OGNhMDUwYzkx/MmNmY2EwOS5wbmc', 'CPU', '{"Cores": "6", "Threads": "12", "Base Clock": "2.5 GHz"}', true),
('Intel Core i7-12700K', 32990.00, 'https://via.placeholder.com/300x200?text=Intel+Core+i7-12700K', 'CPU', '{"Cores": "12", "Threads": "20", "Base Clock": "3.6 GHz"}', true),
('AMD Ryzen 5 5600X', 15500.00, 'https://via.placeholder.com/300x200?text=AMD+Ryzen+5+5600X', 'CPU', '{"Cores": "6", "Threads": "12", "Base Clock": "3.7 GHz"}', true),
('AMD Ryzen 7 5800X3D', 28900.00, 'https://via.placeholder.com/300x200?text=AMD+Ryzen+7+5800X3D', 'CPU', '{"Cores": "8", "Threads": "16", "Base Clock": "3.4 GHz"}', false),
('Intel Core i9-12900K', 52990.00, 'https://via.placeholder.com/300x200?text=Intel+Core+i9-12900K', 'CPU', '{"Cores": "16", "Threads": "24", "Base Clock": "3.2 GHz"}', true),
('AMD Ryzen 9 5900X', 45900.00, 'https://via.placeholder.com/300x200?text=AMD+Ryzen+9+5900X', 'CPU', '{"Cores": "12", "Threads": "24", "Base Clock": "3.7 GHz"}', false),
('NVIDIA RTX 4060', 29990.00, 'https://via.placeholder.com/300x200?text=NVIDIA+RTX+4060', 'GPU', '{"VRAM": "8GB GDDR6", "Base Clock": "1830 MHz"}', true),
('NVIDIA RTX 4070', 49990.00, 'https://via.placeholder.com/300x200?text=NVIDIA+RTX+4070', 'GPU', '{"VRAM": "12GB GDDR6X", "Base Clock": "1920 MHz"}', true),
('AMD RX 7600', 24990.00, 'https://via.placeholder.com/300x200?text=AMD+RX+7600', 'GPU', '{"VRAM": "8GB GDDR6", "Base Clock": "2250 MHz"}', false),
('NVIDIA RTX 4080', 89990.00, 'https://via.placeholder.com/300x200?text=NVIDIA+RTX+4080', 'GPU', '{"VRAM": "16GB GDDR6X", "Base Clock": "2205 MHz"}', true),
('AMD RX 7800 XT', 49990.00, 'https://via.placeholder.com/300x200?text=AMD+RX+7800+XT', 'GPU', '{"VRAM": "16GB GDDR6", "Base Clock": "1295 MHz"}', true),
('NVIDIA RTX 4090', 149990.00, 'https://via.placeholder.com/300x200?text=NVIDIA+RTX+4090', 'GPU', '{"VRAM": "24GB GDDR6X", "Base Clock": "2235 MHz"}', false),
('MSI B450 TOMAHAWK MAX', 8990.00, 'https://via.placeholder.com/300x200?text=MSI+B450+TOMAHAWK+MAX', 'Motherboard', '{"Socket": "AM4", "Chipset": "B450", "Form Factor": "ATX"}', true),
('ASUS ROG STRIX B550-F', 15990.00, 'https://via.placeholder.com/300x200?text=ASUS+ROG+STRIX+B550-F', 'Motherboard', '{"Socket": "AM4", "Chipset": "B550", "Form Factor": "ATX"}', true),
('MSI MAG Z690 TOMAHAWK', 22990.00, 'https://via.placeholder.com/300x200?text=MSI+MAG+Z690+TOMAHAWK', 'Motherboard', '{"Socket": "LGA1700", "Chipset": "Z690", "Form Factor": "ATX"}', false),
('ASUS ROG CROSSHAIR X570', 29990.00, 'https://via.placeholder.com/300x200?text=ASUS+ROG+CROSSHAIR+X570', 'Motherboard', '{"Socket": "AM4", "Chipset": "X570", "Form Factor": "ATX"}', true),
('Gigabyte Z790 AORUS ELITE', 34990.00, 'https://via.placeholder.com/300x200?text=Gigabyte+Z790+AORUS+ELITE', 'Motherboard', '{"Socket": "LGA1700", "Chipset": "Z790", "Form Factor": "ATX"}', true),
('ASRock B650M PRO RS', 12990.00, 'https://via.placeholder.com/300x200?text=ASRock+B650M+PRO+RS', 'Motherboard', '{"Socket": "AM5", "Chipset": "B650", "Form Factor": "Micro-ATX"}', true),
('Corsair Vengeance LPX 8GB DDR4', 2990.00, 'https://via.placeholder.com/300x200?text=Corsair+Vengeance+LPX+8GB+DDR4', 'RAM', '{"Capacity": "8GB", "Speed": "3200MHz", "Type": "DDR4"}', true),
('G.Skill Ripjaws V 16GB DDR4', 5990.00, 'https://via.placeholder.com/300x200?text=G.Skill+Ripjaws+V+16GB+DDR4', 'RAM', '{"Capacity": "16GB", "Speed": "3600MHz", "Type": "DDR4"}', true),
('Kingston HyperX Fury 32GB DDR4', 10990.00, 'https://via.placeholder.com/300x200?text=Kingston+HyperX+Fury+32GB+DDR4', 'RAM', '{"Capacity": "32GB", "Speed": "3200MHz", "Type": "DDR4"}', true),
('Corsair Vengeance 16GB DDR5', 7990.00, 'https://via.placeholder.com/300x200?text=Corsair+Vengeance+16GB+DDR5', 'RAM', '{"Capacity": "16GB", "Speed": "5200MHz", "Type": "DDR5"}', false),
('TeamGroup T-Force Delta RGB 32GB DDR5', 15990.00, 'https://via.placeholder.com/300x200?text=TeamGroup+T-Force+Delta+RGB+32GB+DDR5', 'RAM', '{"Capacity": "32GB", "Speed": "6000MHz", "Type": "DDR5"}', true),
('G.Skill Trident Z RGB 64GB DDR4', 24990.00, 'https://via.placeholder.com/300x200?text=G.Skill+Trident+Z+RGB+64GB+DDR4', 'RAM', '{"Capacity": "64GB", "Speed": "3200MHz", "Type": "DDR4"}', true),
('Samsung 870 EVO 500GB SATA SSD', 5990.00, 'https://via.placeholder.com/300x200?text=Samsung+870+EVO+500GB+SATA+SSD', 'Storage', '{"Capacity": "500GB", "Type": "SATA SSD", "Read Speed": "560MB/s"}', true),
('WD Blue SN570 1TB NVMe SSD', 3990.00, 'https://via.placeholder.com/300x200?text=WD+Blue+SN570+1TB+NVMe+SSD', 'Storage', '{"Capacity": "1TB", "Type": "NVMe SSD", "Read Speed": "3500MB/s"}', true),
('Seagate Barracuda 2TB HDD', 6990.00, 'https://via.placeholder.com/300x200?text=Seagate+Barracuda+2TB+HDD', 'Storage', '{"Capacity": "2TB", "Type": "HDD", "RPM": "7200"}', true),
('Crucial P5 Plus 1TB NVMe SSD', 8990.00, 'https://via.placeholder.com/300x200?text=Crucial+P5+Plus+1TB+NVMe+SSD', 'Storage', '{"Capacity": "1TB", "Type": "NVMe SSD", "Read Speed": "6600MB/s"}', true),
('WD Blue 4TB HDD', 19990.00, 'https://via.placeholder.com/300x200?text=WD+Blue+4TB+HDD', 'Storage', '{"Capacity": "4TB", "Type": "HDD", "RPM": "5400"}', true),
('Kingston NV2 2TB NVMe SSD', 14990.00, 'https://via.placeholder.com/300x200?text=Kingston+NV2+2TB+NVMe+SSD', 'Storage', '{"Capacity": "2TB", "Type": "NVMe SSD", "Read Speed": "3500MB/s"}', true),
('Corsair CV450 450W 80+ Bronze', 8990.00, 'https://via.placeholder.com/300x200?text=Corsair+CV450+450W+80%2B+Bronze', 'PSU', '{"Wattage": "450W", "Efficiency": "80+ Bronze", "Modularity": "Non-Modular"}', true),
('Seasonic S12III 650W 80+ Bronze', 11990.00, 'https://via.placeholder.com/300x200?text=Seasonic+S12III+650W+80%2B+Bronze', 'PSU', '{"Wattage": "650W", "Efficiency": "80+ Bronze", "Modularity": "Non-Modular"}', true),
('Corsair RM750x 750W 80+ Gold', 9990.00, 'https://via.placeholder.com/300x200?text=Corsair+RM750x+750W+80%2B+Gold', 'PSU', '{"Wattage": "750W", "Efficiency": "80+ Gold", "Modularity": "Full Modular"}', true),
('EVGA SuperNOVA 850W 80+ Gold', 19990.00, 'https://via.placeholder.com/300x200?text=EVGA+SuperNOVA+850W+80%2B+Gold', 'PSU', '{"Wattage": "850W", "Efficiency": "80+ Gold", "Modularity": "Full Modular"}', true),
('Seasonic Prime TX-1000 1000W 80+ Titanium', 17990.00, 'https://via.placeholder.com/300x200?text=Seasonic+Prime+TX-1000+1000W+80%2B+Titanium', 'PSU', '{"Wattage": "1000W", "Efficiency": "80+ Titanium", "Modularity": "Full Modular"}', true),
('Cooler Master MWE 600W 80+ Bronze', 6990.00, 'https://via.placeholder.com/300x200?text=Cooler+Master+MWE+600W+80%2B+Bronze', 'PSU', '{"Wattage": "600W", "Efficiency": "80+ Bronze", "Modularity": "Non-Modular"}', true);
