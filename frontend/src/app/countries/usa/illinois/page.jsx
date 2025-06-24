import Navbar from "@/components/home/navbar/navbar";
import Footer from "@/components/home/footer/footer";
import StatePage from "@/components/countries/states/state-page";
import { stateData } from "@/components/countries/states/state-data";

export default function Illinois() {
  const cities = stateData['illinois'].cities;

  return (
    <>
      <Navbar />
      <StatePage 
        stateName="Illinois"
        countryName="USA"
        countryPath="/countries/usa"
        cities={cities}
      />
      <Footer />
    </>
  );
}