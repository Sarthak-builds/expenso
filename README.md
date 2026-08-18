# Expenso

A cross-platform personal finance application built around structured transaction management, local data handling, and a modular React Native architecture.

## Overview

Expenso is designed to provide a structured interface for recording, organizing, and analyzing personal financial activity.

The application is implemented as a native-first mobile system using Expo and React Native, with application state and data access separated from presentation concerns.

## Architecture

The application uses a modular architecture composed of:

- Expo Router for file-based navigation
- Zustand for client-side state management
- TanStack Query for asynchronous server-state management
- MMKV for high-performance local persistence
- React Native primitives for reusable interface components
- NativeWind for utility-oriented styling

The architecture separates navigation, UI composition, application state, and data access to keep feature development independently maintainable.

## Core Capabilities

- Transaction management
- Financial categorization
- Structured financial data representation
- Local persistence
- Asynchronous data synchronization
- Native mobile navigation
- Responsive mobile interfaces

## Engineering

The project emphasizes:

- Predictable state boundaries
- Local-first data handling
- Query caching and synchronization
- Reusable component primitives
- Type-safe application development
- Modular feature organization

## Build System

The project uses Expo development builds and EAS for Android build pipelines.

```bash
pnpm install
pnpm start
