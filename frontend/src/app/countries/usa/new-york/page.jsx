import Navbar from "@/components/home/navbar/navbar";
import Footer from "@/components/home/footer/footer";
import StatePage from "@/components/countries/states/state-page";
import { stateData } from "@/components/countries/states/state-data";

export default function NewYork() {
  const cities = stateData['new-york'].cities;

  return (
    <>
      <Navbar />
      <StatePage 
        stateName="New York"
        countryName="USA"
        countryPath="/countries/usa"
        cities={cities}
      />
      <Footer />
    </>
  );
}