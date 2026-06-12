# 🎓 PES Universal SGPA Calculator

<div align="center">

![React](https://img.shields.io/badge/React-19.1-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6.3-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**A powerful, offline-first SGPA/CGPA calculator built for PES University students.**  
*Also works for VTU, IIT, and any custom grading scheme!*

[Live Demo](https://pes-sgpa-calculator.vercel.app) · [Report Bug](https://github.com/aak1767/pes-sgpa-calculator/issues) · [Request Feature](https://github.com/aak1767/pes-sgpa-calculator/issues)

</div>

---

## ✨ Features

### 🎯 Core Functionality
- **Real-time SGPA Calculation** - Instant updates as you enter marks
- **Reverse Calculator** - Set target SGPA, get exact ESA scores needed
- **Momentum Scoring** - Smart projection for empty fields based on current performance
- **CGPA Target Planner (Reverse CGPA)** - Plan required future SGPAs to reach a target CGPA, with graduation credit tracking (160 Cr)
- **ISA 2 Target Planner** - Input global or subject-specific assumed ESA scores to plan ISA 2 targets for desired grades (Pass/A/S)
- **CGPA Calculator** - Track cumulative GPA across semesters

### 🔧 Advanced Tools
- **Grade Curve Adjustments** - Customize cutoffs per subject when exams are hard
- **Attendance Calculator** - Track and plan your 75% attendance requirement
- **Multiple Strategy Paths** - Efficient, Balanced, or Randomized grade combinations

### 💾 Quality of Life
- **Auto-Save** - All data persists in browser localStorage
- **Dark/Light Mode** - Easy on the eyes during late-night study sessions
- **Undo/Redo** - Full history support with `Ctrl+Z` / `Ctrl+Y`
- **Export/Import** - Backup and restore your data as JSON
- **Mobile Responsive** - Works perfectly on phones and tablets

### 🎓 Universal Support
- **PES Presets** - One-click load for Physics/Chemistry cycles
- **Custom Templates** - Build subjects for VTU, IIT, or any college
- **Flexible Grading** - Support for 10-point, 4.0 GPA, and custom schemes

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
| **Subjects** | Enter marks, configure subjects, load presets |
| **Analysis** | View predictions, grade requirements, smart strategy |
| **Reverse Calc** | Set target SGPA → get required ESA scores |
| **CGPA** | Calculate cumulative GPA across semesters |
| **Attendance** | Track and plan attendance percentage |
| **Guide** | In-app help and documentation |

### Quick Start

1. **Load a Preset** (Subjects Tab)
   - Click the dropdown → Select "Chemistry Cycle" or "Physics Cycle"
   
2. **Enter Your Marks**
   - Click on any subject to expand
   - Enter ISA1, ISA2, Assignment, Lab, ESA scores
   - Scores auto-save as you type

3. **Check Analysis**
   - Go to Analysis tab to see predictions
   - View "Safe" ESA scores needed for each grade

4. **Plan Your ESAs**
   - Go to Reverse Calc tab
   - Set your target SGPA (e.g., 9.0)
   - See exactly what you need in each subject

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

### Custom Colleges (VTU, IIT, etc.)

1. Go to **Subjects Tab**
2. Click **"Not from PES? 🎓"**
3. Configure:
   - Assessment components (Midterms, Finals, Labs, etc.)
   - Weights for each component
   - Grading scheme (choose preset or custom)
4. Click **Create Subject**

---

## 🏗️ Project Structure

```
pes-sgpa-calculator/
├── public/
│   └── favicon.ico
├── src/
│   ├── App.jsx          # Main application component (all logic)
│   ├── main.jsx         # React entry point
│   └── index.css        # Tailwind imports
├── docs/
│   └── screenshots/     # Documentation images
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── eslint.config.js
└── README.md
```

---

## 🔧 Tech Stack

- **Framework:** React 19.1 with Hooks
- **Build Tool:** Vite 6.3
- **Styling:** Tailwind CSS 3.x
- **Icons:** Lucide React
- **Analytics:** Vercel Analytics & Speed Insights
- **Storage:** Browser localStorage (no backend required)

---

## 📊 Grading Logic

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

### 5-Credit Course Scaling

PES 5-credit courses have 120% total weightage:
- ISA1: 20%, ISA2: 20%, Assignment: 10%, Lab: 20%, ESA: 50%
- Total: 120% → Normalized to 100% in final calculation

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

- [ ] Momentum calculation can be slightly off for edge cases with 0 marks

---

## 📝 Changelog

### v4.0 (Current)
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

- PES University for the grading scheme reference
- [Lucide](https://lucide.dev/) for beautiful icons
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first framework
- All the students who provided feedback

---

<div align="center">

**Made with ❤️ for PES Students**

⭐ Star this repo if it helped you plan your semester!

</div>
