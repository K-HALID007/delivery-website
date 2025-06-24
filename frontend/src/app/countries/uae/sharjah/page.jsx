import Navbar from "@/components/home/navbar/navbar";
import Footer from "@/components/home/footer/footer";
import StatePage from "@/components/countries/states/state-page";
import { stateData } from "@/components/countries/states/state-data";

export default function Sharjah() {
  const cities = stateData['sharjah'].cities;

  return (
    <>
      <Navbar />
      <StatePage 
        stateName="Sharjah"
        countryName="UAE"
        countryPath="/countries/uae"
        cities={cities}
      />
      <Footer />
    </>
  );
}