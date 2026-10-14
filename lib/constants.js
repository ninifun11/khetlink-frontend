export const ROLES = {
  farmer: { label: 'Farmer', blurb: 'Sell your harvest directly' },
  fpo: { label: 'FPO / cooperative', blurb: 'Aggregate members’ produce and run logistics' },
  consumer: { label: 'Household', blurb: 'Buy fresh produce for your home' },
  bulk_buyer: { label: 'Bulk buyer', blurb: 'Restaurants, hostels, retailers' },
  driver: { label: 'Driver', blurb: 'Deliver pooled loads' },
  admin: { label: 'Admin', blurb: 'Platform oversight' },
};
export const SIGNUP_ROLES = ['farmer', 'fpo', 'consumer', 'bulk_buyer', 'driver'];
export const SELLER_ROLES = ['farmer', 'fpo'];

export const CATEGORIES = ['vegetables', 'fruits', 'grains', 'pulses', 'spices', 'dairy', 'other'];
export const UNITS = ['kg', 'quintal', 'dozen', 'piece', 'bunch'];
export const UNIT_KG = { kg: 1, quintal: 100, dozen: 1.2, piece: 0.25, bunch: 0.25 };

// Crops with market data in the demo (must match the names in the market_data table)
export const CROPS = [
  { name: 'Tomato', emoji: '🍅', category: 'vegetables', unit: 'kg' },
  { name: 'Onion', emoji: '🧅', category: 'vegetables', unit: 'kg' },
  { name: 'Potato', emoji: '🥔', category: 'vegetables', unit: 'kg' },
  { name: 'Brinjal', emoji: '🍆', category: 'vegetables', unit: 'kg' },
  { name: 'Okra', emoji: '🌿', category: 'vegetables', unit: 'kg' },
  { name: 'Cauliflower', emoji: '🥦', category: 'vegetables', unit: 'kg' },
  { name: 'Spinach', emoji: '🥬', category: 'vegetables', unit: 'kg' },
  { name: 'Green Chilli', emoji: '🌶️', category: 'vegetables', unit: 'kg' },
  { name: 'Banana', emoji: '🍌', category: 'fruits', unit: 'kg' },
  { name: 'Mango', emoji: '🥭', category: 'fruits', unit: 'kg' },
  { name: 'Rice', emoji: '🌾', category: 'grains', unit: 'quintal' },
  { name: 'Toor Dal', emoji: '🫘', category: 'pulses', unit: 'quintal' },
];

export const DISTRICTS = ['Hyderabad', 'Rangareddy', 'Medak', 'Sangareddy', 'Vikarabad', 'Warangal', 'Nalgonda', 'Karimnagar', 'Nizamabad', 'Siddipet', 'Mahabubnagar'];

// Quick-pick delivery localities (Hyderabad)
export const LOCALITIES = [
  { name: 'Kukatpally', lat: 17.4948, lng: 78.3996 },
  { name: 'Madhapur', lat: 17.4483, lng: 78.3915 },
  { name: 'Gachibowli', lat: 17.4401, lng: 78.3489 },
  { name: 'Banjara Hills', lat: 17.4126, lng: 78.4482 },
  { name: 'Jubilee Hills', lat: 17.4326, lng: 78.4071 },
  { name: 'Secunderabad', lat: 17.4399, lng: 78.4983 },
  { name: 'Ameerpet', lat: 17.4375, lng: 78.4483 },
  { name: 'Uppal', lat: 17.3984, lng: 78.5583 },
  { name: 'LB Nagar', lat: 17.3457, lng: 78.5522 },
  { name: 'Miyapur', lat: 17.4969, lng: 78.3546 },
];

// Depots an FPO can dispatch from
export const HUBS = [
  { name: 'Patancheru hub', lat: 17.533, lng: 78.265 },
  { name: 'Shamshabad hub', lat: 17.2403, lng: 78.4294 },
  { name: 'Medchal hub', lat: 17.6296, lng: 78.4814 },
  { name: 'Bowenpally market yard', lat: 17.4726, lng: 78.4787 },
];

export const HYDERABAD = { lat: 17.385, lng: 78.4867 };

export const ORDER_STATUS = {
  placed: { label: 'Placed', tone: 'neutral' },
  confirmed: { label: 'Confirmed', tone: 'info' },
  packed: { label: 'Packed', tone: 'info' },
  in_transit: { label: 'On the way', tone: 'warn' },
  delivered: { label: 'Delivered', tone: 'good' },
  cancelled: { label: 'Cancelled', tone: 'bad' },
};
export const ORDER_FLOW = ['placed', 'confirmed', 'packed', 'in_transit', 'delivered'];

export const SHIPMENT_STATUS = {
  planned: { label: 'Planned', tone: 'neutral' },
  in_transit: { label: 'On the road', tone: 'warn' },
  completed: { label: 'Completed', tone: 'good' },
  cancelled: { label: 'Cancelled', tone: 'bad' },
};

export const ROUTE_COLORS = ['#2A3B7D', '#E3A008', '#3B7E30', '#B8362A', '#7A4FBF', '#0E8A8A'];
