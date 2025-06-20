# DAWM Final Project - Projects Dashboard

A modern Angular application featuring user authentication and project management capabilities, built with Angular standalone components and NgZorro UI library.

## 🎯 Project Overview

This is a full-stack Angular application that allows users to register, login, and manage their project entries in a comprehensive dashboard. The application features secure authentication with "Remember Me" functionality, real-time data management with Supabase backend, and a rich user interface built with NgZorro components.

## 🏗️ Architecture

The application follows Angular best practices with standalone components, lazy loading, and service-based architecture. It uses Supabase as the backend for authentication and data persistence, providing a real-world database experience rather than a mock API.

## ✅ Requirements Implementation

### Authentication System (2.5 points)
- **Login Form**: Email and password authentication with "Remember Me" checkbox functionality that persists user sessions across browser restarts
- **Registration Form**: Complete user registration with email, password, confirm password, first name, and last name fields
- **Custom Validators**: Implemented strong password validation requiring minimum 6 characters with uppercase, lowercase, numeric, and special characters. Additional validators for email format, email uniqueness checking, password confirmation matching, and name validation
- **Route Protection**: Unauthenticated users can only access the login page, which becomes hidden after successful authentication

### Lazy Loading Architecture (0.5 points)
- **Full Lazy Loading**: All components are dynamically imported and loaded only when their routes are accessed, improving initial application load times

### Component Communication (0.5 points)
- **@Input/@Output**: Implemented in the entry modal component for parent-child communication
- **Services**: Three main services handle authentication (AuthService), data management (DataService), and database connections (DatabaseService)

### Data Management System (3 points)
- **6-Column Table**: Displays project entries with Name, Description, Date, Repository Link, Visit Link, and Actions columns
- **Modal Forms**: Add and edit functionality through validated modal forms with comprehensive field validation
- **Real-time Search**: Debounced search functionality across multiple fields with highlighted results
- **Delete Operations**: Confirmation-based deletion with immediate UI updates
- **Multi-column Sorting**: Three-state sorting (ascending, descending, unsorted) for all table columns with visual indicators

### Modern Angular Features (0.5 points)
- **Signals**: Utilized Angular's signal system for reactive state management, particularly for table data, loading states, search terms, and sorting configuration

### UI Library Integration (1 point)
- **NgZorro**: Complete integration of NgZorro UI components including forms, tables, modals, buttons, layouts, and navigation elements providing a professional, consistent design

### Code Quality (0.5 points)
- **Clean Architecture**: Proper separation of concerns with dedicated components, services, and guards
- **TypeScript**: Strong typing throughout the application with interfaces and proper error handling

### User Experience (0.5 points)
- **Responsive Design**: Mobile-friendly interface with proper spacing and layout
- **Visual Feedback**: Loading states, success/error messages, and intuitive user interactions
- **Professional Appearance**: Clean, modern design without bugs or visual inconsistencies

## 🎁 Bonus Features

### Real Backend Integration (0.5 points)
- **Supabase Integration**: Connected to Supabase backend providing real authentication, user management, and data persistence instead of using fake APIs

### Advanced Functionality (0.5 points)
- **Session Management**: Sophisticated session handling with localStorage/sessionStorage strategy based on "Remember Me" preference
- **Real-time Updates**: Immediate UI updates after CRUD operations without page refreshes

### Additional Libraries (0.5 points)
- **RxJS**: Advanced reactive programming with observables for authentication state, data streaming, and form interactions
- **Custom Storage Adapter**: Custom implementation for flexible session storage management

## 🚀 Technical Highlights

- **Standalone Components**: Modern Angular architecture with standalone components
- **Reactive Forms**: Comprehensive form validation with custom validators
- **Route Guards**: Secure navigation with authentication and login guards
- **State Management**: Signal-based reactive state management
- **Error Handling**: Robust error handling throughout the application
- **TypeScript**: Full TypeScript implementation with proper interfaces and typing

## 📋 Features Summary

The application successfully demonstrates modern Angular development practices while meeting all course requirements. Users can register and authenticate, manage their project entries through a sophisticated dashboard, and enjoy a professional user experience with real-time data updates and comprehensive CRUD operations.
