import React from 'react';

interface AbstractHeadingProps {
    title: React.ReactNode;
    subtitle?: React.ReactNode;
    summary?: React.ReactNode;
    actions?: React.ReactNode;
    leading?: React.ReactNode;
}

export function AbstractHeading({ title, subtitle, summary, actions, leading }: AbstractHeadingProps) {
    return (
        <header className="p-8 pb-4 pt-6">
            <div className="w-full mx-auto flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                <div className="flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-12">
                    <div className="flex items-start gap-4">
                        {leading && (
                            <div className="pt-1">
                                {leading}
                            </div>
                        )}
                        <div>
                            <div className="text-2xl font-black tracking-tight mb-1 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent leading-tight">
                                {title}
                            </div>
                            {subtitle && (
                                <p className="text-muted-foreground text-sm font-medium">
                                    {subtitle}
                                </p>
                            )}
                        </div>
                    </div>

                    {summary && (
                        <div className="flex-1">
                            {summary}
                        </div>
                    )}
                </div>

                {actions && (
                    <div className="w-full md:w-48">
                        {actions}
                    </div>
                )}
            </div>
        </header>
    );
}
