export interface Employee {
  id: number;
  name: string;
  department: string;
  role: string;
  salary: number;
  status: 'Active' | 'Inactive' | 'On Leave';
  startDate: string;
  performance: number;
  remote: boolean;
}

type Department = 'Engineering' | 'Sales' | 'Marketing' | 'Finance' | 'HR' | 'Operations';

const DEPARTMENTS: Department[] = ['Engineering', 'Sales', 'Marketing', 'Finance', 'HR', 'Operations'];

const FIRST_NAMES = [
  'Alice', 'Bob', 'Charlie', 'Diana', 'Ethan', 'Fiona', 'Grace', 'Henry',
  'Iris', 'Jack', 'Karen', 'Liam', 'Mia', 'Noah', 'Olivia', 'Peter',
  'Quinn', 'Rachel', 'Sam', 'Tara', 'Uma', 'Victor', 'Wendy', 'Xander', 'Yuki', 'Zoe',
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Wilson', 'Anderson', 'Taylor', 'Thomas', 'Moore', 'Jackson', 'Martin', 'Lee',
  'Perez', 'Thompson', 'White', 'Harris', 'Clark', 'Lewis', 'Robinson', 'Walker',
];

const ROLES: Record<Department, string[]> = {
  Engineering:  ['Software Engineer', 'Senior Engineer', 'Staff Engineer', 'Tech Lead', 'Eng Manager'],
  Sales:        ['Account Executive', 'Sales Manager', 'SDR', 'VP of Sales', 'Account Director'],
  Marketing:    ['Marketing Manager', 'Content Strategist', 'UX Designer', 'Brand Manager', 'Growth Lead'],
  Finance:      ['Financial Analyst', 'Sr Accountant', 'Controller', 'CFO', 'Tax Specialist'],
  HR:           ['HR Manager', 'Recruiter', 'HR Business Partner', 'HR Director', 'Comp Analyst'],
  Operations:   ['Operations Manager', 'Project Manager', 'Business Analyst', 'COO', 'Process Engineer'],
};

const SALARY_BANDS: Record<Department, [number, number]> = {
  Engineering:  [90_000, 220_000],
  Sales:        [65_000, 180_000],
  Marketing:    [60_000, 150_000],
  Finance:      [70_000, 190_000],
  HR:           [55_000, 130_000],
  Operations:   [60_000, 150_000],
};

function seededRandom(seed: number): () => number {
  let s = seed;
  return (): number => {
    s = ((s * 1664525 + 1013904223) | 0);
    return (s >>> 0) / 4_294_967_295;
  };
}

export function generateEmployees(count = 500): Employee[] {
  const rng = seededRandom(42);
  const pick = <T>(arr: readonly T[]): T => arr[Math.floor(rng() * arr.length)];
  const between = (min: number, max: number): number => Math.floor(rng() * (max - min + 1)) + min;

  return Array.from({ length: count }, (_, i) => {
    const dept = pick(DEPARTMENTS);
    const [salMin, salMax] = SALARY_BANDS[dept];
    const year = between(2015, 2024);
    const month = String(between(1, 12)).padStart(2, '0');
    const day   = String(between(1, 28)).padStart(2, '0');
    const roll  = rng();
    const status: Employee['status'] = roll < 0.07 ? 'Inactive' : roll < 0.14 ? 'On Leave' : 'Active';

    return {
      id:          i + 1,
      name:        `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
      department:  dept,
      role:        pick(ROLES[dept]),
      salary:      Math.round(between(salMin, salMax) / 1000) * 1000,
      status,
      startDate:   `${year}-${month}-${day}`,
      performance: between(60, 100),
      remote:      rng() > 0.45,
    };
  });
}

export const EMPLOYEES = generateEmployees(500);
