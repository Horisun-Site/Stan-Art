// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { ArrowRight, LockKeyhole } from "lucide-react";
// import { loginAdmin } from "../firebase/auth";

// const Login = () => {
//   const navigate = useNavigate();

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     setError("");
//     setLoading(true);

//     try {
//       await loginAdmin(email, password);

//       navigate("/main");
//     } catch (error) {
//       console.error(error);

//       setError("Invalid email or password.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <main className="min-h-screen bg-[#f8f7f3] px-6">

//       <div className="mx-auto flex min-h-screen max-w-md items-center justify-center">

//         <div className="w-full">

//           {/* LOGO */}
//           <div className="mb-16 text-center">

//             <div className="inline-flex flex-col items-center">
//               <span className="text-3xl font-semibold tracking-[0.22em] text-[#171717]">
//                 STAN
//               </span>

//               <span className="mt-2 text-[9px] tracking-[0.5em] text-black/45">
//                 ART STUDIO
//               </span>
//             </div>

//           </div>


//           {/* LOGIN HEADER */}
//           <div className="mb-10">

//             <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-full border border-black/10">
//               <LockKeyhole
//                 size={17}
//                 strokeWidth={1.3}
//               />
//             </div>

//             <p className="mb-3 text-[10px] uppercase tracking-[0.3em] text-black/40">
//               Studio Administration
//             </p>

//             <h1 className="text-4xl font-light tracking-[-0.04em] text-[#171717]">
//               Welcome back.
//             </h1>

//             <p className="mt-4 text-sm leading-6 text-black/50">
//               Sign in to manage artworks and studio content.
//             </p>

//           </div>


//           {/* ERROR */}
//           {error && (
//             <div className="mb-6 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
//               {error}
//             </div>
//           )}


//           {/* FORM */}
//           <form
//             onSubmit={handleSubmit}
//             className="space-y-7"
//           >

//             {/* EMAIL */}
//             <div>

//               <label
//                 htmlFor="email"
//                 className="mb-2 block text-[10px] uppercase tracking-[0.25em] text-black/50"
//               >
//                 Email
//               </label>

//               <input
//                 id="email"
//                 type="email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 placeholder="admin@stanartstudio.com"
//                 required
//                 autoComplete="email"
//                 className="w-full border-b border-black/20 bg-transparent px-0 py-3 text-sm outline-none transition-colors placeholder:text-black/25 focus:border-black"
//               />

//             </div>


//             {/* PASSWORD */}
//             <div>

//               <label
//                 htmlFor="password"
//                 className="mb-2 block text-[10px] uppercase tracking-[0.25em] text-black/50"
//               >
//                 Password
//               </label>

//               <input
//                 id="password"
//                 type="password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 placeholder="Enter your password"
//                 required
//                 autoComplete="current-password"
//                 className="w-full border-b border-black/20 bg-transparent px-0 py-3 text-sm outline-none transition-colors placeholder:text-black/25 focus:border-black"
//               />

//             </div>


//             {/* SUBMIT */}
//             <button
//               type="submit"
//               disabled={loading}
//               className="group flex w-full items-center justify-between bg-[#171717] px-5 py-4 text-xs uppercase tracking-[0.2em] text-white transition-all duration-300 hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
//             >

//               <span>
//                 {loading ? "Signing in..." : "Sign in"}
//               </span>

//               {!loading && (
//                 <ArrowRight
//                   size={17}
//                   strokeWidth={1.3}
//                   className="transition-transform duration-300 group-hover:translate-x-1"
//                 />
//               )}

//             </button>

//           </form>


//           {/* FOOTER */}
//           <p className="mt-10 text-center text-[10px] uppercase tracking-[0.2em] text-black/30">
//             Authorized studio access only
//           </p>

//         </div>

//       </div>

//     </main>
//   );
// };

// export default Login;






import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { loginAdmin } from "../firebase/auth";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await loginAdmin(email, password);

      navigate("/main");
    } catch (error) {
      console.error("Login error:", error);

      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f8f7f3] px-6">

      <div className="mx-auto flex min-h-screen max-w-md items-center justify-center">

        <div className="w-full">

          {/* LOGO */}
          <div className="mb-16 text-center">
            <div className="inline-flex flex-col items-center">

              <span className="text-3xl font-semibold tracking-[0.22em] text-[#171717]">
                STAN
              </span>

              <span className="mt-2 text-[9px] tracking-[0.5em] text-black/45">
                ART STUDIO
              </span>

            </div>
          </div>


          {/* HEADING */}
          <div className="mb-10">

            <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-full border border-black/10">
              <LockKeyhole
                size={17}
                strokeWidth={1.3}
              />
            </div>

            <p className="mb-3 text-[10px] uppercase tracking-[0.3em] text-black/40">
              Studio Administration
            </p>

            <h1 className="text-4xl font-light tracking-[-0.04em] text-[#171717]">
              Welcome back.
            </h1>

            <p className="mt-4 text-sm leading-6 text-black/50">
              Sign in to manage artworks and studio content.
            </p>

          </div>


          {/* ERROR */}
          {error && (
            <div className="mb-6 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}


          {/* FORM */}
          <form
            onSubmit={handleSubmit}
            className="space-y-7"
          >

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-[10px] uppercase tracking-[0.25em] text-black/50"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@stanartstudio.com"
                required
                autoComplete="email"
                className="w-full border-b border-black/20 bg-transparent px-0 py-3 text-sm outline-none placeholder:text-black/25 focus:border-black"
              />
            </div>


            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-[10px] uppercase tracking-[0.25em] text-black/50"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                className="w-full border-b border-black/20 bg-transparent px-0 py-3 text-sm outline-none placeholder:text-black/25 focus:border-black"
              />
            </div>


            <button
              type="submit"
              disabled={loading}
              className="group flex w-full items-center justify-between bg-[#171717] px-5 py-4 text-xs uppercase tracking-[0.2em] text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span>
                {loading ? "Signing in..." : "Sign in"}
              </span>

              {!loading && (
                <ArrowRight
                  size={17}
                  strokeWidth={1.3}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              )}
            </button>

          </form>


          <p className="mt-10 text-center text-[10px] uppercase tracking-[0.2em] text-black/30">
            Authorized studio access only
          </p>

        </div>

      </div>

    </main>
  );
};

export default Login;




