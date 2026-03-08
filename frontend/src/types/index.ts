export interface InvestorInfo {
  name: string;
  email: string;
  mobile: string;
  address: string;
}

export interface Transaction {
  date: string;
  description: string;
  amount: number;
  units: number;
  nav: number;
  balance: number;
  type: string;
  scheme: string;
  folio: string;
  amc: string;
}

export interface Scheme {
  scheme: string;
  folio: string;
  amc: string;
  isin: string;
  units: number;
  nav: number;
  nav_date: string;
  current_value: number;
  invested_amount: number;
  gain_loss: number;
  gain_loss_pct: number;
  category: string;
  transactions: Transaction[];
}

export interface Folio {
  folio: string;
  amc: string;
  pan: string;
  kyc: string;
  schemes: Scheme[];
}

export interface PortfolioSummary {
  total_invested: number;
  total_current_value: number;
  total_gain_loss: number;
  total_gain_loss_pct: number;
  total_funds: number;
  total_folios: number;
  sip_invested: number;
  lumpsum_invested: number;
}

export interface AmcDistribution {
  amc: string;
  invested: number;
  current: number;
}

export interface CategoryDistribution {
  category: string;
  invested: number;
  current: number;
}

export interface SchemeDistribution {
  scheme: string;
  amc: string;
  category: string;
  invested: number;
  current: number;
  gain_loss: number;
  gain_loss_pct: number;
  units: number;
  nav: number;
}

export interface TopHolding {
  scheme: string;
  amc: string;
  current: number;
  gain_loss_pct: number;
}

export interface InvestmentGrowth {
  month: string;
  cumulative_invested: number;
}

export interface Analytics {
  amc_distribution: AmcDistribution[];
  category_distribution: CategoryDistribution[];
  scheme_distribution: SchemeDistribution[];
  top_10_holdings: TopHolding[];
  investment_growth: InvestmentGrowth[];
  sip_vs_lumpsum: { sip: number; lumpsum: number };
}

export interface CASResponse {
  investor_info: InvestorInfo;
  folios: Folio[];
  schemes: Scheme[];
  transactions: Transaction[];
  portfolio_summary: PortfolioSummary;
  analytics: Analytics;
}

export interface StockEntry {
  id: string;
  symbol: string;
  quantity: number;
  avg_price: number;
  current_price: number;
}
