import { cn } from "@/lib/utils";
import {
  TooltipProvider,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/tooltip";
import {
  RiCodeSSlashLine,
  RiBookLine,
  RiBookmarkLine,
  RiBookmarkFill,
  RiLoopRightFill,
  RiCheckLine,
} from "@remixicon/react";
import { useBookmarks } from "@/contexts/bookmarks-context";

type ChatMessageProps = {
  isUser?: boolean;
  children: React.ReactNode;
  userProfileImage?: string;
  messageId?: string;
  messageContent?: string;
  messageTimestamp?: Date;
};

export function ChatMessage({ 
  isUser, 
  children, 
  userProfileImage, 
  messageId, 
  messageContent, 
  messageTimestamp 
}: ChatMessageProps) {
  return (
    <article
      className={cn(
        "flex items-start gap-4 text-[15px] leading-relaxed",
        isUser && "justify-end",
      )}
    >
      <img
        className={cn(
          "rounded-full",
          isUser ? "order-1" : "border border-black/[0.08] shadow-sm",
        )}
        src={
          isUser
            ? userProfileImage || "https://raw.githubusercontent.com/origin-space/origin-images/refs/heads/main/exp2/user-02_mlqqqt.png"
            : "https://raw.githubusercontent.com/origin-space/origin-images/refs/heads/main/exp2/user-01_i5l7tp.png"
        }
        alt={isUser ? "User profile" : "Bart logo"}
        width={40}
        height={40}
      />
      <div
        className={cn(isUser ? "bg-muted px-4 py-3 rounded-xl" : "space-y-4")}
      >
        <div className="flex flex-col gap-3">
          <p className="sr-only">{isUser ? "You" : "Bart"} said:</p>
          {children}
        </div>
        {!isUser && messageId && messageContent && messageTimestamp && (
          <>
            <MessageActions 
              messageId={messageId}
              messageContent={messageContent}
              messageTimestamp={messageTimestamp}
              isUser={isUser}
              userProfileImage={userProfileImage}
            />
          </>
        )}
      </div>
    </article>
  );
}

type ActionButtonProps = {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  isActive?: boolean;
};

function ActionButton({ icon, label, onClick, isActive }: ActionButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button 
          onClick={onClick}
          className={cn(
            "relative text-muted-foreground/80 hover:text-foreground transition-colors size-8 flex items-center justify-center before:absolute before:inset-y-1.5 before:left-0 before:w-px before:bg-border first:before:hidden first-of-type:rounded-s-lg last-of-type:rounded-e-lg focus-visible:z-10 outline-offset-2 focus-visible:outline-2 focus-visible:outline-ring/70",
            isActive && "text-primary hover:text-primary/80"
          )}
        >
          {icon}
          <span className="sr-only">{label}</span>
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="dark px-2 py-1 text-xs">
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  );
}

type MessageActionsProps = {
  messageId: string;
  messageContent: string;
  messageTimestamp: Date;
  isUser?: boolean;
  userProfileImage?: string;
};

function MessageActions({ 
  messageId, 
  messageContent, 
  messageTimestamp, 
  isUser, 
  userProfileImage 
}: MessageActionsProps) {
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarks();
  const bookmarked = isBookmarked(messageId);

  const handleBookmarkToggle = () => {
    if (bookmarked) {
      removeBookmark(messageId);
    } else {
      addBookmark({
        id: messageId,
        content: messageContent,
        timestamp: messageTimestamp,
        isUser: isUser || false,
        userProfileImage,
      });
    }
  };

  return (
    <div className="relative inline-flex bg-white rounded-md border border-black/[0.08] shadow-sm -space-x-px dark:bg-sidebar dark:border-white/[0.08]">
      <TooltipProvider delayDuration={0}>
        <ActionButton 
          icon={bookmarked ? <RiBookmarkFill size={16} /> : <RiBookmarkLine size={16} />} 
          label={bookmarked ? "Remove bookmark" : "Bookmark"}
          onClick={handleBookmarkToggle}
          isActive={bookmarked}
        />
        <ActionButton icon={<RiLoopRightFill size={16} />} label="Refresh" />
      </TooltipProvider>
    </div>
  );
}

type BookmarkIndicatorProps = {
  messageId: string;
};

