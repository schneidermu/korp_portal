export const Picture = ({
  url,
  width,
  height,
  alt = "",
}: {
  url?: string;
  width: string;
  height: string;
  alt?: string;
}) => {
  return (
    <img
      src={url}
      alt={alt}
      style={{ width, height }}
      className="object-center object-cover"
    />
  );
};
