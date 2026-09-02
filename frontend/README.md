# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.

# PricePulse AI: Dynamic Pricing & Markdown Engine

An advanced, AI-driven dynamic pricing and inventory markdown engine built for independent e-commerce stores. It automates competitor price tracking, applies inventory-age rules, and optimizes product margins in real-time.

## 🚀 Key Features
* **Live Dashboard & Analytics:** Real-time visualization of pricing adaptation curves, competitor distributions, and historical performance using Recharts.
* **Competitor Scraping Integration:** Automated extraction and syncing of competitor market pricing[cite: 1].
* **Inventory-Age Based Rules:** Automated markdown triggers for aging stock past configurable thresholds (e.g., >30 days)[cite: 1].
* **AI-Suggested Pricing:** Intelligent pricing algorithms that balance profit margins with market competitiveness[cite: 1].
* **Enterprise UI/UX:** Built with React, Tailwind CSS, Lucide Icons, and FastAPI backend architecture.

## 🛠️ Tech Stack
* **Frontend:** React, Vite, Tailwind CSS, Recharts, Lucide React, Axios
* **Backend:** FastAPI, Python, Pydantic, Uvicorn
* **Database/Storage:** SQLite / PostgreSQL (with modular integration support)

## ⚙️ Installation & Setup

### 1. Clone the Repository & Setup Backend
```bash
cd backend
python -m venv venv
source venv/Scripts/activate  # On Windows
pip install -r requirements.txt
uvicorn main:app --reload
