'use client';
import Link from "next/link";
import React from "react";

const BreadCrumps = ({ breadData }) => {
  return (
    <>
      <div className="breadcrumbs text-sm items-center ">
        <ul>
          
          {breadData.map((item, index) => (
            <li key={index}>
              
                <Link href={item.href}>
                {item.name}
                </Link>
                
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default BreadCrumps;
