import Link from "next/link";
import Image from "next/image";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`inline-flex items-center ${className}`}>
      <Image
        src="/logo.png"
        alt="Trekr"
        width={96}
        height={32}
        className="h-8 w-auto object-contain"
        priority
      />
    </Link>
  );
}
