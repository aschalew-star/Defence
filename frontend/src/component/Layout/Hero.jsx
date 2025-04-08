import React from "react";

function Hero() {
  return (
    <div>
      <div>
        <div className="pt-2 flex-col ">
          <div className="font-medium text-[20px] text-center text-blue-800 pt-8">
            ETHIOPIAN EXCHANGE PLATFORM <br />
            FOR TRADITIONAL CLOTH
          </div>
          <div className="text-black text-center text-[16px] pb-8">
            Immerse yourself in the beauty of Ethiopian tradition, where every
            thread tells a story. <br/>Our platform brings the timeless elegance of
            Ethiopian cloth to your wardrobe,  weaving heritage <br/>into
            modern style. Celebrate culture, embrace craftsmanship, and wear the
            history of Ethiopia with pride.<br/>
             We bridge the past and future of fashion, one exquisite
            garment at a time.
          </div>
        </div>
      </div>
      <div className="justify-center items-center font-bold text-[20px] ml-16">
      Age-Based Collection
      </div>
      <div className="flex flex-col gap-4 md:flex-row mx-5 md:mx-auto justify-center w-full shadow-lg mb-16 mt-1 pt-10">
        <div className="flex flex-row gap-16 justify-center w-full md:w-2/5 -mt-1 h-[250px] md:h-[33vh] flex-1 ">
          <a href="" className="w-full md:w-2/5 shadow-lg relative">
            <div
              className="bg-cover bg-center w-full h-[350px] -mr-10 md:h-[33vh] flex-2 "
              style={{ backgroundImage: "url('/photo.jpg')" }}
            >
              <div className="text-blue-900 text-[20px] absolute top-0 left-4 -mt-9"> Adult Cloth</div>
            </div>
          </a>
          <a href="" className="w-full md:w-2/5 shadow-lg relative">
            <div
              className="bg-cover bg-center  w-full  h-[350px] md:h-[33vh] flex-2"
              style={{ backgroundImage: "url('/hero.jpg')" }}
            >
              <div className="text-blue-900 text-[20px] absolute top-0 left-4 -mt-9"> Adult Cloth</div>
            </div>
          </a>
        </div>
        <div className="flex  gap-16 w-full md:w-2/5 md:flex-row -mt-1 h-[250px] md:h-[33vh] flex-1 ">
          <a href="" className="w-2/5 shadow-lg relative">
            <div
              className="bg-cover bg-center  w-full  h-[350px] md:h-[33vh] flex-2"
              style={{ backgroundImage: "url('/10115.jpg')" }}
            >
              <div className="text-blue-900 text-[20px] absolute top-0 left-4 -mt-9"> Adult Cloth</div>
            </div>
          </a>
          <a href="" className="w-2/5 shadow-lg relative ">
            <div
              className="bg-cover bg-center  w-full h-[350px] md:h-[33vh] flex-2"
              style={{ backgroundImage: "url('/10138.jpg')" }}
            >
              <div className="text-blue-900 text-[20px] absolute top-0 left-4 -mt-9"> Adult Cloth</div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}

export default Hero;
