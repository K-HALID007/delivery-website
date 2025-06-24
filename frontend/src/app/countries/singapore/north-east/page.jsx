import Navbar from "@/components/home/navbar/navbar";
import Footer from "@/components/home/footer/footer";
import StatePage from "@/components/countries/states/state-page";
import { stateData } from "@/components/countries/states/state-data";

export default function NorthEast() {
  const cities = stateData['north-east'].cities;

  return (
    <>
      <Navbar />
      <StatePage 
        stateName="North-East"
        countryName="Singapore"
        countryPath="/countries/singapore"
        cities={cities}
      />
      <Footer />
    </>
  );
}