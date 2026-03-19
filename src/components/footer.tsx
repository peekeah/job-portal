import Link from 'next/link';

const links = [
  {
    title: 'Features',
    href: '#',
  },
  {
    title: 'Solution',
    href: '#',
  },
  {
    title: 'Customers',
    href: '#',
  },
  {
    title: 'Pricing',
    href: '#',
  },
  {
    title: 'Help',
    href: '#',
  },
  {
    title: 'About',
    href: '#',
  },
];

export default function FooterSection() {
  return (
    <footer className="border-b bg-white pb-6 dark:bg-transparent">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-wrap justify-between gap-3">
          <span className="text-muted-foreground order-last block text-center text-sm md:order-first">
            © {new Date().getFullYear()} Nexthire, All rights reserved
          </span>
          <div className="order-first flex flex-wrap justify-center gap-4 text-sm md:order-last md:gap-6">
            {links.map((link, index) => (
              <Link
                key={index}
                href={link.href}
                className="text-muted-foreground hover:text-primary block duration-150"
              >
                <span>{link.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
