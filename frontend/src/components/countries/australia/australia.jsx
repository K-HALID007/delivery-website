import UniversalCountryPage from '../universal-country';
import { Truck, Clock, Shield } from 'lucide-react';

export default function AustraliaPage() {
  const states = [
    'New South Wales', 'Victoria', 'Queensland', 'Western Australia', 
    'South Australia', 'Tasmania', 'Northern Territory', 'Australian Capital Territory'
  ];

  const services = [
    {
      title: 'Express Post',
      description: 'Next business day delivery to major cities',
      icon: <Truck className="w-12 h-12 text-yellow-500" />,
      time: 'Next Day'
    },
    {
      title: 'Standard Post',
      description: 'Regular delivery within 2-5 business days',
      icon: <Clock className="w-12 h-12 text-yellow-500" />,
      time: '2-5 Days'
    },
    {
      title: 'Priority Service',
      description: 'Same day delivery in metro areas',
      icon: <Shield className="w-12 h-12 text-yellow-500" />,
      time: 'Same Day'
    }
  ];

  const cities = [
    { name: 'Sydney', deliveries: '80,000+', rating: 4.8 },
    { name: 'Melbourne', deliveries: '75,000+', rating: 4.9 },
    { name: 'Brisbane', deliveries: '50,000+', rating: 4.7 },
    { name: 'Perth', deliveries: '40,000+', rating: 4.6 },
    { name: 'Adelaide', deliveries: '30,000+', rating: 4.8 },
    { name: 'Canberra', deliveries: '25,000+', rating: 4.7 }
  ];

  return (
    <UniversalCountryPage
      countryName="Australia"
      states={states}
      services={services}
      cities={cities}
      phoneNumber="+61 2-1234-5678"
      email="australia@primedispatcher.com"
    />
  );
}