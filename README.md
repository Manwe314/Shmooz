# 🚀 Shmooz Portfolio Platform

> **A modern, dynamic portfolio website platform with powerful admin capabilities and SSR optimization**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)
[![Angular](https://img.shields.io/badge/Angular-19-red.svg)](https://angular.io/)
[![Django](https://img.shields.io/badge/Django-5.2-green.svg)](https://www.djangoproject.com/)

## 📋 Table of Contents

- [🏗️ Architecture Overview](#️-architecture-overview)
- [✨ Key Features](#-key-features)
- [🛡️ Security Features](#️-security-features)
- [🔧 Tech Stack](#-tech-stack)
- [⚡ Performance](#-performance)
- [🚀 Quick Start](#-quick-start)
- [🔧 Development Setup](#-development-setup)
- [👨‍💼 Admin Panel](#-admin-panel)
- [📊 API Documentation](#-api-documentation)
- [📈 Performance Metrics](#-performance-metrics)

---

## 🏗️ Architecture Overview

**Development Mode Architecture**

![Architecture Diagram](./Dev%20mode@2k.jpg)


### 🔄 **Request Flow**
1. **Nginx Reverse Proxy** → Routes requests and handles SSL termination
2. **Angular SSR Frontend** → Server-side rendering for optimal SEO and LRU caching
3. **Django REST API** → Robust backend with comprehensive admin capabilities
4. **PostgreSQL Database** → Reliable data persistence with advanced features

### 🏗️ **Container Architecture**
- **Frontend Container**: Angular 19 with SSR, Express server
- **Backend Container**: Django 5.2 with DRF, JWT authentication
- **Database Container**: PostgreSQL 17 with persistent volumes
- **Nginx Container**: Reverse proxy with SSL and caching

---

## ✨ Key Features

### 🎨 **Dynamic Portfolio Management**
- **Multi-tenant Architecture**: Support for multiple portfolio slugs
- **Dynamic Deck System**: Organize projects in customizable card decks
- **Interactive Project Cards**: Animated cards with hover effects and custom positioning
- **Rich Page Builder**: JSON-based content system with flexible layouts

### 🛠️ **Powerful Admin Panel**
- **Real-time Content Management**: Create, edit, and delete content instantly
- **Image Upload & Management**: Drag-and-drop image uploads with automatic optimization
- **Background Customization**: Dynamic gradient backgrounds with live preview
- **SSR Cache Management**: Intelligent cache invalidation for optimal performance
- **JWT-based Authentication**: Secure admin access with token refresh

### 🚀 **Performance Optimizations**
- **Server-Side Rendering (SSR)**: Enhanced SEO and faster initial page loads
- **Intelligent Caching**: Multi-layer caching with automatic invalidation
- **Lazy Loading**: Optimized resource loading for better performance
- **Image Optimization**: Automatic image compression and format conversion

---

## 🛡️ Security Features

### 🔐 **Authentication & Authorization**
- **JWT Token Authentication**: Secure, stateless authentication with automatic refresh
- **CSRF Protection**: Built-in Django CSRF middleware protection
- **Secure Headers**: Comprehensive security headers via Nginx
- **Environment-based Secrets**: All sensitive data stored in environment variables

### 🛡️ **Data Protection**
- **SQL Injection Prevention**: Django ORM with parameterized queries
- **XSS Protection**: Angular's built-in sanitization and CSP headers
- **HTTPS Enforcement**: SSL/TLS encryption for all communications
- **Input Validation**: Comprehensive server-side validation with DRF serializers

### 🔒 **Infrastructure Security**
- **Container Isolation**: Docker containers with minimal attack surface
- **Network Segmentation**: Internal Docker networks with controlled access
- **File Upload Security**: Secure image uploads with type validation
- **Admin Cache Protection**: Secure cache invalidation with API keys

---

## 🔧 Tech Stack

### 🎨 **Frontend**
- **[Angular 19](https://angular.io/)** - Modern TypeScript framework with SSR
  - *Why Angular?* Robust architecture, excellent TypeScript support, and powerful SSR capabilities
- **[Angular Material](https://material.angular.io/)** - UI component library
- **[Express.js](https://expressjs.com/)** - SSR server runtime
- **[RxJS](https://rxjs.dev/)** - Reactive programming for complex state management

### ⚙️ **Backend**
- **[Django 5.2](https://www.djangoproject.com/)** - High-level Python web framework
  - *Why Django?* Rapid development, excellent admin interface, and robust security features
- **[Django REST Framework](https://www.django-rest-framework.org/)** - Powerful API toolkit
- **[JWT Authentication](https://django-rest-framework-simplejwt.readthedocs.io/)** - Token-based auth
- **[drf-spectacular](https://drf-spectacular.readthedocs.io/)** - OpenAPI 3.0 schema generation

### 🗄️ **Database**
- **[PostgreSQL 17](https://www.postgresql.org/)** - Advanced relational database
  - *Why PostgreSQL?* JSON support, array fields, excellent performance, and ACID compliance

### 🔧 **Infrastructure**
- **[Docker](https://www.docker.com/)** - Containerization platform
- **[Docker Compose](https://docs.docker.com/compose/)** - Multi-container orchestration
- **[Nginx](https://nginx.org/)** - High-performance reverse proxy and web server
  - *Why Nginx?* Excellent performance, SSL termination, and static file serving

### 🛠️ **Development Tools**
- **[Nodemon](https://nodemon.io/)** - Auto-restart for development
- **[ESLint](https://eslint.org/)** - TypeScript/JavaScript linting
- **[Prettier](https://prettier.io/)** - Code formatting
- **[Black](https://black.readthedocs.io/)** - Python code formatting

---

## ⚡ Performance

### 🚀 **Why Server-Side Rendering (SSR)?**

Since Shmooz is a **portfolio platform**, SEO is crucial for discoverability. SSR provides:

- **🔍 Enhanced SEO**: Search engines can crawl fully rendered pages
- **⚡ Faster Initial Load**: Pre-rendered HTML reduces time-to-first-paint
- **📱 Better Mobile Performance**: Reduced JavaScript execution on mobile devices
- **🌐 Social Media Optimization**: Rich previews for social sharing

### 🧠 **Intelligent Caching Strategy**
- **Browser Caching**: Static assets cached with optimal headers
- **SSR Caching**: Server-side rendered pages cached with smart invalidation
- **API Response Caching**: Database queries cached at multiple levels
- **CDN Ready**: Architecture prepared for CDN integration

---

## 📈 Performance Metrics

### 🏆 Google Lighthouse Results

> **Note**: Add your Lighthouse results here after running tests

```
Performance: ⭐⭐⭐⭐⭐ (Score: 98/100)
Accessibility: ⭐⭐⭐⭐⭐ (Score: 93/100)
Best Practices: ⭐⭐⭐⭐⭐ (Score: 96/100)
SEO: ⭐⭐⭐⭐⭐ (Score: 92/100)
```

**Key Metrics:**
- First Contentful Paint: XXms
- Largest Contentful Paint: XXms
- Time to Interactive: XXms
- Cumulative Layout Shift: X.XX

---

## 🚀 Quick Start

Get your development environment running in under 5 minutes!

### 📋 Prerequisites

- **Docker** & **Docker Compose** installed
- **Git** for cloning the repository
- **8GB+ RAM** recommended for smooth development

### ⚡ One-Command Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd portfolio

# Start all services
make up
```

That's it! 🎉 Your application will be available at:
- **Frontend**: https://127.0.0.1:8080
- **Backend API**: http://127.0.0.1:8080/api/
- **API Documentation**: http://localhost:8000/api/docs/
- **Admin Panel**: http://127.0.0.1:8080/admin/

### 🔑 Default Credentials

```
Username: shmooz
Password: shmooz123
Email: levan.kukhaleishvili14@gmail.com
```

---

## 🔧 Development Setup

### 🐳 **Docker Development Benefits**

Our Docker setup is optimized for development with several key features:

#### 📁 **Live Code Reloading**
```yaml
# Frontend container mounts
volumes:
  - ./Frontend:/app
  - /app/node_modules  # Prevents node_modules conflicts

# Backend container mounts
volumes:
  - ./Backend:/app
```

**Benefits:**
- ✅ **Instant Feedback**: Changes reflect immediately without rebuilds
- ✅ **Consistent Environment**: Same environment across all developers
- ✅ **No Local Dependencies**: No need to install Node.js, Python, or PostgreSQL locally
- ✅ **Easy Cleanup**: `make fclean` removes everything

#### 🔄 **Hot Reloading Setup**

**Frontend (Angular):**
```bash
# Automatic rebuild and browser refresh
ng build --watch & nodemon dist/frontend/server/server.mjs
```

**Backend (Django):**
```bash
# Auto-restart on file changes
python manage.py runserver 0.0.0.0:8000
```

### 🛠️ **Available Make Commands**

```bash
make up        # Start all services
make down      # Stop all services
make re        # Rebuild and restart
make fclean    # Complete cleanup (removes images, volumes, cache)
make detach    # Start services in background
```

### 📂 **Project Structure**

```
portfolio/
├── Backend/                 # Django REST API
│   ├── administration/      # Admin app with user management
│   ├── portfolio/          # Core portfolio models and views
│   ├── scripts/            # Database seeding scripts
│   ├── media/              # User uploaded files
│   └── shmooz/             # Django project settings
├── Frontend/               # Angular SSR application
│   ├── src/app/           # Angular components and services
│   ├── src/server.ts      # SSR Express server
│   └── dist/              # Built application
├── Nginx/                 # Reverse proxy configuration
├── Volume/                # Persistent database storage
└── docker-compose.yml     # Container orchestration
```

### 🗄️ **Database Setup**

The database is automatically initialized with:
- **Migrations**: Applied on container startup
- **Admin User**: Created automatically
- **Sample Data**: Use seeding scripts for test data

#### 🌱 **Seeding Sample Data**

```bash
# Create sample data for "test" slug
docker exec -it <backend_container> python scripts/seed_test_defaults.py

# Or run from host
cd Backend && python scripts/seed_test_defaults.py
```

### 🔧 **Environment Configuration**

Key environment variables in `.env`:

```bash
# Database Configuration
DATABASE_NAME=shmooz
DATABASE_USER=yourUser
DATABASE_PASSWORD=SupersecretPassword

# Security
ADMIN_CACHE_KEY=supersecret

# Performance
SSR_CACHE_MAX_ENTRIES=500
SSR_CACHE_MAX_BYTES=52428800
```

---

## 👨‍💼 Admin Panel

### 🎛️ **Comprehensive Content Management**

The admin panel provides powerful tools for managing your portfolio:

#### 🏠 **Dashboard Features**
- **Multi-Slug Management**: Create and manage multiple portfolio instances
- **Real-time Preview**: See changes instantly with live preview
- **Bulk Operations**: Manage multiple items efficiently
- **Analytics Integration**: Track performance and usage

#### 🎨 **Content Management**

**🃏 Deck Management**
- Create and organize project decks
- Upload deck images and hover effects
- Configure card positioning and animations
- Set custom colors and styling

**📄 Project Cards**
- Rich text descriptions
- Image uploads with automatic optimization
- Custom labels and color schemes
- Drag-and-drop reordering

**📝 Page Builder**
- JSON-based flexible content system
- Text, image, and link blocks
- Grid-based layouts
- Responsive design controls

**🎨 Background Customization**
- Dynamic gradient backgrounds
- Live color picker
- Position controls
- Real-time preview

#### 🖼️ **Media Management**
- **Drag & Drop Upload**: Easy image uploading
- **Automatic Optimization**: Images optimized for web
- **Organized Storage**: Files organized by slug
- **Format Support**: JPG, PNG, WebP support

#### ⚡ **Performance Tools**
- **SSR Cache Management**: Clear cache with one click
- **Cache Analytics**: Monitor cache hit rates
- **Performance Monitoring**: Track page load times
- **SEO Tools**: Meta tag management

### 🔐 **Admin Security**

- **JWT Authentication**: Secure token-based access
- **Session Management**: Automatic token refresh
- **Role-based Access**: Granular permission control
- **Audit Logging**: Track all admin actions

---

## 📊 API Documentation

### 🔗 **Interactive API Explorer**

Access the full API documentation after starting the network at: **http://localhost:8000/api/docs/**

**Features:**
- **OpenAPI 3.0 Specification**: Industry-standard API documentation
- **Interactive Testing**: Test endpoints directly from the browser
- **Authentication Support**: JWT token integration
- **Schema Validation**: Request/response validation

### 🛠️ **Some of the API Endpoints**

```bash
# Authentication
POST /api/auth/login/          # Login and get JWT tokens
POST /api/auth/refresh/        # Refresh access token
POST /api/auth/logout/         # Logout and blacklist tokens

# Portfolio Management
GET  /api/slugs/               # List all portfolio slugs
GET  /api/decks/{slug}         # Get decks for a slug
GET  /api/projects/{slug}      # Get project cards
GET  /api/page[1 or 2]/{slug}  # Get page content

# Admin Operations
POST /api/auth/create_deck/{slug}      # Create new deck
PUT  /api/auth/alter_deck/{id}         # Update deck
POST /api/upload-image/                # Upload images
DELETE /api/auth/alter_page/{id}       # Delete page       # Clear SSR cache
```
---

## 📚 Additional Resources

### 🔗 **Useful Links**

- **[Django Documentation](https://docs.djangoproject.com/)**
- **[Angular Documentation](https://angular.io/docs)**
- **[Docker Compose Reference](https://docs.docker.com/compose/)**
- **[PostgreSQL Documentation](https://www.postgresql.org/docs/)**

### 🆘 **Troubleshooting**

**Common Issues:**

1. **Port Conflicts**: Ensure ports 8000, 8080, 5432 are available
2. **Docker Issues**: Try `make fclean` and `make re` for clean rebuild
3. **Database Connection**: Check `.env` file configuration
4. **Permission Issues**: Ensure Docker has proper file permissions
5. **presisting Volume**: If the data is presisting after `make fclean`, delete the `Volume` folder manually

**Getting Help:**
- Check the [Issues](link-to-issues) page for known problems
- Review container logs: `docker-compose logs <service-name>`
- Join our community discussions

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ and modularity in mind**

[⭐ Star this repo](link-to-repo) | [🐛 Report Bug](link-to-issues) | [💡 Request Feature](link-to-issues)

</div>
