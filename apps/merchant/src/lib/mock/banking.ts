export const bankingOverview = {
  totalBalance: "$49,990",
  income: { value: "$9,990", change: "+8.2%" },
  expenses: { value: "$1,989", change: "-6.6%" },
  // Income curve: starts low, notable dip Mar, then rises steeply Jan→Sep
  incomeData: [
    { month: "Jan", value: 18 },
    { month: "Feb", value: 22 },
    { month: "Mar", value: 8 },
    { month: "Apr", value: 22 },
    { month: "May", value: 40 },
    { month: "Jun", value: 52 },
    { month: "Jul", value: 62 },
    { month: "Aug", value: 74 },
    { month: "Sep", value: 86 },
  ],
  // Expenses curve: starts higher, fluctuates and trends down
  expensesData: [
    { month: "Jan", value: 68 },
    { month: "Feb", value: 52 },
    { month: "Mar", value: 62 },
    { month: "Apr", value: 44 },
    { month: "May", value: 36 },
    { month: "Jun", value: 50 },
    { month: "Jul", value: 30 },
    { month: "Aug", value: 24 },
    { month: "Sep", value: 16 },
  ],
};

export const balanceStats = {
  subtitle: "Statistics on balance over time",
  legend: [
    { label: "Income", value: "$6,789", change: "+43%", color: "#00A76F" },
    { label: "Savings", value: "$1,234", change: "+3%", color: "#FFAB00" },
    { label: "Investment", value: "$1,012", change: "+8%", color: "#FF5630" },
  ],
  categories: ["2018", "2019", "2020", "2021", "2022", "2023"],
  series: [
    { name: "Income", data: [10, 13, 9, 14, 12, 16], color: "#00A76F" },
    { name: "Savings", data: [5, 6, 3, 7, 8, 6], color: "#FFAB00" },
    { name: "Investment", data: [3, 4, 5, 3, 4, 5], color: "#FF5630" },
  ],
};

export interface ExpenseCategory {
  label: string;
  value: number;
  color: string;
}

export const expensesCategories: ExpenseCategory[] = [
  { label: "Entertainment", value: 22, color: "#00A76F" },
  { label: "Fuel", value: 18, color: "#8E33FF" },
  { label: "Fast food", value: 16, color: "#FF5630" },
  { label: "Cafe", value: 17, color: "#00B8D9" },
  { label: "Connection", value: 14, color: "#FFAB00" },
  { label: "Healthcare", value: 22, color: "#22C55E" },
  { label: "Fitness", value: 10, color: "#FF6C40" },
  { label: "Supermarket", value: 21, color: "#7635DC" },
];

export const expensesSummary = {
  categories: 9,
  total: "$18,765",
};

export interface RecentTransition {
  description: string;
  avatar: string;
  date: string;
  time: string;
  amount: string;
  status: "completed" | "progress" | "failed";
  type: "receive" | "payment";
}

export const recentTransitions: RecentTransition[] = [
  {
    description: "Annette black",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Annette",
    date: "05 Jun 2026",
    time: "8:19 pm",
    amount: "$68.71",
    status: "progress",
    type: "receive",
  },
  {
    description: "Courtney henry",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Courtney",
    date: "04 Jun 2026",
    time: "10:45 am",
    amount: "$85.21",
    status: "completed",
    type: "payment",
  },
  {
    description: "Theresa webb",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Theresa",
    date: "03 Jun 2026",
    time: "09:12 pm",
    amount: "$52.17",
    status: "failed",
    type: "payment",
  },
  {
    description: "Fast food",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=FastFood",
    date: "02 Jun 2026",
    time: "03:30 pm",
    amount: "$25.18",
    status: "completed",
    type: "payment",
  },
  {
    description: "Fitness",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Fitness",
    date: "01 Jun 2026",
    time: "02:15 pm",
    amount: "$43.84",
    status: "progress",
    type: "payment",
  },
];

export interface CreditCard {
  balance: string;
  maskedNumber: string;
  cardHolder: string;
  expiration: string;
}

export const creditCards: CreditCard[] = [
  {
    balance: "$23,432.03",
    maskedNumber: "•••• •••• •••• 3640",
    cardHolder: "Deja Brady",
    expiration: "11/22",
  },
  {
    balance: "$18,000.23",
    maskedNumber: "•••• •••• •••• 7291",
    cardHolder: "Harrison Stein",
    expiration: "11/25",
  },
  {
    balance: "$2,000.89",
    maskedNumber: "•••• •••• •••• 5812",
    cardHolder: "Reece Chung",
    expiration: "11/22",
  },
];

export interface Contact {
  name: string;
  email: string;
  avatar: string;
}

export const contacts: Contact[] = [
  {
    name: "Melanie Noble",
    email: "luella.ryan33@gmail.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Melanie",
  },
  {
    name: "Chase Day",
    email: "joana.simonis84@gmail.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Chase",
  },
  {
    name: "Shawn Manning",
    email: "marjolaine.white94@gmail.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Shawn",
  },
  {
    name: "Soren Durham",
    email: "vergie.block82@hotmail.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Soren",
  },
  {
    name: "Cortez Herring",
    email: "vito.hudson@hotmail.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Cortez",
  },
];

export const quickTransferContacts: Contact[] = [
  {
    name: "Melanie Noble",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Melanie",
    email: "luella.ryan33@gmail.com",
  },
  {
    name: "Chase Day",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Chase",
    email: "joana.simonis84@gmail.com",
  },
  {
    name: "Shawn Manning",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Shawn",
    email: "marjolaine.white94@gmail.com",
  },
  {
    name: "Soren Durham",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Soren",
    email: "vergie.block82@hotmail.com",
  },
  {
    name: "Cortez Herring",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Cortez",
    email: "vito.hudson@hotmail.com",
  },
  {
    name: "Deja Brady",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Deja",
    email: "deja.brady@gmail.com",
  },
];
