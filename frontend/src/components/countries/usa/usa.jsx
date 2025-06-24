import UniversalCountryPage from '../universal-country';
import { Truck, Clock, Shield } from 'lucide-react';

export default function USAPage() {
  const states = [
    'California', 'Texas', 'Florida', 'New York', 'Illinois',
    'Pennsylvania', 'Ohio', 'Georgia', 'North Carolina', 'Michigan'
  ];

  const services = [
    {
      title: 'Overnight Express',
      description: 'Next business day delivery by 10:30 AM',
      icon: <Truck className="w-12 h-12 text-yellow-500" />,
      time: 'Next Day'
    },
    {
      title: '2-Day Delivery',
      description: 'Delivery within 2 business days',
      icon: <Clock className="w-12 h-12 text-yellow-500" />,
      time: '2 Days'
    },
    {
      title: 'Ground Shipping',
      description: 'Cost-effective delivery in 3-5 days',
      icon: <Shield className="w-12 h-12 text-yellow-500" />,
      time: '3-5 Days'
    }
  ];

  const cities = [
    { name: 'New York', deliveries: '75,000+', rating: 4.9 },
    { name: 'Los Angeles', deliveries: '65,000+', rating: 4.8 },
    { name: 'Chicago', deliveries: '55,000+', rating: 4.7 },
    { name: 'Houston', deliveries: '45,000+', rating: 4.8 },
    { name: 'Miami', deliveries: '40,000+', rating: 4.6 },
    { name: 'San Francisco', deliveries: '35,000+', rating: 4.9 }
  ];

  return (
    <UniversalCountryPage
      countryName="USA"
      states={states}
      services={services}
      cities={cities}
      phoneNumber="+1 800-123-4567"
      email="usa@primedispatcher.com"
    />
  );
}