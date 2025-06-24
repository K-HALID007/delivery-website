import Navbar from "@/components/home/navbar/navbar";
import Footer from "@/components/home/footer/footer";
import StatePage from "@/components/countries/states/state-page";
import { stateData } from "@/components/countries/states/state-data";

export default function Victoria() {
  const cities = stateData['victoria'].cities;

  return (
    <>
      <Navbar />
      <StatePage 
        stateName="Victoria"
        countryName="Australia"
        countryPath="/countries/australia"
        cities={cities}
      />
      <Footer />
    </>
  );
}