import { channelLooks } from "@diepen/ui/mockups/channel-looks";
import { Icon } from "@diepen/ui/primitives/icon";
import type { Channel } from "@/domain/channel";

/** The small coloured square that names a channel next to a person, as in the tab strip. */
export function ChannelMark({ channel, size = 22 }: { channel: Channel; size?: number }) {
  const look = channelLooks[channel];
  return (
    <span
      aria-hidden="true"
      className="inline-flex shrink-0 items-center justify-center rounded-[6px] text-white"
      style={{ backgroundColor: look.accent, width: size, height: size }}
    >
      <Icon name={look.icon} size={Math.round(size * 0.58)} strokeWidth={2.25} />
    </span>
  );
}
