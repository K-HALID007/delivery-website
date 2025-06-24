import Navbar from "@/components/home/navbar/navbar";
import Footer from "@/components/home/footer/footer";
import StatePage from "@/components/countries/states/state-page";
import { stateData } from "@/components/countries/states/state-data";

export default function WesternAustralia() {
  const cities = stateData['western-australia'].cities;

  return (
    <>
      <Navbar />
      <StatePage 
        stateName="Western Australia"
        countryName="Australia"
        countryPath="/countries/australia"
        cities={cities}
      />
      <Footer />
    </>
  );
}