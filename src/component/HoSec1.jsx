import React from "react";
import { ArrowDownRight } from "lucide-react";

const HoSec1 = () => {
  return (
    <section className="relative min-h-screen overflow-hidden bg-[#f8f7f3] px-6 pt-[90px] md:px-10 lg:px-14">

      <div className="mx-auto flex min-h-[calc(100vh-90px)] max-w-[1600px] flex-col justify-between py-12 md:py-16 lg:py-20">

        {/* TOP LABEL */}
        <div className="flex items-center justify-between">
          <p className="text-[10px] uppercase tracking-[0.3em] text-black/50 md:text-[11px]">
            Contemporary Artist
          </p>

          <p className="hidden text-[10px] uppercase tracking-[0.3em] text-black/40 md:block">
            Lagos — Nigeria
          </p>
        </div>


        {/* MAIN CONTENT */}
        <div className="grid items-end gap-12 lg:grid-cols-[1.2fr_0.8fr]">

          {/* LARGE INTRODUCTION */}
          <div>
            <p className="mb-6 text-xs uppercase tracking-[0.25em] text-black/45">
              Welcome to the studio
            </p>

            <h1 className="max-w-5xl text-[clamp(3.5rem,9vw,9rem)] font-light leading-[0.85] tracking-[-0.055em] text-[#171717]">
              Creating
              <br />
              <span className="ml-[8%] italic">
                art
              </span>{" "}
              that
              <br />
              speaks.
            </h1>
          </div>


          {/* ARTIST INTRO */}
          <div className="max-w-md lg:mb-2 lg:justify-self-end">

            <p className="text-base font-light leading-7 text-black/65 md:text-lg md:leading-8">
              I am an artist driven by curiosity, emotion, culture,
              and the endless possibilities of creative expression.
              Every piece begins with an idea and develops into
              something uniquely its own.
            </p>

            <div className="mt-8 flex items-center gap-4">
              <span className="h-px w-10 bg-black/30" />

              <span className="text-[10px] uppercase tracking-[0.25em] text-black/50">
                The Artist
              </span>
            </div>

          </div>

        </div>


        {/* BOTTOM */}
        <div className="flex items-end justify-between border-t border-black/10 pt-6">

          <p className="max-w-xs text-[10px] uppercase leading-5 tracking-[0.2em] text-black/40">
            Art · Expression · Identity · Perspective
          </p>

          <div className="group flex items-center gap-3 text-[10px] uppercase tracking-[0.25em] text-black/60">
            Explore the work

            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-black/20 transition-all duration-500 group-hover:bg-black group-hover:text-white">
              <ArrowDownRight
                size={17}
                strokeWidth={1.2}
              />
            </span>
          </div>

        </div>

      </div>
    </section>
  );
};

export default HoSec1;