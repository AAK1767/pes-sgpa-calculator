# 🎓 PES Universal SGPA Calculator — Detailed Calculation Guide

This guide provides a comprehensive breakdown of the formulas, scaling rules, rounding mechanisms, and algorithms used to perform calculations across all tabs of the PES Universal SGPA Calculator.

---

## 📌 Table of Contents
1. [Continuous Internal Evaluation (CIE) & Subject Calculations](#1-continuous-internal-evaluation-cie--subject-calculations)
2. [Momentum Logic (Smart Projection)](#2-momentum-logic-smart-projection)
3. [SGPA Calculations (Subjects Tab)](#3-sgpa-calculations-subjects-tab)
4. [Analysis Tab Calculations](#4-analysis-tab-calculations)
5. [Reverse Calculator Tab Algorithms](#5-reverse-calculator-tab-algorithms)
6. [Attendance Tab Planners](#6-attendance-tab-planners)
7. [CGPA Tab Calculations](#7-cgpa-tab-calculations)

---

## 1. Continuous Internal Evaluation (CIE) & Subject Calculations

Every subject has specific assessment components (Midterms/ISAs, Assignments, Labs, Semester End Exams/ESAs), each with a maximum score and a weight.

### A. Raw Component Scores
For any input score, the raw weighted value is calculated as:
$$\text{Component Raw} = \frac{\text{Entered Score}}{\text{Maximum Score}} \times \text{Component Weight}$$

*Example: An ISA1 score of $30/40$ with weight $20$ yields:*
$$\text{ISA1 Raw} = \frac{30}{40} \times 20 = 15.0$$

### B. Continuous Internal Evaluation (CIE) Scaling & Rounding
CIE represents the combination of classroom-based assessments: ISA1, ISA2, and Assignments. In the default PES grading system, CIE is scaled out of $50$ marks, rounded up to the nearest integer.
$$\text{CIE Weight} = \text{ISA1 Weight} + \text{ISA2 Weight} + \text{Assignment Weight (if applicable)}$$
$$\text{CIE Raw} = \text{ISA1 Raw} + \text{ISA2 Raw} + \text{Assignment Raw}$$
$$\text{CIE Scaled} = \frac{\text{CIE Raw}}{\text{CIE Weight}} \times 50$$
$$\text{CIE Rounded} = \lceil\text{CIE Scaled}\rceil$$

### C. Laboratory Component
Labs are graded as standalone internal marks and are typically scaled out of their direct weight (usually $20$ marks):
$$\text{Lab Scaled} = \text{Lab Raw} = \frac{\text{Lab Score}}{\text{Lab Max}} \times \text{Lab Weight}$$
$$\text{Lab Rounded} = \lceil\text{Lab Scaled}\rceil$$

### D. Semester End Examination (ESA) Scaling
ESAs are scaled out of $50$ marks, rounded up to the nearest integer:
$$\text{ESA Scaled} = \frac{\text{ESA Score}}{\text{ESA Max}} \times 50$$
$$\text{ESA Rounded} = \lceil\text{ESA Scaled}\rceil$$

### E. Final Subject Score
The final score (out of $100$) represents the sum of the rounded components scaled by the course's overall weight:
$$\text{Total Weight} = \text{CIE Weight} + \text{Lab Weight} + \text{ESA Weight}$$
$$\text{Final Score} = \min\left(100, \max\left(0, \left\lceil \frac{\text{CIE Rounded} + \text{Lab Rounded} + \text{ESA Rounded}}{\text{Total Weight}} \times 100 \right\rceil\right)\right)$$

*Note on PES 5-Credit Courses:*
These courses have components totaling $120$ in weight (CIE Weight: $50$, Lab Weight: $20$, ESA Weight: $50$). The denominator $\text{Total Weight} = 120$ normalizes the score back to a standard $100$-point scale.

### F. Grade Point (GP) Mapping
The final score maps to a letter grade and Grade Points based on the selected scheme (e.g. PES Default):

| Grade | Min Score | Grade Points (GP) |
| :---: | :-------: | :---------------: |
| **S** | $\ge 90$  | $10$              |
| **A** | $\ge 80$  | $9$               |
| **B** | $\ge 70$  | $8$               |
| **C** | $\ge 60$  | $7$               |
| **D** | $\ge 50$  | $6$               |
| **E** | $\ge 40$  | $5$               |
| **F** | $< 40$    | $0$               |

---

## 2. Momentum Logic (Smart Projection)

When you leave fields blank, the calculator projects scores using **Momentum Logic** rather than assuming $0$ marks.

### A. Proportional ISA2 Projection
If ISA1 is filled but ISA2 is empty:
$$\text{ISA Ratio} = \frac{\text{ISA1 Score}}{\text{ISA1 Max}}$$
$$\text{Projected ISA2} = \text{ISA Ratio} \times \text{ISA2 Max}$$
$$\text{Momentum ISA2 Marks} = \text{Round}(\text{Projected ISA2}, 1)$$
This projected mark is added to `CIE Raw` for calculations.

### B. Full Marks Assumption for Assignments & Labs
- If Assignment is empty: `Momentum Assignment Marks` is assumed to be full marks (`Assignment Max`), adding the full `Assignment Weight` to CIE.
- If Lab is empty: `Momentum Lab Marks` is assumed to be full marks (`Lab Max`), adding the full `Lab Weight` to Lab.

### C. Proportional ESA Projection
If the ESA field is empty, the app estimates performance in the final exam based on overall performance across completed internals:
$$\text{Overall Internal Ratio} = \frac{\text{CIE Raw} + \text{Lab Raw}}{\text{Filled Internals Weight}}$$
$$\text{Momentum ESA Raw} = \text{ESA Weight} \times \text{Overall Internal Ratio}$$
$$\text{Momentum ESA Scaled} = \frac{\text{Momentum ESA Raw}}{\text{ESA Weight}} \times 50 = \text{Overall Internal Ratio} \times 50$$
$$\text{Momentum ESA Rounded} = \lceil\text{Momentum ESA Scaled}\rceil$$

### D. Momentum Final Score
The momentum score uses these projected components:
$$\text{Momentum Score} = \left\lceil \frac{\text{Projected CIE Rounded} + \text{Projected Lab Rounded} + \text{Momentum ESA Rounded}}{\text{Total Weight}} \times 100 \right\rceil$$

---

## 3. SGPA Calculations (Subjects Tab)

The Semester Grade Point Average (SGPA) is computed as the credit-weighted average of all courses:
$$\text{SGPA} = \frac{\sum_{i} \left( \text{Grade Point}_{i} \times \text{Credits}_{i} \right)}{\sum_{i} \text{Credits}_{i}}$$

### Quick SGPA Sandbox Estimator
At the bottom of the Subjects tab, you can select hypothetical letter grades (S, A, B...) directly for each subject. It uses the same SGPA formula but overrides the calculated Grade Points with your selected grades for quick sandboxing.

---

## 4. Analysis Tab Calculations

### A. Achievable Range
- **Best Case SGPA**: Assumes an ESA score of $100\%$ (or the maximum possible) in all subjects.
- **Worst Case SGPA**: Assumes an ESA score of $0\%$ in all subjects.

### B. Safe vs. Minimum ESA Marks
For any target letter grade cutoff score $T$ (e.g. $90$ for S, $80$ for A):
1. **Safe ESA Marks (Guaranteed Grade)**:
   This guarantees that even with unfavorable rounding, you reach the target:
   $$\text{Target ESA Safe (out of 50)} = \left\lceil T \times \frac{\text{Total Weight}}{100} \right\rceil - \text{CIE Rounded} - \text{Lab Rounded}$$
   $$\text{Safe ESA Marks (out of ESA Max)} = \left\lceil \frac{\text{Target ESA Safe}}{50} \times \text{ESA Max} \right\rceil$$

2. **Minimum ESA Marks ( Decimals Round Up)**:
   This relies on favorable rounding (up to $0.99$ decimal margins) to hit the target:
   $$\text{Target ESA Rounded (out of 50)} = \left\lceil (T - 1 + 10^{-6}) \times \frac{\text{Total Weight}}{100} \right\rceil - \text{CIE Rounded} - \text{Lab Rounded}$$
   $$\text{Minimum ESA Marks (out of ESA Max)} = \left\lceil \frac{\text{Target ESA Rounded} - 1 + 10^{-6}}{50} \times \text{ESA Max} \right\rceil$$

### C. ISA 2 Target Planner
The ISA 2 Target Planner calculates the required marks in the upcoming ISA 2 exam to secure target grades ($40$ for Pass, $80$ for A, $90$ for S) under an assumed Semester End Exam (ESA) performance score.

1. **Effective Assumed ESA ($E$)**:
   $$\text{Effective Assumed ESA } (E) = \begin{cases} 
   \text{Subject Override ESA} & \text{if entered} \\
   \text{Global Assumed ESA} & \text{otherwise}
   \end{cases}$$

2. **Required ISA 2 Marks**:
   To find the required ISA 2 mark for a target grade cutoff score $T$:
   - Sets the subject's ESA component to the effective assumed ESA ($E$) out of $100$.
   - Mocks the subject's ISA 2 mark as empty (allowing retrospective calculations for completed subjects).
   - Solves for the minimum required ISA 2 mark ($I_2$ out of $\text{ISA2 Max}$) such that the final scaled subject score $\ge T$.

### D. Path to Target (Recommendation Engine)
A greedy recommendation engine generates step-by-step advice to reach your target SGPA:
1. Calculates the current SGPA.
2. If current SGPA < target SGPA, it evaluates upgrading each subject to the next higher grade.
3. It selects the subject upgrade that requires the least increase in marks (highest efficiency: $\frac{\text{GP Gain}}{\text{ESA Mark Cost}}$).
4. Applies the upgrade, updates the SGPA, and repeats until the target is reached. (Note: Grade Point badges are hidden on recommendations to focus purely on the target grade and ESA marks needed).

---

## 5. Reverse Calculator Tab Algorithms

The Reverse Calculator finds a configuration of grades across all subjects to achieve the target SGPA while minimizing study effort.

### A. Optimization Strategies (Hill Climbing)
Starting with $0$ ESA marks for all subjects, the optimizer iteratively upgrades grades one step at a time until the credit-weighted sum of grade points meets the target:
$$\sum \left( \text{GP}_{i} \times \text{Credits}_{i} \right) \ge \text{Target SGPA} \times \sum \text{Credits}_{i}$$

The three mode strategies determine which subject is selected for an upgrade at each step:

#### 1. Default (Efficient) Mode
Selects the upgrade that gives the absolute best return on effort (greedy optimization):
$$\text{Efficiency} = \frac{\text{GP Gain}}{\text{Mark Cost}}$$
This mode prioritizes subjects where a tiny increase in ESA marks yields a higher grade point.

#### 2. Balanced Mode
Distributes the effort evenly across subjects by penalizing extremely high ESA scores. It uses a quadratic cost function (strain) to prevent any single subject from demanding unrealistic scores (e.g. $98/100$):
$$\text{Strain} = (\text{New Required ESA})^2 - (\text{Current Required ESA})^2$$
$$\text{Efficiency} = \frac{\text{GP Gain}}{\text{Strain}}$$

#### 3. Shuffle Mode
Applies a randomized multiplier ("vibe shift") to the mark cost of each subject, creating unique, valid study distributions:
$$\text{Biased Cost} = \text{Mark Cost} \times \text{Random Bias}$$
$$\text{Efficiency} = \frac{\text{GP Gain}}{\text{Biased Cost}}$$

### B. Locked & Pre-Entered Subjects
- If a user has pre-entered an ESA mark in the Subjects tab, it is treated as a **Hard Lock**.
- Users can click the lock icon and enter a custom minimum ESA score (**Manual Lock**).
- Locked subjects are excluded from optimization; their fixed GP contributions are deducted from the target GP requirement, and the remaining deficit is solved using the unlocked subjects.

---

## 6. Attendance Tab Planners

Calculations help you maintain the mandatory $75\%$ attendance or a custom target buffer (e.g. $80\%$).

### A. Baseline Metrics (Mode 1)
- **Current Attendance %**:
  $$\text{Current Attendance} = \frac{\text{Attended Classes}}{\text{Total Classes Held}} \times 100$$
- **Consecutive Classes to Attend**:
  To recover to target percentage $P\%$ (if current attendance is below $P\%$):
  $$\text{Consecutive Classes Needed} = \left\lceil \frac{\frac{P}{100} \times \text{Total Held} - \text{Attended}}{1 - \frac{P}{100}} \right\rceil$$
- **Maximum Consecutive Skips Allowed**:
  To stay above target percentage $P\%$ (if current attendance is above $P\%$):
  $$\text{Max Skips Allowed} = \left\lfloor \frac{\text{Attended}}{\frac{P}{100}} - \text{Total Held} \right\rfloor$$

### B. Remaining Semester Planners (Mode 3 & 4)
For a given number of remaining classes $R$ (final semester total classes will be $N_{\text{final}} = \text{Total Held} + R$):
- **Best Case Final Attendance**: $\frac{\text{Attended} + R}{N_{\text{final}}} \times 100$
- **Worst Case Final Attendance**: $\frac{\text{Attended}}{N_{\text{final}}} \times 100$
- **Safe Misses within Remaining**:
  $$\text{Safe Misses} = \max\left(0, \min\left(R, \left\lfloor \text{Attended} + R - \frac{P}{100} \times N_{\text{final}} \right\rfloor\right)\right)$$
- **Must Attend classes**:
  $$\text{Must Attend} = R - \text{Safe Misses}$$

### C. Miss Impact Planner (Mode 5)
Calculates your standing after taking a planned number of skips ($S$):
$$\text{New Attendance Percentage} = \frac{\text{Attended}}{N_{\text{held}} + S} \times 100$$
If this drops below $75\%$, it calculates the recovery classes required immediately after:
$$\text{Recovery Classes} = \text{consecutiveClassesNeeded}(\text{Total Held} + S, \text{Attended}, 75)$$

---

## 7. CGPA Tab Calculations

### A. Cumulative GPA (CGPA)
The CGPA is computed as a weighted average over all completed semesters where both SGPA and Credits are entered:
$$\text{CGPA} = \frac{\sum_{j} \left( \text{SGPA}_{j} \times \text{Credits}_{j} \right)}{\sum_{j} \text{Credits}_{j}}$$

### B. Quick CGPA Estimator (Manual combining)
Combines previous academic history with the current semester's results:
$$\text{Predicted CGPA} = \frac{(\text{Prev CGPA} \times \text{Prev Credits}) + (\text{Current SGPA} \times \text{Current Credits})}{\text{Prev Credits} + \text{Current Credits}}$$

### C. CGPA Target Planner (Reverse CGPA)
The CGPA Target Planner allows planning future academic semesters to reach a cumulative target CGPA ($C_{\text{target}}$):

1. **Required Future Average SGPA ($S_{\text{req}}$)**:
   Given completed semesters credit sum $Cr_{\text{comp}}$ and completed grade point sum $GP_{\text{comp}} = \sum (SGPA_i \times Credits_i)$, and planned future semesters credit sum $Cr_{\text{future}}$:
   $$S_{\text{req}} = \frac{C_{\text{target}} \times (Cr_{\text{comp}} + Cr_{\text{future}}) - GP_{\text{comp}}}{Cr_{\text{future}}}$$
   If $S_{\text{req}} \le 10.0$ and $S_{\text{req}} \ge 0.0$, the target is achievable. If $S_{\text{req}} > 10.0$, it is flagged as mathematically impossible.

2. **Maximum Achievable CGPA ($C_{\text{max}}$)**:
   Calculates the CGPA assuming a perfect $10.0$ SGPA in all remaining active future semesters:
   $$C_{\text{max}} = \frac{GP_{\text{comp}} + (10.0 \times Cr_{\text{future}})}{Cr_{\text{comp}} + Cr_{\text{future}}}$$

3. **Placement Preparation CGPA Checkpoint ($C_{\text{placement}}$)**:
   Calculates the maximum achievable CGPA until Semester 6 (the typical checkpoint for placement eligibility) by assuming a $10.0$ SGPA for any remaining semesters up to Semester 6:
   $$C_{\text{placement}} = \frac{GP_{\text{comp}} + (10.0 \times Cr_{\text{future\_to\_sem6}})}{Cr_{\text{comp}} + Cr_{\text{future\_to\_sem6}}}$$

4. **Graduation Credit Progress**:
   Tracks the total planned credits $Cr_{\text{total}} = Cr_{\text{comp}} + Cr_{\text{future}}$ against the graduation requirement threshold (default $160$ credits) to verify degree completion feasibility.
