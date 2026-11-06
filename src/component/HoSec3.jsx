import { ArrowRight } from "lucide-react";

const Hosec3 = () => {
  const process = [
    {
      number: "01",
      title: "Observe",
      text: "Everything begins with paying attention. Inspiration can come from people, places, memories, culture, or the smallest details of everyday life.",
    },
    {
      number: "02",
      title: "Explore",
      text: "Ideas are developed through experimentation, sketches, materials, textures, and different ways of seeing the original thought.",
    },
    {
      number: "03",
      title: "Create",
      text: "The idea slowly becomes an artwork. Every decision, mark, texture, and detail contributes to the final expression.",
    },
    {
      number: "04",
      title: "Connect",
      text: "The finished work leaves the studio and begins a new conversation with everyone who experiences it.",
    },
  ];

  return (
    <section className="bg-[#171717] px-6 py-24 text-[#f8f7f3] md:px-10 md:py-32 lg:px-14 lg:py-40">
      <div className="mx-auto max-w-[1600px]">

        {/* HEADER */}
        <div className="grid gap-10 border-b border-white/15 pb-16 lg:grid-cols-[0.7fr_1.3fr] lg:pb-24">

          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">
              03 — Philosophy
            </p>
          </div>

          <div>
            <h2 className="max-w-5xl text-5xl font-light leading-[0.95] tracking-[-0.05em] md:text-7xl lg:text-[8rem]">
              The process
              <br />
              behind the
              <span className="italic text-white/50"> art.</span>
            </h2>
          </div>

        </div>


        {/* INTRODUCTION */}
        <div className="grid gap-10 py-16 md:py-20 lg:grid-cols-[0.7fr_1.3fr] lg:py-24">

          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-white/35">
              From idea to expression
            </p>
          </div>

          <p className="max-w-3xl text-xl font-light leading-8 text-white/65 md:text-2xl md:leading-10">
            Creating art is a journey. There is no single formula for
            turning an idea into something meaningful. Every piece
            develops through observation, experimentation, patience,
            and instinct.
          </p>

        </div>


        {/* PROCESS */}
        <div className="border-t border-white/15">

          {process.map((item) => (
            <div
              key={item.number}
              className="group grid gap-6 border-b border-white/15 py-10 transition-all duration-500 hover:px-3 md:py-12 lg:grid-cols-[120px_0.8fr_1.2fr] lg:items-center lg:gap-10"
            >

              {/* NUMBER */}
              <span className="text-[11px] tracking-[0.2em] text-white/35">
                {item.number}
              </span>


              {/* TITLE */}
              <h3 className="text-4xl font-light tracking-[-0.04em] transition-transform duration-500 group-hover:translate-x-2 md:text-5xl lg:text-6xl">
                {item.title}
              </h3>


              {/* DESCRIPTION */}
              <div className="flex items-start justify-between gap-8">

                <p className="max-w-xl text-sm leading-7 text-white/45 md:text-base md:leading-8">
                  {item.text}
                </p>

                <ArrowRight
                  size={20}
                  strokeWidth={1}
                  className="mt-1 shrink-0 text-white/30 transition-all duration-500 group-hover:translate-x-2 group-hover:text-white"
                />

              </div>

            </div>
          ))}

        </div>


        {/* CLOSING STATEMENT */}
        <div className="mt-20 flex flex-col gap-8 md:mt-28 lg:flex-row lg:items-end lg:justify-between">

          <p className="max-w-4xl text-3xl font-light leading-tight tracking-[-0.03em] text-white/80 md:text-5xl lg:text-6xl">
            Every piece carries a part of the journey
            that created it.
          </p>

          <span className="text-[10px] uppercase tracking-[0.25em] text-white/35 lg:mb-2">
            Stan Art Studio
          </span>

        </div>

      </div>
    </section>
  );
};

export default Hosec3;