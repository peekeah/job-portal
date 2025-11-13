import { cn } from "@/lib/utils";
import * as React from "react";

type HeadingVariant = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

const headingVariants: Record<HeadingVariant, string> = {
  h1: "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-4",
  h2: "scroll-m-20 text-3xl font-semibold tracking-tight mb-3",
  h3: "scroll-m-20 text-2xl font-semibold tracking-tight mb-2",
  h4: "scroll-m-20 text-xl font-semibold tracking-tight mb-2",
  h5: "scroll-m-20 text-lg font-medium tracking-tight mb-1",
  h6: "scroll-m-20 text-base font-medium tracking-tight mb-1",
};

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: HeadingVariant;
  variant?: HeadingVariant;
}

export const Heading: React.FC<HeadingProps> = ({
  as = "h2",
  variant = "h2",
  className,
  children,
  ...props
}) => {
  const Tag = as;
  return (
    <Tag className={cn(headingVariants[variant], className)} {...props}>
      {children}
    </Tag>
  );
};

type TextVariant = "base" | "muted" | "secondary" | "small";

const textVariants: Record<TextVariant, string> = {
  base: "leading-relaxed text-base text-foreground",
  muted: "text-sm text-muted-foreground",
  secondary: "text-base text-gray-600 dark:text-gray-300",
  small: "text-sm text-foreground",
};

interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  as?: "p" | "span" | "div";
  variant?: TextVariant;
}

export const Text: React.FC<TextProps> = ({
  as = "p",
  variant = "base",
  className,
  children,
  ...props
}) => {
  const Tag = as;
  return (
    <Tag className={cn(textVariants[variant], className)} {...props}>
      {children}
    </Tag>
  );
};

