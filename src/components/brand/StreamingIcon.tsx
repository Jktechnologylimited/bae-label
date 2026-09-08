import clsx from "clsx";
import { StreamingPlatform } from "@/lib/types";

export const STREAMING_META: Record<StreamingPlatform, { label: string; color: string }> = {
  spotify: { label: "Spotify", color: "#1DB954" },
  appleMusic: { label: "Apple Music", color: "#FA243C" },
  youtubeMusic: { label: "YouTube Music", color: "#FF0000" },
  audiomack: { label: "Audiomack", color: "#FFA200" },
  boomplay: { label: "Boomplay", color: "#1AB4E2" },
  soundcloud: { label: "SoundCloud", color: "#FF5500" },
};

const paths: Record<StreamingPlatform, React.ReactNode> = {
  spotify: (
    <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm4.5 14.4a.6.6 0 0 1-.8.2c-2.3-1.4-5.2-1.7-8.6-.9a.6.6 0 1 1-.3-1.2c3.7-.9 6.9-.5 9.5 1.1.3.2.4.6.2.8zm1.2-2.7a.8.8 0 0 1-1 .3c-2.6-1.6-6.5-2-9.6-1.1a.8.8 0 0 1-.5-1.5c3.5-1.1 7.9-.6 10.9 1.3.3.2.4.7.2 1zm.1-2.8c-3.1-1.9-8.3-2-11.3-1.1a1 1 0 1 1-.6-1.9c3.5-1 9.2-.9 12.8 1.3a1 1 0 0 1-1 1.7z" />
  ),
  appleMusic: (
    <path d="M16.8 2.4c-.5.6-1.3 1-2 1-.1-.8.3-1.6.7-2.1.5-.6 1.4-1 2-1 .1.8-.2 1.5-.7 2.1zm.7 1.2c-1.1-.1-2.1.6-2.6.6-.6 0-1.4-.6-2.3-.6-1.2 0-2.3.7-2.9 1.7-1.2 2.1-.3 5.3.9 7 .6.9 1.3 1.8 2.2 1.8.9 0 1.2-.6 2.3-.6s1.4.6 2.3.6c1 0 1.6-.9 2.1-1.7.7-1 1-2 1-2 0 0-1.9-.7-1.9-2.8 0-1.8 1.5-2.6 1.5-2.6-.8-1.2-2.1-1.3-2.6-1.4zM9 15V6.8l7-1.4v7.9a2 2 0 1 1-1.2-1.8V7.7l-4.6.9v6.4A2 2 0 1 1 9 15z" />
  ),
  youtubeMusic: (
    <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 16.5a6.5 6.5 0 1 1 0-13 6.5 6.5 0 0 1 0 13zm0-11.2a4.7 4.7 0 1 0 0 9.4 4.7 4.7 0 0 0 0-9.4zm-1.7 7.1V9.6l4.5 2.4-4.5 2.4z" />
  ),
  audiomack: (
    <path d="M4 10.5h2.2L9 4l3 16 2.4-11.5H16l1.2 3.2H20V13h-3.9l-.9-2.3-2.6 12.6L9.3 6.9 7.4 12.5H4z" />
  ),
  boomplay: (
    <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM9.3 16.3V7.7L16.6 12z" />
  ),
  soundcloud: (
    <path d="M8.6 9.4c.2 0 .4.2.4.4v6.7c0 .2-.2.4-.4.4s-.4-.2-.4-.4V9.8c0-.2.2-.4.4-.4zm-2 1.4c.2 0 .4.2.4.4v5.3c0 .2-.2.4-.4.4s-.4-.2-.4-.4v-5.3c0-.2.2-.4.4-.4zm-2 1.6c.2 0 .4.2.4.4v3.7c0 .2-.2.4-.4.4s-.4-.2-.4-.4v-3.7c0-.2.2-.4.4-.4zm6-4.6c.2 0 .4.2.4.4v8.9c0 .2-.2.4-.4.4s-.4-.2-.4-.4V8.2c0-.2.2-.4.4-.4zm2-.5c1.9 0 3.5 1.3 3.9 3.1a2.9 2.9 0 0 1 1-.2c1.7 0 3.1 1.4 3.1 3.1s-1.4 3.1-3.1 3.1h-4.5a.4.4 0 0 1-.4-.4V7.7c0-.2.1-.3.3-.4.5-.2 1.1-.4 1.7-.4z" />
  ),
};

export default function StreamingIcon({
  platform,
  className,
}: {
  platform: StreamingPlatform;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 24 24" className={clsx("size-4", className)} fill="currentColor" aria-hidden>
      {paths[platform]}
    </svg>
  );
}
