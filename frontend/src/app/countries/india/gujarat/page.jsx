import Navbar from "@/components/home/navbar/navbar";
import Footer from "@/components/home/footer/footer";
import StatePage from "@/components/countries/states/state-page";
import { stateData } from "@/components/countries/states/state-data";

export default function Gujarat() {
  const cities = stateData['gujarat'].cities;

  return (
    <>
      <Navbar />
      <StatePage 
        stateName="Gujarat"
        countryName="India"
        countryPath="/countries/india"
        cities={cities}
      />
      <Footer />
    </>
  );
}