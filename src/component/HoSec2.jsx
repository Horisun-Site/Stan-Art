import React from "react";
import { ArrowUpRight } from "lucide-react";

const Hosec2 = () => {
  return (
    <section className="bg-[#f8f7f3] px-6 py-24 md:px-10 md:py-32 lg:px-14 lg:py-40">
      <div className="mx-auto max-w-[1600px]">

        {/* SECTION HEADER */}
        <div className="mb-16 flex items-end justify-between border-b border-black/10 pb-5 md:mb-24">
          <div>
            <p className="mb-3 text-[10px] uppercase tracking-[0.3em] text-black/45">
              02 — About
            </p>

            <h2 className="text-3xl font-light tracking-[-0.03em] text-[#171717] md:text-5xl lg:text-6xl">
              The Artist
            </h2>
          </div>

          <span className="hidden text-[10px] uppercase tracking-[0.25em] text-black/40 md:block">
            A story in progress
          </span>
        </div>


        {/* MAIN CONTENT */}
        <div className="grid gap-14 lg:grid-cols-2 lg:gap-24">

          {/* IMAGE PLACEHOLDER */}
          <div className="relative aspect-[4/5] overflow-hidden bg-[#dedbd3]">

            {/* Replace this with the artist's image later */}
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-[10px] uppercase tracking-[0.3em] text-black/30">
                Artist Portrait
              </p>
            </div>

            {/* Image number */}
            <div className="absolute bottom-5 left-5">
              <span className="text-[10px] uppercase tracking-[0.2em] text-black/40">
                STAN / 001
              </span>
            </div>

          </div>


          {/* TEXT CONTENT */}
          <div className="flex flex-col justify-center lg:py-10">

            <p className="mb-8 max-w-lg text-sm uppercase tracking-[0.25em] text-black/40">
              About the studio
            </p>

            <h3 className="max-w-2xl text-4xl font-light leading-[1.05] tracking-[-0.04em] text-[#171717] md:text-5xl lg:text-6xl">
              Every artwork begins with a thought,
              <span className="italic"> a feeling,</span>
              and a desire to create.
            </h3>

            <div className="mt-10 max-w-lg space-y-6 text-sm leading-7 text-black/60 md:text-base md:leading-8">
              <p>
                The artist's work explores ideas, experiences, memories,
                culture, and the world around us. Each piece is created
                with intention, allowing ordinary moments to become
                something worth remembering.
              </p>

              <p>
                Through different materials, techniques, and perspectives,
                the studio continues to explore what art can communicate
                without needing to say everything directly.
              </p>
            </div>


            {/* READ MORE */}
            <div className="mt-12">
              <a
                href="/about"
                className="group inline-flex items-center gap-4 border-b border-black/30 pb-2 text-[11px] uppercase tracking-[0.2em] text-black transition-colors duration-300 hover:border-black"
              >
                Discover the artist

                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-black/20 transition-all duration-300 group-hover:bg-black group-hover:text-white">
                  <ArrowUpRight
                    size={15}
                    strokeWidth={1.3}
                  />
                </span>
              </a>
            </div>

          </div>

        </div>


        {/* BOTTOM STATEMENT */}
        <div className="mt-24 border-t border-black/10 pt-8 md:mt-32">
          <p className="max-w-5xl text-2xl font-light leading-tight tracking-[-0.02em] text-black/70 md:text-4xl lg:text-5xl">
            "Art is not simply something to look at.
            It is an invitation to see the world
            differently."
          </p>
        </div>

      </div>
    </section>
  );
};

export default Hosec2;