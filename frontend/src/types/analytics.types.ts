export interface IAnalyticsData {
  totalSales: number;
  netEarnings: number;
  availableBalance: number;
  pendingBalance: number;
  totalWithdrawn: number;
  totalOrders: number;
  deliveredOrdersCount: number;
  pendingOrdersCount: number;
  totalProducts: number;
}

export interface IChartDataPoint {
  label: string;
  value: number;
  secondaryValue?: number;
}
