/**
 * Accounting Component
 *
 * Fund accounting, chart of accounts, and financial reporting
 * for church financial management.
 */

import { useState, useMemo } from 'react';
import {
  DollarSign,
  TrendingUp,
  PieChart,
  BarChart3,
  FileText,
  Download,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit,
  Eye,
  Building,
  Wallet,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import type { Giving, Person } from '../types';

interface AccountingProps {
  giving: Giving[];
  people: Person[];
  onBack: () => void;
}

interface Account {
  id: string;
  code: string;
  name: string;
  type: 'asset' | 'liability' | 'income' | 'expense' | 'equity';
  category: string;
  balance: number;
  description?: string;
  isActive: boolean;
}

interface Fund {
  id: string;
  name: string;
  description?: string;
  balance: number;
  restricted: boolean;
  purpose?: string;
}

// Sample chart of accounts
const CHART_OF_ACCOUNTS: Account[] = [
  // Assets
  { id: '1', code: '1000', name: 'General Checking', type: 'asset', category: 'Bank Accounts', balance: 45230.50, isActive: true },
  { id: '2', code: '1010', name: 'Savings Account', type: 'asset', category: 'Bank Accounts', balance: 125000.00, isActive: true },
  { id: '3', code: '1100', name: 'Accounts Receivable', type: 'asset', category: 'Receivables', balance: 2500.00, isActive: true },
  { id: '4', code: '1200', name: 'Building', type: 'asset', category: 'Fixed Assets', balance: 850000.00, isActive: true },
  { id: '5', code: '1210', name: 'Equipment', type: 'asset', category: 'Fixed Assets', balance: 45000.00, isActive: true },

  // Liabilities
  { id: '6', code: '2000', name: 'Accounts Payable', type: 'liability', category: 'Payables', balance: 3200.00, isActive: true },
  { id: '7', code: '2100', name: 'Building Mortgage', type: 'liability', category: 'Long-term Debt', balance: 320000.00, isActive: true },

  // Income
  { id: '8', code: '4000', name: 'Tithes & Offerings', type: 'income', category: 'Contributions', balance: 0, isActive: true },
  { id: '9', code: '4010', name: 'Designated Giving', type: 'income', category: 'Contributions', balance: 0, isActive: true },
  { id: '10', code: '4100', name: 'Facility Rental', type: 'income', category: 'Other Income', balance: 0, isActive: true },

  // Expenses
  { id: '11', code: '5000', name: 'Salaries & Wages', type: 'expense', category: 'Personnel', balance: 0, isActive: true },
  { id: '12', code: '5010', name: 'Benefits', type: 'expense', category: 'Personnel', balance: 0, isActive: true },
  { id: '13', code: '5100', name: 'Utilities', type: 'expense', category: 'Facilities', balance: 0, isActive: true },
  { id: '14', code: '5110', name: 'Maintenance', type: 'expense', category: 'Facilities', balance: 0, isActive: true },
  { id: '15', code: '5200', name: 'Ministry Supplies', type: 'expense', category: 'Ministry', balance: 0, isActive: true },
  { id: '16', code: '5210', name: 'Missions', type: 'expense', category: 'Ministry', balance: 0, isActive: true },
];

// Sample funds
const FUNDS: Fund[] = [
  { id: '1', name: 'General Fund', balance: 145230.50, restricted: false, description: 'Unrestricted operating fund' },
  { id: '2', name: 'Building Fund', balance: 85000.00, restricted: true, purpose: 'Building improvements and mortgage' },
  { id: '3', name: 'Missions Fund', balance: 12500.00, restricted: true, purpose: 'Local and global missions support' },
  { id: '4', name: 'Benevolence Fund', balance: 8750.00, restricted: true, purpose: 'Assistance for those in need' },
  { id: '5', name: 'Youth Ministry', balance: 4200.00, restricted: true, purpose: 'Youth programs and events' },
];

function SummaryCard({
  title,
  value,
  change,
  changeLabel,
  icon,
  color,
}: {
  title: string;
  value: string;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {value}
          </p>
          {change !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              {change >= 0 ? (
                <ArrowUpRight className="w-4 h-4 text-green-500" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-red-500" />
              )}
              <span
                className={`text-sm font-medium ${
                  change >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {change >= 0 ? '+' : ''}{change}%
              </span>
              {changeLabel && (
                <span className="text-sm text-gray-500">{changeLabel}</span>
              )}
            </div>
          )}
        </div>
        <div className={`p-3 ${color} rounded-lg`}>{icon}</div>
      </div>
    </div>
  );
}

function ChartOfAccounts({ accounts }: { accounts: Account[] }) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['Bank Accounts', 'Contributions']));

  const groupedAccounts = useMemo(() => {
    const groups: Record<string, Record<string, Account[]>> = {
      asset: {},
      liability: {},
      income: {},
      expense: {},
      equity: {},
    };

    accounts.forEach((account) => {
      if (!groups[account.type][account.category]) {
        groups[account.type][account.category] = [];
      }
      groups[account.type][account.category].push(account);
    });

    return groups;
  }, [accounts]);

  const typeLabels = {
    asset: { label: 'Assets', color: 'text-blue-600' },
    liability: { label: 'Liabilities', color: 'text-red-600' },
    income: { label: 'Income', color: 'text-green-600' },
    expense: { label: 'Expenses', color: 'text-orange-600' },
    equity: { label: 'Equity', color: 'text-purple-600' },
  };

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Chart of Accounts
        </h2>
        <button className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm">
          <Plus className="w-4 h-4" />
          Add Account
        </button>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {Object.entries(groupedAccounts).map(([type, categories]) => {
          if (Object.keys(categories).length === 0) return null;
          const typeInfo = typeLabels[type as keyof typeof typeLabels];

          return (
            <div key={type} className="p-4">
              <h3 className={`font-semibold ${typeInfo.color} mb-3`}>
                {typeInfo.label}
              </h3>
              {Object.entries(categories).map(([category, categoryAccounts]) => (
                <div key={category} className="mb-2">
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded"
                  >
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {category}
                    </span>
                    <ChevronRight
                      className={`w-4 h-4 text-gray-400 transition-transform ${
                        expandedCategories.has(category) ? 'rotate-90' : ''
                      }`}
                    />
                  </button>
                  {expandedCategories.has(category) && (
                    <div className="ml-4 mt-1 space-y-1">
                      {categoryAccounts.map((account) => (
                        <div
                          key={account.id}
                          className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900/50 rounded text-sm"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-gray-500 font-mono">
                              {account.code}
                            </span>
                            <span className="text-gray-900 dark:text-white">
                              {account.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="font-medium text-gray-900 dark:text-white">
                              ${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </span>
                            <div className="flex items-center gap-1">
                              <button className="p-1 text-gray-400 hover:text-gray-600">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="p-1 text-gray-400 hover:text-gray-600">
                                <Edit className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FundBalances({ funds }: { funds: Fund[] }) {
  const totalBalance = funds.reduce((sum, fund) => sum + fund.balance, 0);
  const restrictedTotal = funds.filter(f => f.restricted).reduce((sum, fund) => sum + fund.balance, 0);
  const unrestrictedTotal = totalBalance - restrictedTotal;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Fund Balances
        </h2>
        <div className="flex gap-4 mt-2 text-sm">
          <span className="text-gray-500">
            Total: <span className="font-medium text-gray-900 dark:text-white">${totalBalance.toLocaleString()}</span>
          </span>
          <span className="text-green-600">
            Unrestricted: ${unrestrictedTotal.toLocaleString()}
          </span>
          <span className="text-amber-600">
            Restricted: ${restrictedTotal.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {funds.map((fund) => (
          <div key={fund.id} className="p-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {fund.name}
                </h3>
                {fund.restricted && (
                  <span className="px-2 py-0.5 text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-full">
                    Restricted
                  </span>
                )}
              </div>
              {fund.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {fund.description}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                ${fund.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-gray-500">
                {((fund.balance / totalBalance) * 100).toFixed(1)}% of total
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FinancialReports() {
  const reports = [
    { name: 'Income Statement', description: 'Revenue and expenses for the period', icon: <TrendingUp className="w-5 h-5" /> },
    { name: 'Balance Sheet', description: 'Assets, liabilities, and fund balances', icon: <BarChart3 className="w-5 h-5" /> },
    { name: 'Cash Flow Statement', description: 'Cash inflows and outflows', icon: <Wallet className="w-5 h-5" /> },
    { name: 'Fund Report', description: 'Activity by fund', icon: <PieChart className="w-5 h-5" /> },
    { name: 'Budget vs Actual', description: 'Compare budgeted to actual amounts', icon: <FileText className="w-5 h-5" /> },
    { name: 'Giving Summary', description: 'Contribution summary by period', icon: <DollarSign className="w-5 h-5" /> },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Financial Reports
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {reports.map((report) => (
          <button
            key={report.name}
            className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
          >
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded">
              {report.icon}
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {report.name}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {report.description}
              </p>
            </div>
            <Download className="w-4 h-4 text-gray-400 ml-auto" />
          </button>
        ))}
      </div>
    </div>
  );
}

export function Accounting({ giving, people: _people, onBack }: AccountingProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'accounts' | 'funds' | 'reports'>('overview');

  // Calculate summary stats from giving data
  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = giving.filter(g => {
      const date = new Date(g.date);
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    });
    const lastMonth = giving.filter(g => {
      const date = new Date(g.date);
      const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1);
      return date.getMonth() === lastMonthDate.getMonth() && date.getFullYear() === lastMonthDate.getFullYear();
    });

    const thisMonthTotal = thisMonth.reduce((sum, g) => sum + g.amount, 0);
    const lastMonthTotal = lastMonth.reduce((sum, g) => sum + g.amount, 0);
    const changePercent = lastMonthTotal > 0 ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100 : 0;

    const yearTotal = giving.filter(g => new Date(g.date).getFullYear() === now.getFullYear())
      .reduce((sum, g) => sum + g.amount, 0);

    return {
      thisMonth: thisMonthTotal,
      lastMonth: lastMonthTotal,
      changePercent: Math.round(changePercent),
      yearToDate: yearTotal,
      totalAssets: CHART_OF_ACCOUNTS.filter(a => a.type === 'asset').reduce((sum, a) => sum + a.balance, 0),
      totalLiabilities: CHART_OF_ACCOUNTS.filter(a => a.type === 'liability').reduce((sum, a) => sum + a.balance, 0),
    };
  }, [giving]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Giving
        </button>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Building className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Fund Accounting
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                Manage church finances and generate reports
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
              <Calendar className="w-4 h-4" />
              This Month
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <SummaryCard
          title="This Month's Giving"
          value={`$${stats.thisMonth.toLocaleString()}`}
          change={stats.changePercent}
          changeLabel="vs last month"
          icon={<DollarSign className="w-6 h-6 text-white" />}
          color="bg-green-500"
        />
        <SummaryCard
          title="Year to Date"
          value={`$${stats.yearToDate.toLocaleString()}`}
          icon={<TrendingUp className="w-6 h-6 text-white" />}
          color="bg-blue-500"
        />
        <SummaryCard
          title="Total Assets"
          value={`$${stats.totalAssets.toLocaleString()}`}
          icon={<Wallet className="w-6 h-6 text-white" />}
          color="bg-purple-500"
        />
        <SummaryCard
          title="Total Liabilities"
          value={`$${stats.totalLiabilities.toLocaleString()}`}
          icon={<CreditCard className="w-6 h-6 text-white" />}
          color="bg-amber-500"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'accounts', label: 'Chart of Accounts' },
          { id: 'funds', label: 'Fund Balances' },
          { id: 'reports', label: 'Reports' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-4 py-3 font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-400'
                : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FundBalances funds={FUNDS} />
          <FinancialReports />
        </div>
      )}

      {activeTab === 'accounts' && (
        <ChartOfAccounts accounts={CHART_OF_ACCOUNTS} />
      )}

      {activeTab === 'funds' && (
        <FundBalances funds={FUNDS} />
      )}

      {activeTab === 'reports' && (
        <FinancialReports />
      )}
    </div>
  );
}

export default Accounting;
