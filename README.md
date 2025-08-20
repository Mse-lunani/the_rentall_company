# 🏠 The Rentall Company - Property Management Dashboard

A comprehensive property management system built with Next.js, designed to streamline rental property operations with modern UI/UX and powerful data management capabilities.

## ✨ Features

### 🏢 Property Management
- **Building Management**: Add, edit, and view property buildings with detailed information
- **Unit Management**: Comprehensive unit tracking with occupancy status and tenant information
- **Owner Assignment**: Flexible owner assignment system for properties and individual units
- **Standalone Units**: Support for individual units not tied to specific buildings

### 👥 User Management
- **Tenant Management**: Complete tenant profiles with contact information and lease details
- **Owner Management**: Property owner database with contact and verification details
- **Admin Dashboard**: Secure admin panel for system management

### 💰 Financial Tracking
- **Payment Records**: Track rental payments with detailed transaction history
- **Payment Analytics**: Visual dashboards showing payment trends and statistics
- **Export Capabilities**: Export financial data in multiple formats (CSV, Excel, PDF)

### 🔧 Maintenance Management
- **Maintenance Logs**: Track property maintenance requests and completion status
- **Cost Management**: Monitor maintenance costs and budget allocation
- **Image Documentation**: Photo documentation for maintenance records

### 📊 Analytics & Reporting
- **Interactive Dashboards**: Modern charts showing key performance indicators
- **Occupancy Analytics**: Unit occupancy rates by building
- **Payment Trends**: Monthly payment tracking with trend analysis
- **Export Reports**: Generate and export comprehensive reports

### 📱 Modern UI/UX
- **Responsive Design**: Mobile-first design that works on all devices
- **DataTables Integration**: Advanced table features with search, sort, and pagination
- **Expandable Rows**: Responsive tables with expandable detail views
- **Modern Charts**: Glassmorphism design with gradient colors and animations
- **Icon-based Actions**: Clean, intuitive interface with icon-only action buttons

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/the_rentall_company.git
   cd the_rentall_company
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:
   ```env
   DATABASE_URL="your_postgresql_connection_string"
   NEXTAUTH_SECRET="your_nextauth_secret"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Database Setup**
   Run the database schema:
   ```bash
   psql -d your_database < schema.sql
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open the application**
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser

## 🛠️ Built With

### Core Technologies
- **[Next.js 15](https://nextjs.org/)** - React framework with App Router
- **[React 19](https://react.dev/)** - Modern React with latest features
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe development
- **[PostgreSQL](https://postgresql.org/)** - Robust database system

### UI/UX Libraries
- **[Bootstrap 5](https://getbootstrap.com/)** - Responsive CSS framework
- **[Chart.js](https://www.chartjs.org/)** - Interactive charts and graphs
- **[DataTables](https://datatables.net/)** - Advanced table functionality
- **[Boxicons](https://boxicons.com/)** - Modern icon library

### Development Tools
- **[Playwright](https://playwright.dev/)** - End-to-end testing framework
- **[ESLint](https://eslint.org/)** - Code linting and formatting
- **Custom CSS** - Modern glassmorphism and responsive design

## 📋 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Testing
npm test             # Run Playwright tests
npm run test:headed  # Run tests with browser UI
npm run test:ui      # Interactive test runner
```

## 🏗️ Project Structure

```
src/
├── app/
│   ├── (dashboard)/
│   │   └── dashboard/           # Main dashboard pages
│   │       ├── components/      # Shared dashboard components
│   │       ├── property_records/ # Property management
│   │       ├── units/           # Unit management
│   │       ├── tenants/         # Tenant management
│   │       ├── owners/          # Owner management
│   │       ├── payments/        # Payment tracking
│   │       ├── maintenance/     # Maintenance logs
│   │       └── styles/          # Custom CSS styles
│   ├── api/                     # API routes
│   └── (main)/                  # Public pages
├── components/                  # Shared components
└── lib/                        # Utility functions

public/
├── assets/                     # Static assets
├── js/                        # JavaScript libraries
└── scss/                      # SCSS stylesheets

tests/                         # Playwright test files
```

## 🔐 Database Schema

The system uses PostgreSQL with the following main tables:
- `admins` - System administrators
- `owners` - Property owners
- `buildings` - Property buildings
- `units` - Individual rental units
- `tenants` - Tenant information
- `payments` - Payment records
- `maintenance_logs` - Maintenance tracking
- `leases` - Lease agreements

## 🎨 Key Features Implemented

### Responsive Data Tables
- **Expandable Rows**: Click `+` button to view hidden columns on mobile
- **Export Options**: Print, CSV, Excel, PDF export capabilities
- **Search & Filter**: Real-time search across all table data
- **Pagination**: Customizable page sizes and navigation

### Modern Dashboard
- **KPI Cards**: Key performance indicators with visual icons
- **Interactive Charts**: Glassmorphism design with hover effects
- **Mobile Responsive**: Optimized for all screen sizes
- **Real-time Data**: Dynamic updates from the database

### User Experience
- **Hamburger Menu**: Mobile-friendly navigation
- **Icon Actions**: Space-efficient action buttons
- **Loading States**: Smooth loading animations
- **Error Handling**: User-friendly error messages

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy with automatic builds on push

### Manual Deployment
```bash
npm run build
npm run start
```

## 📝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Live Demo**: [Your deployed application URL]
- **Documentation**: [Additional documentation links]
- **Issues**: [GitHub Issues page]

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Contact: [your-email@example.com]

---

Built with ❤️ using Next.js and modern web technologies.
