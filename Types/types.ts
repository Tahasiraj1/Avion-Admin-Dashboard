export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  color: string;
  size: string;
}

export interface CustomerDetails {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  city: string;
  houseNo: string;
  postalCode: string;
  country: string;
}

export interface Order {
  id: string;
  totalAmount: number;
  createdAt: string;
  customerDetails: CustomerDetails;
  items: OrderItem[];
  status: string;
}

export interface ShippingLabel {
  label_id: string;
  tracking_number: string;
  label_download: {
    pdf: string;
    png: string;
    zpl: string;
  };
}
