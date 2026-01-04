# FinManagementApp (FMA)

FMA is a premium financial planning and management application built with React, Vite, and TypeScript. It offers a powerful "Plan first, track second" philosophy, allowing users to project their future finances with precision and ease.

## 🚀 Key Features

- **Dynamic Financial Planning**: Monthly and yearly views with support for mixed currencies (**VND, USD, AUD**).
- **Intelligent Dashboard**: Real-time visual summaries using charts for category breakdown, monthly overview, and top expenses.
- **Currency Conversion**: Automatic exchange rates via CurrencyFreaks API with 24-hour local caching.
- **AI-Powered Insights**: Integrated AI capabilities for financial analysis and automated planning.
- **Premium UI/UX**: Modern "Glassmorphism" aesthetic with dark mode support, smooth animations, and a responsive layout.
- **Internationalization**: Full bilingual support (English & Vietnamese) powered by a custom CSV-based i18n system.
- **Offline First**: Local storage persistence ensuring your data remains private and accessible.

## 🛠 Tech Stack

- **Frontend**: React 19, Vite, TypeScript
- **Styling**: Tailwind CSS, Lucide icons
- **Charts**: Recharts
- **State & Context**: Custom React Providers (I18n, Currency)
- **Development**: ESLint, PostCSS

## 📂 Project Structure

- `src/components`: UI components organized by feature (Plan, Dashboard, Admin, UI primitives).
- `src/services`: Business logic for calculations, currency conversion, and AI integration.
- `src/providers`: Global application state (Context API).
- `src/hooks`: Custom React hooks for translations and data management.
- `src/types`: Centralized TypeScript interfaces.
- `i18n/`: Translation source files in CSV format.
- `scripts/`: Development utilities (e.g., translation validation).

## 🚦 Getting Started

### Prerequisites

- Node.js (Latest LTS recommended)
- `npm` or `yarn` or `pnpm`

### Installation

1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the root and add your API keys:
    ```env
    VITE_CURRENCY_FREAK_API_KEY=your_api_key_here
    VITE_OPENAI_API_KEY=your_openai_key_here
    ```

### Development

Run the development server:
```bash
npm run dev
```

### Build

Create a production bundle:
```bash
npm run build

## 📄 License

Private - All rights reserved.
