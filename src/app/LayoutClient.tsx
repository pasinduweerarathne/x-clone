"use client";

import { useState } from "react";
import LeftBar from "@/components/LeftBar";
import PostModal from "@/components/PostModal";
import RightBar from "@/components/RightBar";

export default function LayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  const handleOpenPostModal = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setIsPostModalOpen(true);
  };

  return (
    <div className="max-w-screen-md lg:max-w-screen-lg xl:max-w-screen-xl xxl:max-w-screen-xxl mx-auto flex justify-between">
      <div className="px-2 xsm:px-4 xxl:px-8 ">
        <LeftBar onOpenPostModal={handleOpenPostModal} />
      </div>
      <div className="flex-1 lg:min-w-[600px] border-x-[1px] border-borderGray ">
        {children}
      </div>
      <div className="hidden lg:flex ml-4 md:ml-8 flex-1 ">
        <RightBar />
      </div>

      {isPostModalOpen && <PostModal setIsPostModalOpen={setIsPostModalOpen} />}
    </div>
  );
}
