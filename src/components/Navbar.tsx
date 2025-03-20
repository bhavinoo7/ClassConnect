"use client";
import { signOut } from "next-auth/react";
import { Button } from "./ui/button";
import Link from "next/link";
import { useState } from "react";
import { GoMultiSelect } from "react-icons/go";
import { useEffect } from "react";

import { useRouter } from "next/navigation";


const Navbar = () => {
  const [dropdown, setDropdown] = useState(true);
  const [status, setStatus] = useState("");
  const router = useRouter();

  useEffect(() => {
    let sss = localStorage.getItem("status") ?? "";
    setStatus(sss);
  }, []);

  return (
    <>
      <header className="sticky top-0 bg-slate-600">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 h-16">
          <div className="flex justify-between items-center h-full px-5">
            <div>
              <h1 className="text-white text-2xl">Attendance.com</h1>
            </div>

            <ul className="hidden text-white sm:flex justify-between items-center space-x-5 px-5">
              <li>About Us</li>
              <li>Contact Us</li>
            </ul>
            <div className="flex justify-between items-center space-x-5">
              {status === "login" ? (
                <>
                  {" "}
                  <Button
                    className="bg-white text-black hover:text-white hover:bg-green-500"
                    onClick={() => {
                      localStorage.removeItem("status");
                      router.replace("/");
                      signOut();
                      
                    }}
                  >
                    Log Out
                  </Button>
                </>
              ) : (
                <>
                  <Button className="bg-white text-black hover:text-white hover:bg-green-500">
                    <Link href="/sign-in">Login</Link>
                  </Button>
                  <Button
                    className={`sm:hidden bg-white text-black hover:text-white hover:bg-green-500`}
                    onClick={() => setDropdown(!dropdown)}
                  >
                    <GoMultiSelect />
                  </Button>

                  <Button className="max-sm:hidden bg-white text-black hover:text-white hover:bg-green-500">
                    <Link href="/sign-up">Register</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
          <div
            className={`sm:hidden ${dropdown ? "hidden" : "visible"} bg-white`}
          >
            <ul className="flex flex-col items-center space-y-5 border-t-2 border-b-2 border-gray-200">
              <li className="py-3">
                <Link href="/sign-up">Register</Link>
              </li>
              <li className="py-3">About</li>
              <li className="py-3">Contact Us</li>
            </ul>
          </div>
        </div>
      </header>
    </>
  );
};

export default Navbar;
