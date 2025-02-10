"use client"
import React, { useEffect } from 'react'
import { getSession } from 'next-auth/react'
const Page = () => {
  useEffect(() => {
      async function fetchData() {
        const session = await getSession();
        if (session) {
          console.log(session.user);
          console.log(session.user.hodid);
        }
      }
      fetchData();
    }, []);
  return (
    <div className='text-black'>
      This is hod-dash/page.tsx
    </div>
  )
}

export default Page
