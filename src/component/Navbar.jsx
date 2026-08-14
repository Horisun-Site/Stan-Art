import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X, ShoppingBag } from "lucide-react";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <header className="fixed left-0 top-0 z-50 w-full bg-[#f8f7f3]/95 backdrop-blur-md sticky">
      <div className="border-b border-black/10">
        <div className="relative mx-auto flex h-[90px] max-w-[1600px] items-center justify-between px-6 md:px-10 lg:px-14">

          {/* LEFT SIDE */}
          <div className="flex items-center gap-7 md:gap-10">

            {/* SHOP */}
            <NavLink
              to="/shop"
              className={({ isActive }) =>
                `relative text-[12px] font-medium uppercase tracking-[0.16em] transition-colors duration-300 ${
                  isActive
                    ? "text-black"
                    : "text-black/60 hover:text-black"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  Shop

                  <span
                    className={`absolute -bottom-2 left-0 h-px bg-black transition-all duration-300 ${
                      isActive ? "w-full" : "w-0"
                    }`}
                  />
                </>
              )}
            </NavLink>

            {/* CART */}
            <Link
              to="/cart"
              className="group flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.16em] text-black/60 transition-colors duration-300 hover:text-black"
            >
              <ShoppingBag
                size={16}
                strokeWidth={1.5}
                className="transition-transform duration-300 group-hover:-translate-y-0.5"
              />

              <span>Cart</span>

              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-black px-1 text-[9px] text-white">
                0
              </span>
            </Link>
          </div>

          {/* CENTER LOGO */}
          <Link
            to="/login"
            onClick={closeMenu}
            className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center"
          >
            <span className="text-[22px] font-semibold leading-none tracking-[0.22em] text-[#171717] md:text-[25px]">
              STAN
            </span>

            <span className="mt-1.5 text-[8px] font-medium leading-none tracking-[0.48em] text-black/50 md:text-[9px]">
              ART STUDIO
            </span>
          </Link>

          {/* RIGHT SIDE */}
          <div className="hidden items-center gap-7 md:flex">

            {/* HOME */}
            <NavLink
              to="/"
              className={({ isActive }) =>
                `relative text-[12px] font-medium uppercase tracking-[0.16em] transition-colors duration-300 ${
                  isActive
                    ? "text-black"
                    : "text-black/60 hover:text-black"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  Home

                  <span
                    className={`absolute -bottom-2 left-0 h-px bg-black transition-all duration-300 ${
                      isActive ? "w-full" : "w-0"
                    }`}
                  />
                </>
              )}
            </NavLink>

            {/* SOCIAL HANDLE */}
            <a
              href="#"
              className="text-[12px] font-medium uppercase tracking-[0.16em] text-black/60 transition-colors duration-300 hover:text-black"
            >
              @stanartstudio
            </a>

          </div>

          {/* MOBILE MENU BUTTON */}
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="ml-auto flex h-10 w-10 items-center justify-center text-black md:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <X size={23} strokeWidth={1.4} />
            ) : (
              <Menu size={23} strokeWidth={1.4} />
            )}
          </button>

        </div>
      </div>

      {/* MOBILE MENU */}
      <div
        className={`overflow-hidden bg-[#f8f7f3] transition-all duration-500 md:hidden ${
          menuOpen
            ? "max-h-[500px] border-b border-black/10 opacity-100"
            : "max-h-0 opacity-0"
        }`}
      >
        <nav className="flex flex-col px-6 py-6">

          <Link
            to="/shop"
            onClick={closeMenu}
            className="flex items-center justify-between border-b border-black/10 py-5 text-xl font-light text-black"
          >
            Shop
          </Link>

          <Link
            to="/cart"
            onClick={closeMenu}
            className="flex items-center justify-between border-b border-black/10 py-5 text-xl font-light text-black"
          >
            <span className="flex items-center gap-3">
              Cart

              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1.5 text-[10px] text-white">
                0
              </span>
            </span>

            <ShoppingBag size={19} strokeWidth={1.4} />
          </Link>

          <Link
            to="/"
            onClick={closeMenu}
            className="flex items-center justify-between border-b border-black/10 py-5 text-xl font-light text-black"
          >
            Home
          </Link>

          <a
            href="#"
            onClick={closeMenu}
            className="flex items-center justify-between py-5 text-xl font-light text-black"
          >
            @stanartstudio
          </a>

        </nav>
      </div>
    </header>
  );
};

export default Navbar;