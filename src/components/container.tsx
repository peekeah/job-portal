import { cx } from 'class-variance-authority';
import React, { HTMLAttributes, ReactNode } from 'react';

const Container = ({
  children,
  className,
}: HTMLAttributes<HTMLDivElement>): ReactNode => {
  return <div className={cx('mx-auto max-w-5xl', className)}>{children}</div>;
};

export default Container;
