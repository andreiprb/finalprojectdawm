# DAWM Final Project - Projects Dashboard

## Project Overview

This is a full-stack Angular application that allows users to register, login, and manage their project entries in a comprehensive dashboard. The application features secure authentication with "Remember Me" functionality, real-time data management with Supabase backend, and a rich user interface built with NgZorro components.

## Architecture

The application follows Angular best practices with standalone components, lazy loading, and service-based architecture. It uses Supabase as the backend for authentication and data persistence, providing a real-world database experience rather than a mock API.

### Authentication System
- **Login Form**: Email and password authentication with "Remember Me" checkbox functionality that persists user sessions across browser restarts
- **Registration Form**: Complete user registration with email, password, confirm password, first name, and last name fields
- **Custom Validators**: Implemented strong password validation requiring minimum 6 characters with uppercase, lowercase, numeric, and special characters. Additional validators for email format, email uniqueness checking, password confirmation matching, and name validation
- **Route Protection**: Unauthenticated users can only access the login page, which becomes hidden after successful authentication

### Lazy Loading Architecture
- **Full Lazy Loading**: All components are dynamically imported and loaded only when their routes are accessed, improving initial application load times

### Component Communication
- **@Input/@Output**: Implemented in the entry modal component for parent-child communication
- **Services**: Three main services handle authentication (AuthService), data management (DataService), and database connections (DatabaseService)

### Data Management System
- **6-Column Table**: Displays project entries with Name, Description, Date, Repository Link, Visit Link, and Actions columns
- **Modal Forms**: Add and edit functionality through validated modal forms with comprehensive field validation
- **Real-time Search**: Debounced search functionality across multiple fields with highlighted results
- **Delete Operations**: Confirmation-based deletion with immediate UI updates
- **Multi-column Sorting**: Three-state sorting (ascending, descending, unsorted) for all table columns with visual indicators

### Modern Angular Features
- **Signals**: Utilized Angular's signal system for reactive state management, particularly for table data, loading states, search terms, and sorting configuration

### UI Library Integration
- **NgZorro**: Complete integration of NgZorro UI components including forms, tables, modals, buttons, layouts, and navigation elements providing a professional, consistent design
