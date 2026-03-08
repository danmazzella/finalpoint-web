interface PageTitleProps {
    title: string;
    subtitle?: string | React.ReactNode;
    children?: React.ReactNode;
}

export default function PageTitle({ title, subtitle, children }: PageTitleProps) {
    return (
        <div className="mb-5 animate-fade-in-up">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">{title}</h1>
                    {subtitle && (
                        <div className="mt-1">
                            {typeof subtitle === 'string' ? (
                                <p className="text-sm text-gray-500">{subtitle}</p>
                            ) : (
                                subtitle
                            )}
                        </div>
                    )}
                </div>
                {children && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {children}
                    </div>
                )}
            </div>
        </div>
    );
}
