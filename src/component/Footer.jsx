import { Link } from "react-router-dom";
import { ArrowUpRight, AtSign, Mail } from "lucide-react";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#171717] px-6 pb-8 pt-16 text-[#f8f7f3] md:px-10 md:pt-20 lg:px-14">
      <div className="mx-auto max-w-[1600px]">
        <div className="grid gap-12 border-b border-white/15 pb-14 md:grid-cols-[1.4fr_0.6fr_0.7fr]">
          <div>
            <div className="flex flex-col leading-none">
              <span className="text-2xl font-semibold tracking-[0.22em]">
                STAN
              </span>
              <span className="mt-2 text-[8px] tracking-[0.5em] text-white/45">
                ART STUDIO
              </span>
            </div>

            <p className="mt-7 max-w-sm text-sm leading-7 text-white/45">
              Contemporary art from the studio. Original works, stories and
              ideas made to be lived with.
            </p>
          </div>

          <div>
            <p className="mb-5 text-[10px] uppercase tracking-[0.28em] text-white/35">
              Explore
            </p>

            <ul className="space-y-3 text-sm text-white/65">
              <li>
                <Link to="/" className="transition hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/shop" className="transition hover:text-white">
                  Shop
                </Link>
              </li>
              <li>
                <Link to="/cart" className="transition hover:text-white">
                  Cart
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="mb-5 text-[10px] uppercase tracking-[0.28em] text-white/35">
              Connect
            </p>

            <ul className="space-y-3 text-sm text-white/65">
              <li>
                <a
                  href="https://instagram.com/stanartstudio"
                  target="_blank"
                  rel="noreferrer"
                  className="group inline-flex items-center gap-2 transition hover:text-white"
                >
                  <AtSign size={14} strokeWidth={1.4} />
                  @stanartstudio
                  <ArrowUpRight
                    size={11}
                    strokeWidth={1.3}
                    className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </a>
              </li>
              <li>
                <a
                  href="mailto:hello@stanartstudio.com"
                  className="inline-flex items-center gap-2 transition hover:text-white"
                >
                  <Mail size={14} strokeWidth={1.4} />
                  Enquiries
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-4 pt-6 text-[10px] uppercase tracking-[0.18em] text-white/30 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Stan Art Studio. All rights reserved.</p>

          <Link
            to="/login"
            className="w-fit transition hover:text-white/60"
          >
            Studio login
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
