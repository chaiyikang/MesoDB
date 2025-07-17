# Gemini Project Configuration (`GEMINI.md`)

This file provides project-specific context to the Gemini agent to help it generate more accurate and relevant responses.

---

## 1. Project Overview

-   **Project Name:** MesoDB
-   **Description:** A customised price tracker, where the user can input csv data and view their accumulated data and view summaries of prices of different items
-   **Goals:**
    -   User should be able to upload csv files, and the rows will be added into the table in the app, or created if it is the user's first time using the app.
    -   User should be able to execute basic table functions like search, sort, filter
    -   For each item, the user should be able to see a price over time graph.

---

## 2. Tech Stack & Dependencies

-   **Primary Language:** JavaScript
-   **Frameworks / Runtimes:** Next.js, styled with TailwindCSS and backend with Supabase
-   **Package Manager:** npm

---

## 3. Project Commands

-   **Install Dependencies:** `npm install`
-   **Run (Development):** `npm run dev`
-   **Build (Production):** `npm run build`
-   **Start (Production):** `npm run start`
-   **Lint:** `npm run lint`

---

## 4. Key Directories & Files

-   `src/app/`: Main application source code (App Router).
-   `src/app/page.js`: The main page of the application.
-   `src/app/layout.js`: The main layout of the application.
-   `public/`: Static assets.
-   `next.config.js`: Next.js configuration file.
-   `tailwind.config.js`: Tailwind CSS configuration file.
-   `package.json`: Project dependencies and scripts.

---

## 5. Coding Conventions & Style

-   **Formatting:** Prettier (included with Next.js)
-   **Naming Conventions:** camelCase for variables, PascalCase for components.
-   **Comments:** "Explain _why_, not _what_. Add comments for complex or non-obvious logic."
-   **Typing:** JSDoc for type annotations.

---

## 6. Architectural Patterns

-   **Overall Architecture:** App Router
-   **API Style:** RESTful (using Next.js API Routes)

---

## 7. Additional Notes

-   The programmer is a Year 1 Computer Science student with previous experience developing a web app with React, Tailwind and Supabase. However, I am quite rusty and have forgotten most of it. I have played around with Next.js before, but I have never built an actual project with it before. As you build the project, it should be educational. Explain complex code or architecture and complement code with comments where appropriate.
