import { getJstDateString } from "@/lib/utils/date";
import { OrderWithCustomer } from "@/types/orderWithCustomer";
import { useEffect, useMemo, useState } from "react";

export interface UserSummary {
  userId: string;
  userName: string;
  totalSales: number;
  totalPostOfficeFee: number;
  totalItems: number;
  completedCount: number;
}

interface ExpenseEntry {
  amount: number;
  category: string;
  memo?: string;
}

interface DailyReport {
  id?: string;
  date: string;
  expenses: ExpenseEntry[];
  totalExpense: number;
}

export interface CurrentSummary extends UserSummary {
  totalExpenses: number;
  netProfit: number;
}

export function useUserSummaries(orders: OrderWithCustomer[]): UserSummary[] {
  return useMemo(() => {
    const grouped = new Map<string, UserSummary>();

    orders
      .filter((o) => o.status === "completed")
      .forEach((order) => {
        const uid = order?.assignedEmployee?.id || undefined;
        if (!uid) return;

        const totalItems = order.items?.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0) ?? 0;
        console.log("order?.assignedEmployee?.name:", order?.assignedEmployee?.name);
        const existing = grouped.get(uid);
        if (existing) {
          existing.totalSales += order.amount ?? 0;
          existing.totalPostOfficeFee += order.postOfficeFee ?? 0;
          existing.totalItems += totalItems;
          existing.completedCount += 1;
        } else {
          grouped.set(uid, {
            userId: uid,
            userName: order?.assignedEmployee?.name ?? "不明なユーザー",
            totalSales: order.amount ?? 0,
            totalPostOfficeFee: order.postOfficeFee ?? 0,
            totalItems,
            completedCount: 1,
          });
        }
      });

    return Array.from(grouped.values());
  }, [orders]);
}

// =====================================================
// useDailyExpenses
// 指定ユーザー・日付の経費レポートを fetch する
// =====================================================

function useDailyExpenses(userId: string | null | undefined, date: string) {
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setReports([]);
      return;
    }

    let cancelled = false;

    const fetchReports = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ date, userId });
        const res = await fetch(`/api/daily-reports?${params}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) {
          setReports(data.success && Array.isArray(data.data) ? data.data : []);
        }
      } catch {
        if (!cancelled) setError("経費の取得に失敗しました");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchReports();
    return () => {
      cancelled = true;
    };
  }, [userId, date]);

  const totalExpenses = useMemo(() => reports.reduce((sum, r) => sum + (r.totalExpense ?? 0), 0), [reports]);

  return { reports, totalExpenses, isLoading, error };
}

// =====================================================
// useCurrentSummary
// 選択ユーザーの集計 + 経費を合算して最終サマリーを返す
// =====================================================

export function useCurrentSummary(userSummaries: UserSummary[], selectedUserId: string | undefined, orders: OrderWithCustomer[]): { summary: CurrentSummary; reports: DailyReport[]; isLoading: boolean; error: string | null } {
  const today = getJstDateString();
  const fetchUserId = selectedUserId ?? null;

  const { reports, totalExpenses, isLoading, error } = useDailyExpenses(fetchUserId, today);

  const summary = useMemo<CurrentSummary>(() => {
    const target = userSummaries.find((u) => u.userId === selectedUserId);
    const totalSales = target?.totalSales ?? 0;

    return {
      userId: target?.userId ?? "",
      userName: target?.userName ?? "",
      totalSales,
      totalPostOfficeFee: target?.totalPostOfficeFee ?? 0,
      totalItems: target?.totalItems ?? 0,
      completedCount: target?.completedCount ?? 0,
      totalExpenses,
      netProfit: totalSales - totalExpenses,
    };
  }, [userSummaries, selectedUserId, totalExpenses]);

  return { summary, reports, isLoading, error };
}

// =====================================================
// useAllUsersSummary
// 全従業員の売上集計 + 経費を Promise.all で並列取得して返す
// admin ダッシュボード用
// =====================================================

export interface AdminUserSummary extends CurrentSummary {
  // 将来的な拡張用（現時点は CurrentSummary と同一）
}

export function useAllUsersSummary(orders: OrderWithCustomer[]): {
  summaries: AdminUserSummary[];
  isLoading: boolean;
  totalSales: number;
  totalPostOfficeFee: number;
  totalExpenses: number;
  totalNetProfit: number;
} {
  const today = getJstDateString();
  const userSummaries = useUserSummaries(orders);
  console.log("userSummaries:", userSummaries);
  const [expenseMap, setExpenseMap] = useState<Map<string, number>>(new Map());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (userSummaries.length === 0) return;

    let cancelled = false;
    setIsLoading(true);

    const fetchAll = async () => {
      try {
        const results = await Promise.all(
          userSummaries.map(async (u) => {
            const params = new URLSearchParams({ date: today, userId: u.userId });
            const res = await fetch(`/api/daily-reports?${params}`);
            if (!res.ok) return { userId: u.userId, totalExpense: 0 };
            const data = await res.json();
            const total: number = data.success && Array.isArray(data.data) ? (data.data as DailyReport[]).reduce((sum, r) => sum + (r.totalExpense ?? 0), 0) : 0;
            return { userId: u.userId, totalExpense: total };
          }),
        );

        if (!cancelled) {
          const map = new Map(results.map((r) => [r.userId, r.totalExpense]));
          setExpenseMap(map);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchAll();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userSummaries.length, today]);

  const summaries = useMemo<AdminUserSummary[]>(() => {
    return userSummaries.map((u) => {
      const totalExpenses = expenseMap.get(u.userId) ?? 0;
      return {
        ...u,
        totalExpenses,
        netProfit: u.totalSales - totalExpenses,
      };
    });
  }, [userSummaries, expenseMap]);

  const totalSales = useMemo(() => summaries.reduce((sum, u) => sum + u.totalSales, 0), [summaries]);
  const totalPostOfficeFee = useMemo(() => summaries.reduce((sum, u) => sum + u.totalPostOfficeFee, 0), [summaries]);
  const totalExpenses = useMemo(() => summaries.reduce((sum, u) => sum + u.totalExpenses, 0), [summaries]);
  const totalNetProfit = totalSales - totalExpenses;

  return { summaries, isLoading, totalSales, totalPostOfficeFee, totalExpenses, totalNetProfit };
}
