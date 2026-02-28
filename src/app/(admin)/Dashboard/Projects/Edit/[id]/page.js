"use client";

import DashboardPageHeader from "@/Components/DashboardPageHeader";

import EditProject from "@/Components/EditProject";

import { useParams } from "next/navigation";
import React from "react";

const Page = () => {
  const params = useParams();
  const projectId = params?.id;

  const breadData = [
    { name: "Dashboard", href: "/Dashboard" },
  
    {
      name: "Projects",
      href: `/Dashboard/Projects`,
    },
    {
      name: "Edit",
      href: `/Dashboard/Projects/Edit/${projectId}`,
    },
  ];

  return (
    <>
      <DashboardPageHeader breadData={breadData} heading={`Edit Project`} />

      <div className="w-full bg-base-100 rounded-xl shadow-lg overflow-hidden">
     <EditProject/>
      </div>
    </>
  );
};

export default Page;
