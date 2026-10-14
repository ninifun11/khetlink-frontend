'use client';
import { useAuth } from '@/lib/auth-context';
import { PageHeader } from '@/components/ui';
import SellerOverview from '@/components/dashboard/SellerOverview';
import BuyerOverview from '@/components/dashboard/BuyerOverview';
import AdminOverview from '@/components/dashboard/AdminOverview';

export default function DashboardHome() {
  const { profile } = useAuth();
  if (!profile) return null;
  const first = (profile.full_name || '').split(' ')[0];
  const View = { farmer: SellerOverview, fpo: SellerOverview, admin: AdminOverview }[profile.role] || BuyerOverview;
  const subtitle = {
    farmer: 'How your produce is selling and how much more you earn than at the mandi.',
    fpo: 'Sales across your members, plus what pooled logistics is saving.',
    admin: 'Platform health and impact across all users.',
  }[profile.role] || 'Your orders, spending and savings.';

  return (
    <>
      <PageHeader title={first ? `Hello, ${first}` : 'Overview'} subtitle={subtitle} />
      <View />
    </>
  );
}
