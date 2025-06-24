import Navbar from "@/components/home/navbar/navbar";
import Footer from "@/components/home/footer/footer";
import StatePage from "@/components/countries/states/state-page";
import { stateData } from "@/components/countries/states/state-data";

export default function TamilNadu() {
  const cities = stateData['tamil-nadu'].cities;

  return (
    <>
      <Navbar />
      <StatePage 
        stateName="Tamil Nadu"
        countryName="India"
        countryPath="/countries/india"
        cities={cities}
      />
      <Footer />
    </>
  );
}