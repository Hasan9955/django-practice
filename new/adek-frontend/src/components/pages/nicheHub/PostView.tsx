import Image from "next/image";

interface MediaGridProps {
  fileUrl?: string[];
}

export function MediaGrid({ fileUrl }: MediaGridProps) {
  if (!fileUrl || fileUrl.length === 0) return null;

  const videos = fileUrl.filter(
    (url) =>
      url.endsWith(".mp4") || url.endsWith(".mkv") || url.endsWith(".mov")
  );
  const images = fileUrl.filter(
    (url) =>
      url.endsWith(".jpg") ||
      url.endsWith(".jpeg") ||
      url.endsWith(".png") ||
      url.endsWith(".webp") ||
      url.endsWith(".gif")
  );

  const media = [...videos, ...images];

  const gridClass =
    media.length === 1
      ? "grid-cols-1"
      : media.length === 2
      ? "grid-cols-2 gap-2"
      : media.length === 3
      ? "grid-cols-2 gap-2"
      : "grid-cols-2 sm:grid-cols-3 gap-2";

  return (
    <div className={`grid ${gridClass} mt-3 rounded-lg overflow-hidden`}>
      {media.map((url, index) => {
        const isVideo =
          url.endsWith(".mp4") || url.endsWith(".mkv") || url.endsWith(".mov");

        const showOverlay = media.length > 4 && index === 3;
        if (showOverlay) {
          return (
            <div key={index} className="relative rounded-lg overflow-hidden">
              {isVideo ? (
                <video
                  src={url}
                  className="w-full h-[440px] object-cover aspect-[3/2]"
                  muted
                  playsInline
                />
              ) : (
                <Image
                  key={index}
                  src={url}
                  width={600}
                  height={440}
                  alt="Post image"
                  className="aspect-[3/2] w-full h-[440px] object-cover"
                />
              )}
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-2xl font-semibold">
                +{media.length - 3}
              </div>
            </div>
          );
        }

        return (
          <div key={index} className="relative rounded-lg overflow-hidden">
            {isVideo ? (
              <video
                controls
                className="w-full h-[440px] object-cover aspect-[3/2]"
                src={url}
                playsInline
              />
            ) : (
              <Image
                key={index}
                src={url}
                width={600}
                height={440}
                alt="Post image"
                className="aspect-[3/2] w-full h-[440px] object-cover"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
