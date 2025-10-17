import { cx } from 'class-variance-authority'
import React, { HTMLAttributes, ReactNode } from 'react'

const Container = ({ children, className }: HTMLAttributes<HTMLDivElement>): ReactNode => {
    return (
        <div className={cx('max-w-5xl mx-auto', className)}>{children}</div>
    )
}

export default Container