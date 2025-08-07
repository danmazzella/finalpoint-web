interface PageTitleProps {
    title: string;
    subtitle?: string | React.ReactNode;
    children?: React.ReactNode;
}

export default function PageTitle({ title, subtitle, children }: PageTitleProps) {
    return (
        <div className="mb-3 sm:mb-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{title}</h1>
                    {subtitle && (
                        <div className="mt-1">
                            {typeof subtitle === 'string' ? (
                                <p className="text-gray-600">{subtitle}</p>
                            ) : (
                                subtitle
                            )}
                        </div>
                    )}
                </div>
                {children && (
                    <div className="flex items-center space-x-3">
                        {children}
                    </div>
                )}
            </div>
        </div>
    );
}
