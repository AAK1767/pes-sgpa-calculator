# 🎓 PES Universal SGPA Calculator

<div align="center">

![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**A powerful, offline-first SGPA/CGPA calculator built for PES University students.**
*Also works for VTU, IIT, and any custom grading scheme!*

[Live Demo](https://pes-sgpa-calculator.vercel.app) · [Report Bug](https://github.com/aak1767/pes-sgpa-calculator/issues) · [Request Feature](https://github.com/aak1767/pes-sgpa-calculator/issues)

</div>

---

## 📑 Table of Contents

- [✨ Features](#-features)
  - [🎯 Core Functionality](#-core-functionality)
  - [🎓 PESU Academy Portal Integration](#-pesu-academy-portal-integration)
  - [🔧 Advanced Tools](#-advanced-tools)
  - [💾 Quality of Life](#-quality-of-life)
  - [🦅 Companion Tools](#-companion-tools)
  - [🎓 Comprehensive Preset Support](#-comprehensive-preset-support)
- [🚀 Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Build for Production](#build-for-production)
- [📖 User Guide](#-user-guide)
  - [Tab Overview](#tab-overview)
  - [Presets Overview](#presets-overview)
  - [Quick Start](#quick-start)
  - [Keyboard Shortcuts](#keyboard-shortcuts)
  - [Understanding "Momentum"](#understanding-momentum)
  - [Custom Templates](#custom-templates-vtu-iit-or-any-college)
  - [Available Grading Schemes](#available-grading-schemes)
- [🏗️ Project Structure](#️-project-structure)
- [🔧 Tech Stack](#-tech-stack)
- [📊 Grading Logic & Calculations](#-grading-logic--calculations)
  - [Default PES Scheme](#default-pes-scheme)
  - [SGPA Formula](#sgpa-formula)
  - [Component Scaling & CIE Calculation](#component-scaling--cie-calculation)
  - [5-Credit Course Scaling](#5-credit-course-scaling)
  - [Momentum Scoring](#momentum-scoring)
- [🤝 Contributing](#-contributing)
- [🐛 Known Issues](#-known-issues)
- [📝 Changelog](#-changelog)
- [📄 License](#-license)
- [🙏 Acknowledgments](#-acknowledgments)

---

## ✨ Features

### 🎯 Core Functionality
- **Real-time SGPA Calculation** - Instant updates as you enter marks
- **Reverse Calculator** - Set target SGPA, get exact ESA scores needed per subject with locking for fixed subjects
- **Momentum Scoring** - Smart projection for empty fields based on current performance
- **ISA 2 Target Planner** - Input global or subject-specific assumed ESA scores to plan ISA 2 targets for desired grades (Pass/A/S)
- **Minimum Passing Analysis** - View minimum ESA scores needed in each subject to pass/reach desired grades
- **Multiple Strategy Paths** - Efficient, Balanced, or Randomized grade combinations for reverse calculator
- **CGPA Calculator** - Track cumulative GPA across semesters with graduation credit tracking (160 Cr)
- **CGPA Target Planner** - Plan required future SGPAs to reach a target CGPA

### 🎓 PESU Academy Portal Integration
- **Direct Portal Sync** - Log in with your PESU Academy credentials to fetch live academic records
- **One-Click Results Import** - Automatically detect semester presets, map subjects, and load ISA/ESA scores into the calculator
- **Live Attendance & Bunk Planner** - View per-course attendance stats, safe bunk margins, and class recovery estimates for 75% and 85% thresholds
- **Academic Schedule & Events** - View instructional days, exams, and holidays directly from the academy calendar

### 🔧 Advanced Tools
- **Grade Curve Adjustments** - Customize grade cutoffs per subject when exams are hard
- **Attendance Calculator** - Track and plan your 75% attendance requirement
- **CIE Component Scaling** - Automatic scaling of continuous internal evaluation components
- **Lab & Assignment Tracking** - Weighted component system for realistic calculations

### 💾 Quality of Life
- **Auto-Save** - All data persists in browser localStorage
- **Dark Mode** - Easy on the eyes during late-night study sessions
- **Undo/Redo** - Full history support with `Ctrl+Z` / `Ctrl+Y`
- **Export/Import** - Backup and restore your data as JSON
- **Mobile Responsive** - Works perfectly on phones and tablets
- **Service Worker** - Offline functionality via PWA support

### 🦅 Companion Tools
- **[PESUClaw](https://github.com/AAK1767/PESUClaw)** - Browser extension for Chrome and Firefox to bulk download course slides, notes, assignments, question banks, and merged PDFs directly from PESU Academy.

### 🎓 Comprehensive Preset Support
- **First-Year Cycles** - Chemistry Cycle, Physics Cycle (PES Sem 1-2)
- **CSE Semesters** - Sem 3-8 with specialized capstone projects and internship tracks
- **AIML Semesters** - Sem 3-8 with AI/ML focus courses and capstone projects
- **ECE Semesters** - Sem 3-6 with electronics and signal processing emphasis
- **Generic Cycle** - Fully editable template for any college or program
- **Custom Grading Schemes** - PES (Default), 10-Point (VTU/IIT Style), 4-Point (US Style), and fully custom options

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/aak1767/pes-sgpa-calculator.git
   cd pes-sgpa-calculator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:5173
   ```

### Build for Production

```bash
npm run build
npm run preview  # Preview the build locally
```

---

## 📖 User Guide

> 🧮 **Looking for details on calculations?** Check out the [Detailed Calculation Guide](CALCULATION_GUIDE.md) to understand the exact formulas, scaling, rounding, and algorithms used behind the scenes for SGPA, CGPA, reverse calculation strategies, and attendance planning.

### Tab Overview

| Tab | Purpose |
|-----|---------|
| **Subjects** | Enter marks, load presets, configure assessment components, manage templates |
| **Analysis** | View SGPA predictions, minimum ESA requirements, ISA 2 planner with custom assumptions |
| **Reverse Calc** | Set target SGPA, lock fixed subjects, see required ESA scores with multiple strategy paths |
| **CGPA** | Calculate cumulative GPA across semesters (up to 8 semesters), track progress toward target |
| **Attendance** | Track classes and plan attendance to meet 75% requirement |
| **PESU Academy** | Sync live portal attendance, academic calendar, and import results directly into calculator |
| **Guide** | In-app documentation and help |

### Presets Overview

**First Year (All Branches)**
- Chemistry Cycle (Sem 1-2)
- Physics Cycle (Sem 1-2)

**CSE (Computer Science & Engineering)**
- Semesters 3, 4, 5, 6, 7, 8
- Includes capstone projects (Phases 1-4) and specialized courses

**AIML (AI & Machine Learning)**
- Semesters 3, 4, 5, 6, 7, 8
- ML-focused curriculum with capstone projects and internship

**ECE (Electronics & Communication Engineering)**
- Semesters 3, 4, 5, 6
- Digital design, signal processing, and network courses

**Generic Cycle**
- Fully editable template for any college/program
- Create custom subjects with your own assessment patterns

### Quick Start

1. **Load a Preset** (Subjects Tab)
   - Click the preset dropdown to choose your program
   - **First Year:** Chemistry Cycle, Physics Cycle
   - **CSE/AIML/ECE:** Select your branch and semester (e.g., "CSE Sem 3")
   - **Custom:** Select "Generic Cycle (Editable)" to build your own

2. **Enter Your Marks**
   - Click on any subject to expand
   - Enter ISA1, ISA2, Assignment (if applicable), Lab (if applicable), ESA scores
   - Scores auto-save as you type
   - Note: 5-credit courses automatically scale from 120% to 100%

3. **Check Analysis**
   - Go to Analysis tab to see SGPA predictions
   - View minimum ESA scores needed for Pass/A/S grades in each subject
   - Review ISA 2 planner with custom ESA assumptions

4. **Plan Your ESAs**
   - Go to Reverse Calc tab
   - Enter your target SGPA (e.g., 9.0)
   - Lock subjects with fixed marks
   - Choose strategy: Efficient, Balanced, or Randomized
   - See exactly what you need to score in each subject

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + Z` | Undo |
| `Ctrl + Y` | Redo |
| `Ctrl + S` | Export data |
| `Escape` | Close expanded subject |

### Understanding "Momentum"

When you leave a field empty (like ISA2), most calculators treat it as 0. This app uses **Momentum Scoring**:

- If you scored 35/40 in ISA1 → We assume similar performance in ISA2
- This gives realistic predictions before exams are written
- Look for the "Using Momentum" warning in Reverse Calc

### Custom Templates (VTU, IIT, or Any College)

1. Go to **Subjects Tab**
2. Click **"Not from PES? 🎓"** to open the template builder
3. Configure your assessment pattern:
   - Define assessment components (ISA1, ISA2, Assignments, Lab, ESA)
   - Set maximum scores for each component
   - Set weights as percentages
   - Customize component labels (e.g., "Midterm" instead of "ISA1")
4. Select or create a custom grading scheme
5. Click **Create Subject** to add subjects using your template

### Available Grading Schemes

- **PES (Default):** S(90)=10.0, A(80)=9.0, B(70)=8.0, C(60)=7.0, D(50)=6.0, E(40)=5.0, F(0)=0.0
- **10-Point (VTU Style):** O(90)=10, A+(80)=9, A(70)=8, B+(60)=7, B(55)=6, C(50)=5, P(40)=4, F(0)=0
- **10-Point (IIT Style):** AA(90)=10, AB(80)=9, BB(70)=8, BC(60)=7, CC(50)=6, CD(45)=5, DD(40)=4, FF(0)=0
- **4-Point (US Style):** A(90)=4.0, A-(85)=3.7, B+(80)=3.3, B(75)=3.0, B-(70)=2.7, C+(65)=2.3, C(60)=2.0, C-(55)=1.7, D(50)=1.0, F(0)=0
- **Custom:** Define your own grade boundaries and grade points

---

## 🏗️ Project Structure

```
pes-sgpa-calculator/
├── api/
│   ├── feedback.js                 # Feedback API handler
│   ├── pesu-auth.js                # PESU Academy authentication endpoint
│   └── pesu-portal.js              # PESU Academy data scraping endpoint
├── server/
│   ├── pesuPortal.js               # PESU Academy scraper engine
│   └── pesuPortal.parsers.test.js  # Scraper & parser tests
├── public/
│   ├── robots.txt
│   └── sitemap.xml
├── src/
│   ├── App.jsx                     # Main application component
│   ├── App.css                     # App-specific styles
│   ├── index.css                   # Global styles & Tailwind imports
│   ├── main.jsx                    # React entry point
│   ├── sw.js                       # Service worker (offline support)
│   ├── assets/                     # Static assets
│   ├── components/
│   │   └── PesuPortalData.jsx      # PESU Portal dashboard & attendance UI
│   ├── constants/
│   │   └── presets.js              # PES preset configurations
│   ├── hooks/
│   │   └── useCustomTemplate.js    # Custom hook for templates
│   ├── tabs/
│   │   ├── AnalysisTab.jsx         # Grade analysis & predictions
│   │   ├── AttendanceTab.jsx       # Attendance tracker
│   │   ├── CgpaTab.jsx             # CGPA calculator
│   │   ├── GuideTab.jsx            # In-app help & documentation
│   │   ├── PesuAcademyTab.jsx      # PESU Academy integration tab
│   │   ├── ReverseTab.jsx          # Reverse SGPA calculator
│   │   └── SubjectsTab.jsx         # Subject configuration & marks entry
│   └── utils/
│       ├── analytics.js            # Analytics tracking
│       ├── attendanceCalculations.js # Attendance logic
│       ├── attendanceProjection.js # Future attendance & bunk projections
│       ├── calculations.js         # Core SGPA/CGPA calculations
│       ├── pesuMapping.js          # PESU course mapping & preset detection
│       └── resultsImport.js        # Results extraction & import pipeline
├── CALCULATION_GUIDE.md            # Detailed calculation algorithms
├── eslint.config.js                # ESLint configuration
├── fix-dark-mode.cjs               # Dark mode utilities
├── index.html                      # HTML entry point
├── package.json
├── postcss.config.js               # PostCSS configuration
├── tailwind.config.js              # Tailwind CSS configuration
├── vite.config.js                  # Vite build & proxy configuration
├── vercel.json                     # Vercel deployment config
└── README.md
```

---

## 🔧 Tech Stack

- **Framework:** React 19.2 with Hooks & Function Components
- **Build Tool:** Vite 7.2 (Lightning-fast dev server with proxy support)
- **Styling:** Tailwind CSS 3.4 + PostCSS & Autoprefixer
- **Animations:** Framer Motion 12.3
- **Icons:** Lucide React 0.561
- **Analytics:** Vercel Analytics & Speed Insights
- **Storage:** Browser localStorage (no backend database required)
- **PWA:** Service Worker support for offline functionality
- **Testing:** Vitest for unit & regression testing (80+ tests)
- **Linting:** ESLint with React plugins & React Compiler rules
- **Deployment:** Vercel (optimized serverless functions)

---

## 📊 Grading Logic & Calculations

### Default PES Scheme

| Grade | Min Score | Grade Points |
|-------|-----------|--------------|
| S | 90 | 10 |
| A | 80 | 9 |
| B | 70 | 8 |
| C | 60 | 7 |
| D | 50 | 6 |
| E | 40 | 5 |
| F | 0 | 0 |

### SGPA Formula

```
SGPA = Σ(Grade Points × Credits) / Σ(Credits)
```

### Component Scaling & CIE Calculation

The calculator uses a sophisticated component-based system:

**Continuous Internal Evaluation (CIE)**
- Combines: ISA1 + ISA2 + Assignments
- Scaled to 50 marks with ceiling rounding

**Lab Component** 
- Scaled to its assigned weight (typically 20 marks)
- Rounded up to nearest integer

**Semester End Exam (ESA)**
- Scaled to 50 marks
- Rounded up to nearest integer

**Final Score Calculation**
```
Final Score = ceil((CIE_Rounded + Lab_Rounded + ESA_Rounded) / Total_Weight × 100)
```

### 5-Credit Course Scaling

PES 5-credit courses have 120% total weightage:
- ISA1: 20%, ISA2: 20%, Assignment: 10%, Lab: 20%, ESA: 50%
- Total: 120% → Normalized to 100% in final calculation
- Automatically handled by the calculator

### Momentum Scoring

When marks are not entered, the calculator uses **momentum scoring** to estimate performance:
- Analyzes your current performance trend
- Projects likely scores for unwritten exams
- Provides realistic SGPA estimates before all assessments are complete

For detailed formulas and algorithms, see [Detailed Calculation Guide](CALCULATION_GUIDE.md)

---

## 🤝 Contributing

Contributions are welcome! Here's how:

1. **Fork** the repository
2. **Create** a feature branch
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit** your changes
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push** to the branch
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open** a Pull Request

### Development Guidelines

- Follow existing code style
- Test on both mobile and desktop
- Update documentation for new features
- Keep bundle size minimal

---

## 🐛 Known Issues

- [ ] Custom grading schemes for non-PES colleges are experimental and may have edge-case mismatches

---

## 📝 Changelog

### v6.0 (Current)
- ✨ Added **PESU Academy Portal Integration** (`PesuAcademyTab` & `PesuPortalData`):
  - Direct login and profile fetching from PESU Academy
  - Live attendance tracking with safe bunk margins and catch-up class projections (75% / 85% goals)
  - Academic calendar integration for schedule and holiday tracking
  - One-click results import directly into SGPA calculator with automatic preset mapping and custom subject synthesis
- ⚡ Maintained portal state across tab switching for seamless user experience
- ⚡ Full React 19 & React Compiler compatibility and ESLint cleanup
- 🧪 Added comprehensive test suites for scraper parsers, attendance projections, and results import (83 passing tests)

### v5.0
- ✨ **Branch & Semester Presets Expansion**: Added complete presets for CSE (Sem 3–8), AIML (Sem 3–8), and ECE (Sem 3–6) including Capstone Projects (Phases 1–4) and Internship tracks
- ✨ **Smart Suggestions for Grade Planning**: Added actionable recommendations in Analysis tab for grade improvement and risk alerts
- ⚡ **Codebase Modularization**: Refactored monolithic tab structure into individual modular components (`src/tabs/`) with hash routing
- 🐛 **Input Sanitization & Half-Marks**: Added `step=0.5` support for precise half-mark inputs and regex sanitization to block invalid characters
- 🐛 **Course Weight Adjustments**: Fine-tuned ISA/Assignment weights for Operating Systems and Computer Networks; updated Sem 7 & 8 CGPA default credits
- 📈 **Enhanced Analytics**: Added granular GA4 tracking for component average marks and active preset cycle names
- 📖 **Guide Update**: Added PESUClaw extension documentation and developer resources

### v4.0
- ✨ Added **CGPA Target Planner (Reverse CGPA)** inside CGPA tab with graduation credit progress tracking (160 credits bar)
- ✨ Added **ISA 2 Target Planner** collapsible block in the Analysis tab with global and per-subject assumed ESA override inputs
- ✨ Removed visual clutter (GP badges in recommendation lists, GP Cushion cards) from the Analysis tab
- 🐛 Fixed default browser focus outlines showing on input elements
- 🐛 Fixed annoying leading zero insertions when target inputs were cleared

### v3.0
- ✨ Universal college support with custom templates
- ✨ Multiple strategy paths (Efficient, Balanced, Random)
- ✨ Attendance calculator
- ✨ Dark mode
- 🐛 Fixed momentum calculation for empty labs

### v2.0
- ✨ Reverse calculator with locking
- ✨ Study priority advisor
- ✨ Export/Import functionality

### v1.0
- 🎉 Initial release with basic SGPA calculation

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- PES University for the grading scheme and academy portal reference
- [pesudev](https://github.com/pesudev) for developer resources and community inspiration
- [PESUClaw](https://github.com/AAK1767/PESUClaw) for companion academy downloading capabilities
- [Lucide](https://lucide.dev/) for beautiful icons
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first framework
- All the students who provided feedback

---

<div align="center">

**Made with ❤️ for PES Students**

⭐ Star this repo if it helped you plan your semester!

</div>
