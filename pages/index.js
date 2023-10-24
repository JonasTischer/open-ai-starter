import Link from "next/link";
import Image from "next/image";
import HeroImage from "../public/hero.webp";
import { Logo } from "../components/Logo";
export default function Home() {
  return (
    <div className="w-screen h-screen overflow-hidden flex justify-center items-center relative">
      <Image src={HeroImage} alt="Hero" fill className="absolute" />
      <div className="relative z-10 text-white px-10 py-5 text-center max-w-screen-sm bg-slate-900/90 rounded-md backdrop-slur-sm">
        <Logo />
        <p>
          This is a blog site built with Next.js, Tailwind CSS, and Auth0. It should serve as an example
        </p>
        <Link href="post/new" className="btn">
          Begin
        </Link>
      </div>
    </div>
  );
}
