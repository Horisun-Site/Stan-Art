import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X, ShoppingBag, ArrowUpRight } from "lucide-react";
import { useCart } from "../context/CartContext";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { count } = useCart();

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <header className="fixed left-0 top-0 z-50 w-full bg-[#f8f7f3]/95 backdrop-blur-md">

      {/* =========================
          MAIN NAVBAR
      ========================== */}
      <div className="border-b border-black/10">

        <div className="relative mx-auto flex h-[78px] w-full max-w-[1600px] items-center px-5 sm:h-[84px] sm:px-7 md:h-[88px] md:px-10 lg:h-[92px] lg:px-14">

          {/* =========================
              DESKTOP LEFT
          ========================== */}
          <div className="hidden items-center gap-7 lg:flex xl:gap-10">

            {/* SHOP */}
            <NavLink
              to="/shop"
              className={({ isActive }) =>
                `group relative py-2 text-[11px] font-medium uppercase tracking-[0.18em] transition-colors duration-300 ${
                  isActive
                    ? "text-black"
                    : "text-black/55 hover:text-black"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  Shop

                  <span
                    className={`absolute bottom-0 left-0 h-px bg-black transition-all duration-300 ${
                      isActive ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                  />
                </>
              )}
            </NavLink>

            {/* CART */}
            <Link
              to="/cart"
              className="group flex items-center gap-2 py-2 text-[11px] font-medium uppercase tracking-[0.18em] text-black/55 transition-colors duration-300 hover:text-black"
            >
              <ShoppingBag
                size={15}
                strokeWidth={1.4}
                className="transition-transform duration-300 group-hover:-translate-y-0.5"
              />

              <span>Cart</span>

              <span className="flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-black px-1 text-[8px] text-white">
                {count}
              </span>
            </Link>

          </div>


          {/* =========================
              MOBILE / TABLET LEFT
          ========================== */}
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-10 w-10 items-center justify-center text-black lg:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <X
                size={22}
                strokeWidth={1.3}
              />
            ) : (
              <Menu
                size={22}
                strokeWidth={1.3}
              />
            )}
          </button>


          {/* =========================
              CENTER LOGO
          ========================== */}
          <Link
            to="/login"
            onClick={closeMenu}
            className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center"
          >

            <span className="whitespace-nowrap text-[19px] font-semibold leading-none tracking-[0.20em] text-[#171717] sm:text-[21px] md:text-[23px] lg:text-[25px]">
              STAN
            </span>

            <span className="mt-1.5 whitespace-nowrap text-[7px] font-medium leading-none tracking-[0.42em] text-black/45 sm:text-[8px] md:text-[8px] lg:text-[9px]">
              ART STUDIO
            </span>

          </Link>


          {/* =========================
              DESKTOP RIGHT
          ========================== */}
          <div className="ml-auto hidden items-center gap-7 lg:flex xl:gap-10">

            {/* HOME */}
            <NavLink
              to="/"
              className={({ isActive }) =>
                `group relative py-2 text-[11px] font-medium uppercase tracking-[0.18em] transition-colors duration-300 ${
                  isActive
                    ? "text-black"
                    : "text-black/55 hover:text-black"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  Home

                  <span
                    className={`absolute bottom-0 left-0 h-px bg-black transition-all duration-300 ${
                      isActive ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                  />
                </>
              )}
            </NavLink>


            {/* SOCIAL */}
            <a
              href="https://instagram.com/stanartstudio"
              target="_blank"
              rel="noreferrer"
              className="group flex items-center gap-1.5 py-2 text-[11px] font-medium uppercase tracking-[0.18em] text-black/55 transition-colors duration-300 hover:text-black"
            >
              @stanartstudio

              <ArrowUpRight
                size={12}
                strokeWidth={1.3}
                className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </a>

          </div>


          {/* =========================
              MOBILE CART
          ========================== */}
          <Link
            to="/cart"
            onClick={closeMenu}
            className="ml-auto flex h-10 items-center justify-center gap-1.5 text-black lg:hidden"
            aria-label="Shopping cart"
          >

            <ShoppingBag
              size={19}
              strokeWidth={1.4}
            />

            <span className="flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-black px-1 text-[8px] text-white">
              {count}
            </span>

          </Link>

        </div>

      </div>


      {/* =========================
          MOBILE / TABLET MENU
      ========================== */}
      <div
        className={`overflow-hidden bg-[#f8f7f3] transition-all duration-500 ease-in-out lg:hidden ${
          menuOpen
            ? "max-h-[520px] border-b border-black/10 opacity-100"
            : "max-h-0 opacity-0"
        }`}
      >

        <nav className="px-5 pb-7 pt-2 sm:px-7 md:px-10">

          {/* HOME */}
          <NavLink
            to="/"
            onClick={closeMenu}
            className={({ isActive }) =>
              `flex items-center justify-between border-b border-black/10 py-5 text-[19px] font-light tracking-[-0.02em] transition-colors ${
                isActive
                  ? "text-black"
                  : "text-black/60"
              }`
            }
          >
            <span>Home</span>

            <ArrowUpRight
              size={19}
              strokeWidth={1.3}
            />
          </NavLink>


          {/* SHOP */}
          <NavLink
            to="/shop"
            onClick={closeMenu}
            className={({ isActive }) =>
              `flex items-center justify-between border-b border-black/10 py-5 text-[19px] font-light tracking-[-0.02em] transition-colors ${
                isActive
                  ? "text-black"
                  : "text-black/60"
              }`
            }
          >
            <span>Shop</span>

            <ArrowUpRight
              size={19}
              strokeWidth={1.3}
            />
          </NavLink>


          {/* CART */}
          <Link
            to="/cart"
            onClick={closeMenu}
            className="flex items-center justify-between border-b border-black/10 py-5 text-[19px] font-light tracking-[-0.02em] text-black"
          >

            <span className="flex items-center gap-3">
              Cart

              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1.5 text-[9px] text-white">
                {count}
              </span>
            </span>

            <ShoppingBag
              size={19}
              strokeWidth={1.3}
            />

          </Link>


          {/* SOCIAL */}
          <a
            href="https://instagram.com/stanartstudio"
            target="_blank"
            rel="noreferrer"
            onClick={closeMenu}
            className="group flex items-center justify-between py-5 text-[19px] font-light tracking-[-0.02em] text-black"
          >

            <span>
              @stanartstudio
            </span>

            <ArrowUpRight
              size={19}
              strokeWidth={1.3}
              className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />

          </a>

        </nav>

      </div>

    </header>
  );
};

export default Navbar;