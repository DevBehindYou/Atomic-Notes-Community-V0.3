// A screenshot in a phone frame: ink body, thin bezel and the design system's solid offset shadow.
export function Phone({
  src,
  alt,
  shadow = "signal",
  className = "",
  eager = false,
}: {
  src: string;
  alt: string;
  shadow?: "signal" | "ink";
  className?: string;
  eager?: boolean;
}) {
  return (
    <div className={`phone phone-${shadow} ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} width={1080} height={2460} loading={eager ? "eager" : "lazy"} />
    </div>
  );
}
