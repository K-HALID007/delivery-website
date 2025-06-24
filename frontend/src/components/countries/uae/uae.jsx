import UniversalCountryPage from '../universal-country';
import { Truck, Clock, Shield } from 'lucide-react';

export default function UAEPage() {
  const states = [
    'Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Fujairah', 'Ras Al Khaimah', 'Umm Al Quwain'
  ];

  const services = [
    {
      title: 'Same Day Delivery',
      description: 'Express delivery within 4-6 hours',
      icon: <Truck className="w-12 h-12 text-yellow-500" />,
      time: '4-6 Hours'
    },
    {
      title: 'Next Day Delivery',
      description: 'Guaranteed delivery by next day',
      icon: <Clock className="w-12 h-12 text-yellow-500" />,
      time: 'Next Day'
    },
    {
      title: 'Premium Service',
      description: 'White glove delivery with tracking',
      icon: <Shield className="w-12 h-12 text-yellow-500" />,
      time: '2-3 Hours'
    }
  ];

  const cities = [
    { name: 'Dubai', deliveries: '60,000+', rating: 4.9 },
    { name: 'Abu Dhabi', deliveries: '45,000+', rating: 4.8 },
    { name: 'Sharjah', deliveries: '35,000+', rating: 4.7 },
    { name: 'Ajman', deliveries: '20,000+', rating: 4.6 },
    { name: 'Fujairah', deliveries: '15,000+', rating: 4.8 },
    { name: 'Ras Al Khaimah', deliveries: '18,000+', rating: 4.7 }
  ];

  return (
    <UniversalCountryPage
      countryName="UAE"
      states={states}
      services={services}
      cities={cities}
      phoneNumber="+971 4-123-4567"
      email="uae@primedispatcher.com"
    />
  );
}