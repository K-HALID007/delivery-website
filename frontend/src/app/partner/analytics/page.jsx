import { redirect } from 'next/navigation';

// Earnings already includes period totals and the daily breakdown.
export default function PartnerAnalyticsRedirect() {
  redirect('/partner/earnings');
}
