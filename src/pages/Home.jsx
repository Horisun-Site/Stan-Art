import Navbar from "../component/Navbar";
import Footer from "../component/Footer";
import HoSec1 from "../component/HoSec1";
import Hosec2 from "../component/HoSec2";
import Hosec3 from "../component/HoSec3";
import HoSec4 from "../component/HoSec4";

const Home = () => {
  return (
    <div className="bg-[#f8f7f3]">
      <Navbar />
      <HoSec1 />
      <Hosec2 />
      <Hosec3 />
      <HoSec4 />
      <Footer />
    </div>
  );
};

export default Home;
