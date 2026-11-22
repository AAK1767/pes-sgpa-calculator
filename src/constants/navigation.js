import {
  BookOpen, Activity, Target, CheckCircle2, Calculator, GraduationCap, HelpCircle,
} from 'lucide-react';

// Single source of truth for every page. Routes (the `id`) are unchanged so
// existing links like /#/attendance keep working.
export const NAV_ITEMS = [
  {
    id: 'subjects', label: 'Subjects', short: 'Subjects', icon: BookOpen,
    title: 'Subjects',
    blurb: 'Enter your marks for each subject to see your grade and SGPA.',
  },
  {
    id: 'analysis', label: 'Analysis', short: 'Analysis', icon: Activity,
    title: 'Analysis',
    blurb: 'How much you need in the ESA to reach each grade.',
  },
  {
    id: 'reverse', label: 'Reverse Calc', short: 'Reverse', icon: Target,
    title: 'Reverse Calc',
    blurb: 'Pick the SGPA you want and see what to score in each ESA.',
  },
  {
    id: 'attendance', label: 'Attendance', short: 'Attendance', icon: CheckCircle2,
    title: 'Attendance',
    blurb: 'How many classes you can miss, or need to attend.',
  },
  {
    id: 'cgpa', label: 'CGPA', short: 'CGPA', icon: Calculator,
    title: 'CGPA',
    blurb: 'Combine your semester results into one CGPA.',
  },
  {
    id: 'pesu', label: 'PESU Academy', short: 'PESU', icon: GraduationCap,
    title: 'PESU Academy',
    blurb: 'Sign in to pull attendance, marks and results from the portal.',
  },
  {
    id: 'guide', label: 'Guide', short: 'Guide', icon: HelpCircle,
    title: 'Guide',
    blurb: 'How rounding, scaling and grade cutoffs are applied.',
  },
];
