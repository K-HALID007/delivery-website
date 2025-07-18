import Navbar from "@/components/home/navbar/navbar";
import Footer from "@/components/home/footer/footer";
import StatePage from "@/components/countries/states/state-page";
import { stateData } from "@/components/countries/states/state-data";

export default function AbuDhabi() {
  const cities = stateData['abu-dhabi'].cities;

  return (
    <>
      <Navbar />
      <StatePage 
        stateName="Abu Dhabi"
        countryName="UAE"
        countryPath="/countries/uae"
        cities={cities}
      />
      <Footer />
    </>
  );
}