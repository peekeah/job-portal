'use client';
import { signOut } from 'next-auth/react';
import Link from 'next/link';

const SignOutButton = () => {
  return (
    <Link
      href={'/#'}
      onClick={() => signOut({ callbackUrl: '/' })}
      className="mt-auto cursor-pointer px-3 py-1.5 text-lg"
    >
      Logout
    </Link>
  );
};

export default SignOutButton;
