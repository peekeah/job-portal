import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { TextEffect } from '@/components/motion-primitives/text-effect';
import { AnimatedGroup } from '@/components/motion-primitives/animated-group';
import { BackgroundBeams } from '../ui/background-beams';
import Container from '../container';

const transitionVariants = {
  item: {
    hidden: {
      opacity: 0,
      filter: 'blur(12px)',
      y: 12,
    },
    visible: {
      opacity: 1,
      filter: 'blur(0px)',
      y: 0,
      transition: {
        type: 'spring',
        bounce: 0.3,
        duration: 1.5,
      },
    },
  },
};

export default function HeroSection() {
  return (
    <>
      <div className="relative z-10 overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 isolate hidden opacity-65 contain-strict lg:block"
        ></div>
        <section className="relative">
          <Container>
            <BackgroundBeams speedFactor={1.5} className="h-screen w-full" />
          </Container>

          <div className="relative pt-24 md:pt-36">
            <div
              aria-hidden
              className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--color-background)_75%)]"
            />

            <div className="mx-auto max-w-7xl px-6">
              <div className="text-center sm:mx-auto lg:mt-0 lg:mr-auto">
                <AnimatedGroup variants={transitionVariants}>
                  <div className="hover:bg-background dark:hover:border-t-border bg-muted group mx-auto flex w-fit items-center gap-4 rounded-full border px-4 py-2 shadow-md shadow-zinc-950/5 transition-colors duration-300 dark:border-t-white/5 dark:shadow-zinc-950">
                    <span className="text-foreground text-sm">
                      AI powered Job searching platform
                    </span>
                  </div>
                </AnimatedGroup>

                <TextEffect
                  preset="fade-in-blur"
                  speedSegment={0.3}
                  as="h1"
                  className="mx-auto mt-8 max-w-4xl text-5xl font-bold max-md:font-bold md:text-7xl lg:mt-16"
                >
                  Land you next
                </TextEffect>
                <TextEffect
                  preset="fade-in-blur"
                  speedSegment={0.3}
                  delay={0.3}
                  as="h1"
                  className="text-primary mx-auto mt-2 max-w-4xl text-5xl font-bold max-md:font-bold md:text-7xl"
                >
                  Dream Job!
                </TextEffect>
                <TextEffect
                  per="line"
                  preset="fade-in-blur"
                  speedSegment={0.3}
                  delay={0.5}
                  as="p"
                  className="mx-auto mt-8 max-w-2xl text-lg"
                >
                  Designed to simplify your job search with intelligent filters
                  and curated matches. NextHire connects you to roles that truly
                  fit.
                </TextEffect>

                <AnimatedGroup
                  variants={{
                    container: {
                      visible: {
                        transition: {
                          staggerChildren: 0.05,
                          delayChildren: 0.75,
                        },
                      },
                    },
                    ...transitionVariants,
                  }}
                  className="mt-12 flex flex-col items-center justify-center gap-3 md:flex-row"
                >
                  <div key={1}>
                    <Button asChild size="lg" className="px-5 text-base">
                      <Link href="/login">
                        <span className="text-nowrap">Get Started</span>
                        <span>
                          <ArrowRight className="size-5" />
                        </span>
                      </Link>
                    </Button>
                  </div>
                </AnimatedGroup>
              </div>
            </div>

            <AnimatedGroup
              variants={{
                container: {
                  visible: {
                    transition: {
                      staggerChildren: 0.05,
                      delayChildren: 0.75,
                    },
                  },
                },
                ...transitionVariants,
              }}
            >
              <div className="relative mt-8 overflow-hidden px-6 sm:mt-12 md:mt-20">
                <div className="ring-primary/5 bg-primary/20 shadow-primary/5 relative mx-auto max-w-6xl overflow-hidden rounded-2xl border shadow-lg ring-1 inset-shadow-2xs dark:inset-shadow-white/20">
                  <div className="relative w-full">
                    <Image
                      className="border-border/25 h-auto w-full rounded-2xl border shadow-lg dark:hidden"
                      src="/dashboard.png"
                      alt="app screen"
                      width={1600}
                      height={900}
                      priority
                    />
                  </div>
                </div>
              </div>
            </AnimatedGroup>
          </div>
        </section>
      </div>
    </>
  );
}
