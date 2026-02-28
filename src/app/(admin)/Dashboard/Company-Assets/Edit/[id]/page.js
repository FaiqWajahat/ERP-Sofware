"use client";

import DashboardPageHeader from "@/Components/DashboardPageHeader";
import EditAsset from "@/Components/EditAsset";

import { useParams } from "next/navigation";
import React from "react";

const Page = () => {
  const params = useParams();
  const assetId = params?.id;

  const breadData = [
    { name: "Dashboard", href: "/Dashboard" },
  
    {
      name: "Assets",
      href: `/Dashboard/Company-Assets`,
    },
    {
      name: "Edit",
      href: `/Dashboard/Company-Assets/Edit/${assetId}`,
    },
  ];

  return (
    <>
      <DashboardPageHeader breadData={breadData} heading={`Edit Asset`} />

      <div className="w-full bg-base-100 rounded-xl shadow-lg overflow-hidden">
        <EditAsset />
      </div>
    </>
  );
};

export default Page;
