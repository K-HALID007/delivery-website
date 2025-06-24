import Navbar from "@/components/home/navbar/navbar";
import Footer from "@/components/home/footer/footer";
import StatePage from "@/components/countries/states/state-page";
import { stateData } from "@/components/countries/states/state-data";

export default function California() {
  const cities = stateData['california'].cities;

  return (
    <>
      <Navbar />
      <StatePage 
        stateName="California"
        countryName="USA"
        countryPath="/countries/usa"
        cities={cities}
      />
      <Footer />
    </>
  );
}