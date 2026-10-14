import { BarChart3, Boxes, ClipboardList, LayoutDashboard, Route, Settings, Truck, Sprout } from 'lucide-react';

const overview = { href: '/dashboard', label: 'Overview', icon: LayoutDashboard };
const settings = { href: '/dashboard/settings', label: 'Profile & location', icon: Settings };

export const NAV = {
  farmer: [
    overview,
    { href: '/dashboard/products', label: 'My listings', icon: Boxes },
    { href: '/dashboard/orders', label: 'Orders', icon: ClipboardList },
    { href: '/dashboard/insights', label: 'Market outlook', icon: BarChart3 },
    settings,
  ],
  fpo: [
    overview,
    { href: '/dashboard/products', label: 'Listings', icon: Boxes },
    { href: '/dashboard/orders', label: 'Orders', icon: ClipboardList },
    { href: '/dashboard/logistics', label: 'Logistics', icon: Route },
    { href: '/dashboard/insights', label: 'Market outlook', icon: BarChart3 },
    settings,
  ],
  consumer: [
    overview,
    { href: '/dashboard/orders', label: 'My orders', icon: ClipboardList },
    { href: '/dashboard/insights', label: 'Price outlook', icon: BarChart3 },
    settings,
  ],
  bulk_buyer: [
    overview,
    { href: '/dashboard/orders', label: 'My orders', icon: ClipboardList },
    { href: '/dashboard/insights', label: 'Price outlook', icon: BarChart3 },
    settings,
  ],
  driver: [
    { href: '/dashboard/deliveries', label: 'My deliveries', icon: Truck },
    settings,
  ],
  admin: [
    { ...overview, label: 'Platform overview' },
    { href: '/dashboard/orders', label: 'All orders', icon: ClipboardList },
    { href: '/dashboard/logistics', label: 'Logistics', icon: Route },
    { href: '/dashboard/products', label: 'All listings', icon: Sprout },
    { href: '/dashboard/insights', label: 'Market outlook', icon: BarChart3 },
    settings,
  ],
};
