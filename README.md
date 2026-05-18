# WatchBuddy 🕰️

## Description

WatchBuddy is a full-stack web application built with Next.js, designed to manage and synchronize watch schedules or activities. It utilizes modern authentication mechanisms (NextAuth), Neon DB (serverless PostgreSQL) for persistent data storage, and Upstash Redis for rate limiting and caching. The app also integrates with the TMDB API for movie and TV metadata. This codebase provides the foundation for tracking, scheduling, and viewing watch-related information across users.

## Features Overview

*   **User Authentication:** Secure user sign-up, login, and session management using NextAuth.
*   **Database Integration:** Persistent data storage and retrieval via Neon DB (serverless PostgreSQL), using the `pg` package.
*   **Rate Limiting / Caching:** Upstash Redis for serverless caching and API rate limiting.
*   **External API:** TMDB (The Movie Database) integration for movie and TV show metadata.
*   **Scheduling/Tracking:** Core logic for managing watch schedules or related activities.
*   **Frontend:** Modern, reactive user interface built with React and Tailwind CSS.

## Prerequisites

Before running the application, ensure you have the following installed:

*   Node.js (LTS recommended)
*   npm or yarn

                                                                                                                                                                                              
✨ Core Functionality                                                                                                                                                                             
                                                                                                                                                                                                 
 The primary goal of the application is to provide persistent storage, secure user access, and an interactive interface for users to track and manage shared or personal watch-related data.       
                                                                                                                                                                                                   
### Key Components & Features:                                                                                                                                                                    
⚙️ Technology Stack Overview                                                                                                                                                                      
 
 
| Layer | Technology | Purpose | Key Packages |
|---|---|---|---|
| Frontend/Framework | Next.js (React) | Full-stack web framework providing SSR, routing, and API endpoints. | next, react, react-dom |
| Styling | Tailwind CSS / PostCSS | Utility-first CSS framework for rapid responsive UI development. | @tailwindcss/postcss |
| Authentication | NextAuth | Secure sign-in, sessions, and auth providers. | next-auth |
| Database | Neon DB (Serverless PostgreSQL) | Serverless PostgreSQL with connection pooling. | pg, @types/pg |
| Caching / Rate Limiting | Upstash Redis | Serverless Redis for rate limiting and caching. | @upstash/redis, @upstash/ratelimit |
| External API | TMDB (The Movie Database) | Movie and TV show metadata via TMDB API. | — |
| Analytics | Vercel Analytics | Privacy-first web analytics. | @vercel/analytics |
| Security & Utility | bcrypt, jose | Password hashing and JWT handling. | bcrypt, jose |
                                                                                                                                                                                                   
 📂 Project Structure Analysis                                                                                                                                                                     
                                                                                                                                                                                                   
 - app/: This is the main directory containing all Next.js routing logic and component structures, defining the application's views and pages.                                                     
 - next.config.ts / tsconfig.json: Standard configuration files for optimizing the build process (TypeScript) and configuring Next.js behavior.                                                    
 - .env (Setup required): This file is crucial as it stores sensitive environmental variables, notably the database connection string (DATABASE_URL) and the secure NextAuth secrets.              
                                                                                                                                                                                                   
 🚀 In Summary                                                                                                                                                                                     
                                                                                                                                                                                                   
 WatchBuddy is not just a static website; it's a fully functional, secured web application capable of handling user accounts, persistent scheduling data via a Neon DB (serverless PostgreSQL) backend, API rate limiting via Upstash Redis, and movie/TV metadata via TMDB — making it    
 suitable for a real-world deployment tracking shared or individual watch schedules.                                                                                                               

