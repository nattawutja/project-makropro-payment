"use client";

import Image from "next/image";
import { FaUser, FaLock, FaSignInAlt } from 'react-icons/fa';
import { useState,useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Home() {

  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [nameLogin, setNameLogin] = useState("");

    const sendDataLogin = async (e) => {
      e.preventDefault();
      setLoading(true);

      const formData = new FormData(e.currentTarget);
      const username = formData.get("username");
      const password = formData.get("password");
  
      // console.log(new FormData(e.currentTarget));
      // return false;
      const res = await fetch("api/auth/checkLogin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          username, password 
        }),
      });

      const result = await res.json();
      console.log(result,"<----------result");
      if (result.success) {
        localStorage.setItem("fullName", result.fullName);
        localStorage.setItem("ID", result.id);
        localStorage.setItem("token", result.tokenData);
        setTimeout(() => {
          router.push("/send400");
        }, 400);

      } else {
        alert("เข้าสู่ระบบไม่สำเร็จ โปรดตรวจสอบความถูกต้องของชื่อผู้ใช้งาน และ รหัสผ่าน ของท่าน");
        setLoading(false);
      }
     
    };

  return (
    <>
      <Head>
        <title>Log in</title>
      </Head>

      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-white">

        <div className="shadow-lg flex flex-col items-center justify-center gap-4 p-10  border rounded-md" style={{ backgroundColor: '#f3f6f9' }}>
          <Image
            src="/makroprowhite.png"
            alt="My Photo"
            width={110}
            height={20}
            className="border rounded-3xl"
          />
          <h2 className="font-bold gradient-text">MakroPro Payment System</h2>
          <label className="font-bold text-black ">
            ระบบจัดการข้อมูลรายการชำระเงิน
          </label>
          <form
            onSubmit={sendDataLogin}
            className="p-10 mt-2 bg-white border border-gray-200 rounded-md shadow-xl"
          >
            <div className="flex flex-col items-start w-72">
              <label className="flex items-center gap-2 text-black">
                <FaUser className="text-gray-400" /> 
                ชื่อผู้ใช้งาน
              </label>
              <input
                name="username"
                type="text"
                className="w-full px-4 py-2 mt-2 text-black bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ชื่อผู้ใช้งาน"

              />
            </div>
        
            <div className="flex flex-col items-start mt-3 w-72">
              <label className="flex items-center gap-2 text-black">
                <FaLock className="text-gray-400" /> 
                รหัสผ่าน
              </label>
              <input
                name="password"
                type="password"
                className="w-full px-4 py-2 mt-2 text-black bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="รหัสผ่าน"
              />
            </div>
          
            <div className="flex flex-col items-center mt-5 w-72">
              <button 
                type="submit" 
                disabled={loading}
                  className={`inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 whitespace-nowrap text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2
                    ${loading ? "opacity-70 cursor-not-allowed" : ""}
                  `}
                >
                
                {loading ? (
                  <svg
                    aria-hidden="true"
                    role="status"
                    className="inline w-4 h-4 text-white me-3 animate-spin"
                    viewBox="0 0 100 101"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                      fill="#E5E7EB"
                    />
                    <path
                      d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                      fill="currentColor"
                    />
                  </svg>
                ) : (
                <FaSignInAlt size={20} />  
                )
              } 
                เข้าสู่ระบบ
              </button>
                <div className="flex justify-center mt-2 text-black">
                  พัฒนาโดย ฝ่าย MIS
                </div>
            </div>
          </form>
            
        </div>
        <label className="text-red-500">
          หากไม่ทราบรหัสผ่าน ให้สอบถามหัวหน้างาน หรือฝ่าย MIS
        </label>

      </div>
    </>
  );
}
