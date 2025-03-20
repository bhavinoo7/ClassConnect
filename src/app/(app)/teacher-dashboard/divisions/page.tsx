"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAppSelector } from "@/hooks/hooks";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
const Page = () => {
  const router = useRouter();
  const [div, setDiv] = useState<
    { division_code: string; division_id: string }[]
  >([]);
  const { teacherid } = useAppSelector((state) => state.user);

  useEffect(() => {
    async function fetchData() {
      const response = await axios.post("/api/fetch-division", teacherid);

      setDiv(response.data.data);
    }
    fetchData();
  }, []);
  return (
    <div className="flex flex-row justify-center gap-3 items-center h-screen">
      {div.map((division, index) => (
        <div key={index}>
          <Button
            onClick={() => router.push(`divisions/${division.division_id}`)}
          >
            {division.division_code}
          </Button>
        </div>
      ))}
    </div>
  );
};

export default Page;
