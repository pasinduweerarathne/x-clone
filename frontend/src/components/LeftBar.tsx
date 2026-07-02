import Image from "next/image";
import Link from "next/link";
// import Image from "./Image";

const menuList = [
  {
    id: 1,
    name: "Homepage",
    link: "/",
    icon: "home.svg",
  },
  {
    id: 2,
    name: "Explore",
    link: "/",
    icon: "explore.svg",
  },
  {
    id: 3,
    name: "Notification",
    link: "/",
    icon: "notification.svg",
  },
  {
    id: 4,
    name: "Messages",
    link: "/",
    icon: "message.svg",
  },
  {
    id: 5,
    name: "Bookmarks",
    link: "/",
    icon: "bookmark.svg",
  },
  {
    id: 6,
    name: "Jobs",
    link: "/",
    icon: "job.svg",
  },
  {
    id: 7,
    name: "Communities",
    link: "/",
    icon: "community.svg",
  },
  {
    id: 8,
    name: "Premium",
    link: "/",
    icon: "logo.svg",
  },
  {
    id: 9,
    name: "Profile",
    link: "/",
    icon: "profile.svg",
  },
  {
    id: 10,
    name: "More",
    link: "/",
    icon: "more.svg",
  },
];

const LeftBar = () => {
  return (
    <div className="h-screen sticky top-0 flex flex-col justify-between pt-2 pb-8">
      {/* TOP: LOGO + SCROLLABLE MENU */}
      <div className="flex flex-col gap-4 text-lg items-center xxl:items-start flex-1 min-h-0">
        {/* LOGO - fixed, never scrolls */}
        <Link href="/" className="p-2 rounded-full hover:bg-[#181818] shrink-0">
          <Image src="icons/logo.svg" alt="logo" width={24} height={24} />
        </Link>

        {/* MENU LIST - scrollable */}
        <div className="flex flex-col gap-4 overflow-y-auto max-h-96 thin-scrollbar">
          {menuList.map((item) => (
            <Link
              href={item.link}
              className="p-2 rounded-full hover:bg-[#181818] flex items-center gap-4"
              key={item.id}
            >
              <Image
                src={`icons/${item.icon}`}
                alt={item.name}
                width={24}
                height={24}
              />
              <span className="hidden xxl:inline">{item.name}</span>
            </Link>
          ))}

          {/* BUTTON - fixed, never scrolls */}
          <Link
            href="/compose/post"
            className="bg-white text-black rounded-full w-12 h-12 flex items-center justify-center xxl:hidden shrink-0"
          >
            <Image src="icons/post.svg" alt="new post" width={24} height={24} />
          </Link>
          <Link
            href="/compose/post"
            className="hidden xxl:block bg-white text-black rounded-full font-bold py-2 px-20 shrink-0"
          >
            Post
          </Link>
        </div>
      </div>

      {/* USER - fixed at bottom, always visible */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 relative rounded-full overflow-hidden">
            <Image
              src="/general/avatar.png"
              alt="lama dev"
              width={100}
              height={100}
            />
          </div>
          <div className="hidden xxl:flex flex-col">
            <span className="font-bold">Lama Dev</span>
            <span className="text-sm text-textGray">@lamaWebDev</span>
          </div>
        </div>
        <div className="hidden xxl:block cursor-pointer font-bold">...</div>
      </div>
    </div>
  );
};

export default LeftBar;
