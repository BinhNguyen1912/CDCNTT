import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

export default function PageNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen h-screen max-w-screen">
      <Image
        src="https://cdn.dribbble.com/userupload/8726278/file/original-ab1bde6f9c74de5c8961f7fe84990cd4.gif"
        alt="404"
        width={700}
        height={700}
        priority
        className="w-full h-full object-cover relative"
      />
      <h1 className="font-bold">
        <Link href="/" className="absolute top-[28%] left-[45%]">
          Page Not Found . Go Home
        </Link>
      </h1>
    </div>
  );
}
