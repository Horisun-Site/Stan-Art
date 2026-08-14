// import React from "react";
// import { ArrowUpRight } from "lucide-react";

// const artworks = [
//   {
//     id: 1,
//     title: "Untitled I",
//     year: "2026",
//   },
//   {
//     id: 2,
//     title: "Reflection",
//     year: "2026",
//   },
//   {
//     id: 3,
//     title: "Fragments",
//     year: "2026",
//   },
// ];

// const HoSec4 = () => {
//   return (
//     <section className="bg-[#f8f7f3] px-6 py-24 md:px-10 md:py-32 lg:px-14 lg:py-40">
//       <div className="mx-auto max-w-[1600px]">

//         {/* HEADER */}
//         <div className="mb-16 flex flex-col gap-8 border-b border-black/10 pb-8 md:flex-row md:items-end md:justify-between">

//           <div>
//             <p className="mb-3 text-[10px] uppercase tracking-[0.3em] text-black/40">
//               04 — Selected Works
//             </p>

//             <h2 className="text-4xl font-light tracking-[-0.04em] text-[#171717] md:text-6xl lg:text-7xl">
//               A glimpse into
//               <br />
//               the collection.
//             </h2>
//           </div>

//           <p className="max-w-md text-sm leading-7 text-black/55 md:text-base">
//             A selection of artworks from the studio.
//             Explore pieces that reflect ideas, stories,
//             emotions, and creative exploration.
//           </p>

//         </div>

//         {/* ARTWORK GRID */}
//         <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">

//           {artworks.map((art) => (
//             <div
//               key={art.id}
//               className="group cursor-pointer"
//             >

//               {/* IMAGE PLACEHOLDER */}
//               <div className="aspect-[4/5] overflow-hidden bg-[#ddd8ce]">

//                 <div className="flex h-full items-center justify-center">
//                   <span className="text-[10px] uppercase tracking-[0.25em] text-black/30">
//                     Artwork Image
//                   </span>
//                 </div>

//               </div>

//               {/* INFO */}
//               <div className="mt-5 flex items-start justify-between">

//                 <div>
//                   <h3 className="text-xl font-light text-[#171717]">
//                     {art.title}
//                   </h3>

//                   <p className="mt-2 text-[11px] uppercase tracking-[0.2em] text-black/40">
//                     {art.year}
//                   </p>
//                 </div>

//                 <ArrowUpRight
//                   size={18}
//                   strokeWidth={1.3}
//                   className="mt-1 text-black/40 transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
//                 />

//               </div>

//             </div>
//           ))}

//         </div>

//         {/* BOTTOM CTA */}
//         <div className="mt-24 border-t border-black/10 pt-10">

//           <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">

//             <div>
//               <p className="text-[10px] uppercase tracking-[0.25em] text-black/40">
//                 Explore More
//               </p>

//               <h3 className="mt-4 max-w-3xl text-3xl font-light leading-tight tracking-[-0.03em] text-[#171717] md:text-5xl">
//                 Discover the complete collection
//                 and explore the world of the artist.
//               </h3>
//             </div>

//             <a
//               href="/shop"
//               className="group flex items-center gap-4 border-b border-black pb-2 text-[12px] uppercase tracking-[0.2em]"
//             >
//               View All Works

//               <span className="flex h-10 w-10 items-center justify-center rounded-full border border-black/20 transition-all duration-300 group-hover:bg-black group-hover:text-white">
//                 <ArrowUpRight
//                   size={16}
//                   strokeWidth={1.3}
//                 />
//               </span>
//             </a>

//           </div>

//         </div>

//       </div>
//     </section>
//   );
// };

// export default HoSec4;


import React from "react";
import { ArrowRight } from "lucide-react";

const HoSec4 = () => {
  const artworks = [
    {
      title: "Echoes of Light",
      year: "2026",
    },
    {
      title: "Silent Motion",
      year: "2026",
    },
    {
      title: "Fragments",
      year: "2025",
    },
  ];

  return (
    <section className="bg-[#f8f7f3] px-6 py-24 md:px-10 md:py-32 lg:px-14 lg:py-40">
      <div className="mx-auto max-w-[1600px]">

        {/* HEADER */}
        <div className="mb-16 flex flex-col gap-8 border-b border-black/10 pb-10 lg:flex-row lg:items-end lg:justify-between">

          <div>
            <p className="mb-4 text-[10px] uppercase tracking-[0.3em] text-black/45">
              04 — Selected Works
            </p>

            <h2 className="max-w-4xl text-5xl font-light leading-[0.95] tracking-[-0.05em] text-[#171717] md:text-7xl lg:text-[7rem]">
              A selection
              <br />
              of recent works.
            </h2>
          </div>

          <p className="max-w-md text-sm leading-7 text-black/55 md:text-base md:leading-8">
            A small collection of artworks from the studio.
            Each piece carries its own story, emotion, and
            perspective.
          </p>

        </div>


        {/* ARTWORK GRID */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">

          {artworks.map((art, index) => (
            <div
              key={index}
              className="group cursor-pointer"
            >

              {/* IMAGE PLACEHOLDER */}
              <div className="aspect-[4/5] overflow-hidden bg-[#d9d5cc]">

                <div className="flex h-full items-center justify-center">
                  <span className="text-[10px] uppercase tracking-[0.3em] text-black/30">
                    Artwork
                  </span>
                </div>

              </div>

              {/* DETAILS */}
              <div className="mt-5 flex items-start justify-between">

                <div>
                  <h3 className="text-2xl font-light text-[#171717]">
                    {art.title}
                  </h3>

                  <p className="mt-2 text-[11px] uppercase tracking-[0.25em] text-black/40">
                    {art.year}
                  </p>
                </div>

                <ArrowRight
                  size={20}
                  strokeWidth={1.3}
                  className="mt-2 text-black/40 transition-transform duration-500 group-hover:translate-x-2"
                />
              </div>

            </div>
          ))}

        </div>


        {/* CTA */}
        <div className="mt-20 border-t border-black/10 pt-10">

          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">

            <div>
              <p className="mb-4 text-[10px] uppercase tracking-[0.25em] text-black/40">
                Continue Exploring
              </p>

              <h3 className="max-w-3xl text-3xl font-light leading-tight tracking-[-0.03em] text-[#171717] md:text-5xl">
                Discover the complete collection
                and explore the studio's work.
              </h3>
            </div>

            <a
              href="/shop"
              className="group flex items-center gap-4 border-b border-black pb-2 text-[11px] uppercase tracking-[0.2em] text-black"
            >
              Visit the Shop

              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-black/20 transition-all duration-500 group-hover:bg-black group-hover:text-white">
                <ArrowRight
                  size={17}
                  strokeWidth={1.2}
                />
              </span>
            </a>

          </div>

        </div>

      </div>
    </section>
  );
};

export default HoSec4;