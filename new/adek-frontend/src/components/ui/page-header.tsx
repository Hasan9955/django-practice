interface PageHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  backgroundGradient?: string;
}

export default function PageHeader({
  title,
  subtitle,
  description,
  backgroundGradient = "from-blue-600 to-blue-800",
}: PageHeaderProps) {
  return (
    <div className={`bg-gradient-to-r ${backgroundGradient} text-white py-16 md:py-24`}>
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xl md:text-2xl text-blue-100 mb-4">{subtitle}</p>
        )}
        {description && (
          <p className="text-lg text-blue-50 max-w-2xl">{description}</p>
        )}
      </div>
    </div>
  );
}
