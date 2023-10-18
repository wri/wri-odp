export default function Container({
  children,
  className,
}: {
  children?: JSX.Element | JSX.Element[];
  className?: string;
}) {
  return (
    <div className={`px-8 xxl:px-0 max-w-8xl mx-auto mt-10 ${className}`}>
      {children}
    </div>
  );
}
