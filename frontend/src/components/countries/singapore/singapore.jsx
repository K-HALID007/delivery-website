import UniversalCountryPage from '../universal-country';
import { Truck, Clock, Shield } from 'lucide-react';

export default function SingaporePage() {
  const states = [
    'Central', 'North-East', 'East', 'North', 'West'
  ];

  const services = [
    {
      title: 'Express Delivery',
      description: 'Same day delivery within 2-4 hours',
      icon: <Truck className="w-12 h-12 text-yellow-500" />,
      time: '2-4 Hours'
    },
    {
      title: 'Standard Delivery',
      description: 'Next day delivery across Singapore',
      icon: <Clock className="w-12 h-12 text-yellow-500" />,
      time: 'Next Day'
    },
    {
      title: 'Premium Service',
      description: 'Priority handling with real-time tracking',
      icon: <Shield className="w-12 h-12 text-yellow-500" />,
      time: '1-2 Hours'
    }
  ];

  const cities = [
    { name: 'Central Business District', deliveries: '25,000+', rating: 4.9 },
    { name: 'Orchard Road', deliveries: '20,000+', rating: 4.8 },
    { name: 'Marina Bay', deliveries: '18,000+', rating: 4.9 },
    { name: 'Jurong', deliveries: '15,000+', rating: 4.7 },
    { name: 'Tampines', deliveries: '12,000+', rating: 4.6 },
    { name: 'Woodlands', deliveries: '10,000+', rating: 4.8 }
  ];

  return (
    <UniversalCountryPage
      countryName="Singapore"
      states={states}
      services={services}
      cities={cities}
      phoneNumber="+65 6123-4567"
      email="singapore@primedispatcher.com"
    />
  );
}