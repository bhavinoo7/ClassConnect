"use client";

import { useRouter } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import { useAppSelector } from "@/hooks/hooks";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function Page() {
  const { toast } = useToast();
  const [divisions, setdivision] = useState<{ id: string; name: string }[]>([]);
  const { data, isLoading } = useQuery({
    queryKey: ["division"],
    queryFn: async () => {
      const response = await axios.get(
        `/api/fetch-hod-division?hod_id=${hodid}`
      );

      setdivision(response.data.data);
      return response.data;
    },
  });

  const { hodid } = useAppSelector((state) => state.user);

  const router = useRouter();

  const handleDivisionClick = async (divisionId: string) => {
    const response = await axios.post("/api/hod-division-login", {
      hod_id: hodid,
      division_id: divisionId,
    });

    if (!response.data.success) {
      toast({
        title: "Access Failed",
        description: response.data.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Access Granted",
        description: response.data.message,
        variant: "default",
      });
      router.replace("/division-dashboard");
    }

    
  };

 if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Loader2 className="mr-2 h-11 w-11 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {divisions.map((division) => (
        <Card
          key={division.id}
          className="cursor-pointer transition-all hover:bg-muted"
          onClick={() => handleDivisionClick(division.id)}
        >
          <CardContent className="p-4">
            <h2 className="text-xl font-medium">{division.name}</h2>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
