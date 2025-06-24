import UniversalCountryPage from '../universal-country';
import { Truck, Clock, Shield } from 'lucide-react';

export default function IndiaPage() {
  const states = [
    'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Delhi', 'Gujarat',
    'Rajasthan', 'Uttar Pradesh', 'West Bengal', 'Madhya Pradesh', 'Punjab'
  ];

  const services = [
    {
      title: 'Express Delivery',
      description: 'Same day delivery in major cities',
      icon: <Truck className="w-12 h-12 text-yellow-500" />,
      time: '4-6 hours'
    },
    {
      title: 'Standard Delivery',
      description: 'Next day delivery across India',
      icon: <Clock className="w-12 h-12 text-yellow-500" />,
      time: '1-2 days'
    },
    {
      title: 'Secure Delivery',
      description: 'High-value item delivery with insurance',
      icon: <Shield className="w-12 h-12 text-yellow-500" />,
      time: '2-3 days'
    }
  ];

  const cities = [
    { name: 'Mumbai', deliveries: '50,000+', rating: 4.8 },
    { name: 'Delhi', deliveries: '45,000+', rating: 4.7 },
    { name: 'Bangalore', deliveries: '40,000+', rating: 4.9 },
    { name: 'Chennai', deliveries: '35,000+', rating: 4.6 },
    { name: 'Hyderabad', deliveries: '30,000+', rating: 4.8 },
    { name: 'Pune', deliveries: '25,000+', rating: 4.7 }
  ];

  return (
    <UniversalCountryPage
      countryName="India"
      states={states}
      services={services}
      cities={cities}
      phoneNumber="+91 1800-123-4567"
      email="india@primedispatcher.com"
    />
  );
}