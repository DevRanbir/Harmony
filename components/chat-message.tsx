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
  RiFileCopyLine,
  RiReplyLine,
  RiSaveLine,
  RiCloseLine,
  RiEditLine,
} from "@remixicon/react";
import { useBookmarks } from "@/contexts/bookmarks-context";
import { useChat } from "@/contexts/chat-context";
import { useState } from "react";
import React from "react";
import { FormattedMessage } from "@/components/formatted-message";
import { Button } from "@/components/button";
import { useIsMobile } from "@/hooks/use-mobile";

type ChatMessageProps = {
  isUser?: boolean;
  children: React.ReactNode;
  userProfileImage?: string;
  messageId?: string;
  messageContent?: string;
  messageTimestamp?: Date;
  onUserMessageClick?: (messageId: string, content: string) => void;
  isSelected?: boolean;
  isHighlighted?: boolean;
  // New props for inline editing
  isEditing?: boolean;
  onEdit?: (messageId: string, newContent: string) => void;
  onCancelEdit?: () => void;
};

export function ChatMessage({ 
  isUser, 
  children, 
  userProfileImage, 
  messageId, 
  messageContent, 
  messageTimestamp,
  onUserMessageClick,
  isSelected,
  isHighlighted,
  isEditing,
  onEdit,
  onCancelEdit
}: ChatMessageProps) {
  const isMobile = useIsMobile();
  const [editingContent, setEditingContent] = useState(messageContent || "");

  // Function to detect if message contains a table
  const hasTable = (content: string): boolean => {
    if (!content) return false;
    
    // Check for markdown table syntax
    const lines = content.split('\n');
    let potentialTableRows = 0;
    let hasSeparator = false;
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Check for table separator line (|---|---|)
      if (trimmed.match(/^\|[\s\-:]+\|/)) {
        hasSeparator = true;
        continue;
      }
      
      // Check if line looks like a table row (has multiple | characters)
      if (trimmed.includes('|')) {
        const pipeCount = (trimmed.match(/\|/g) || []).length;
        if (pipeCount >= 2) { // At least 2 pipes suggest a table row
          potentialTableRows++;
        }
      }
    }
    
    // Consider it a table if we have separator + rows, or multiple pipe-heavy lines
    return hasSeparator || potentialTableRows >= 2;
  };

  const messageHasTable = isUser ? hasTable(messageContent || "") : false;

  // Update editing content when messageContent changes or when entering edit mode
  React.useEffect(() => {
    if (isEditing && messageContent) {
      setEditingContent(messageContent);
    }
  }, [isEditing, messageContent]);

  const handleUserMessageClick = () => {
    if (isUser && messageId && messageContent && onUserMessageClick && !isEditing) {
      onUserMessageClick(messageId, messageContent);
    }
  };

  const handleSaveEdit = () => {
    if (onEdit && messageId && editingContent.trim()) {
      onEdit(messageId, editingContent.trim());
    }
  };

  const handleCancelEdit = () => {
    setEditingContent(messageContent || "");
    if (onCancelEdit) {
      onCancelEdit();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelEdit();
    }
  };

  return (
    <article
      className={cn(
        "flex items-start text-[15px] leading-relaxed w-full max-w-full",
        isMobile ? (isUser ? "gap-2" : "gap-1 pr-10") : "gap-4",
        isUser && "justify-end",
        isHighlighted && "bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-lg"
      )}
    >
      <img
        className={cn(
          "rounded-full flex-shrink-0",
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
        className={cn(
          isUser 
            ? messageHasTable 
              ? isMobile 
                ? "flex-1 min-w-0 bg-muted px-2 py-2 rounded-xl transition-all duration-200"
                : "flex-1 min-w-0 bg-muted px-4 py-3 rounded-xl transition-all duration-200"
              : isMobile
                ? "flex-shrink-0 max-w-[85%] bg-muted px-2 py-2 rounded-xl transition-all duration-200"
                : "flex-shrink-0 max-w-[70%] bg-muted px-4 py-3 rounded-xl transition-all duration-200"
            : isMobile
              ? "flex-1 min-w-0 space-y-2"
              : "flex-1 min-w-0 space-y-4",
          "overflow-visible",
          !isEditing && isUser && "cursor-pointer hover:bg-muted/80",
          isSelected && "ring-2",
          isEditing && "ring-2 ring-sidebar/10 cursor-default"
        )}
        onClick={!isEditing ? handleUserMessageClick : undefined}
      >
        <div className={cn(
          isMobile ? "flex flex-col gap-2 overflow-visible" : "flex flex-col gap-3 overflow-visible",
          isEditing ? "w-full min-w-0 max-w-full" 
            : isUser 
              ? messageHasTable 
                ? "w-full min-w-0 max-w-full" 
                : "w-auto"
              : "w-full min-w-0 max-w-full"
        )}>
          <p className="sr-only">{isUser ? "You" : "Bart"} said:</p>
          
          {/* Content rendering */}
          {isEditing ? (
            <div className="space-y-3 w-full min-w-0 max-w-full">
              <textarea
                value={editingContent}
                onChange={(e) => setEditingContent(e.target.value)}
                onKeyDown={handleKeyPress}
                className="!w-full !min-h-[120px] !max-w-full p-3 border border-border rounded-md bg-background text-foreground resize-y focus:outline-none focus:ring-2 focus:ring-primary text-sm leading-relaxed box-border block"
                placeholder="Edit your message..."
                autoFocus
                style={{ 
                  width: '100% !important', 
                  minHeight: '150px !important',
                  maxWidth: '100% !important',
                  height: 'max-content !important',
                  resize: 'vertical',
                  display: 'block'
                }}
                rows={5}
              />
              <div className="flex gap-2 justify-start">
                <Button 
                  size="sm" 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSaveEdit();
                  }}
                  disabled={!editingContent.trim()}
                  className="bg-sidebar hover:bg-black text-white flex items-center"
                >
                  <RiSaveLine size={14} className="mr-1" />
                  Save
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleCancelEdit();
                  }}
                  className="border-black text-black-600 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center"
                >
                  <RiCloseLine size={14} className="mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : isUser ? (
            // For user messages, use FormattedMessage to support markdown tables
            <FormattedMessage content={messageContent || ""} />
          ) : (
            // For AI messages, render children (which should already be FormattedMessage)
            children
          )}
        </div>
        
        {!isEditing && !isUser && messageId && messageContent && messageTimestamp && (
          <>
            <MessageActions 
              messageId={messageId}
              messageContent={messageContent}
              messageTimestamp={messageTimestamp}
              isUser={isUser}
              userProfileImage={userProfileImage}
              onEdit={isUser ? () => onUserMessageClick?.(messageId, messageContent) : undefined}
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
  disabled?: boolean;
};

function ActionButton({ icon, label, onClick, isActive, disabled }: ActionButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button 
          onClick={disabled ? undefined : onClick}
          disabled={disabled}
          className={cn(
            "relative text-muted-foreground/80 hover:text-foreground transition-colors size-8 flex items-center justify-center before:absolute before:inset-y-1.5 before:left-0 before:w-px before:bg-border first:before:hidden first-of-type:rounded-s-lg last-of-type:rounded-e-lg focus-visible:z-10 outline-offset-2 focus-visible:outline-2 focus-visible:outline-ring/70",
            isActive && "text-primary hover:text-primary/80",
            disabled && "opacity-50 cursor-not-allowed hover:text-muted-foreground/80"
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
  onEdit?: () => void;
};

function MessageActions({ 
  messageId, 
  messageContent, 
  messageTimestamp, 
  isUser, 
  userProfileImage,
  onEdit
}: MessageActionsProps) {
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarks();
  const { regenerateMessage, replyContext, addReplyContext, removeReplyContext } = useChat();
  const [justCopied, setJustCopied] = useState(false);
  const bookmarked = isBookmarked(messageId);
  const isInReplyContext = replyContext.some(ctx => ctx.messageId === messageId);

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

  const handleRefresh = async () => {
    await regenerateMessage(messageId);
  };


  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(messageContent);
      setJustCopied(true);
      setTimeout(() => setJustCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const handleReply = () => {
    if (isInReplyContext) {
      removeReplyContext(messageId);
    } else {
      // Only add if we haven't reached the limit of 3
      if (replyContext.length < 3) {
        addReplyContext(messageId, messageContent, messageTimestamp);
      }
    }
  };

  // Check if reply button should be disabled
  const isReplyDisabled = !isInReplyContext && replyContext.length >= 3;

  return (
    <div className="relative inline-flex bg-white rounded-md border border-black/[0.08] shadow-sm -space-x-px dark:bg-sidebar dark:border-white/[0.08]">
      <TooltipProvider delayDuration={0}>
        <ActionButton 
          icon={bookmarked ? <RiBookmarkFill size={16} /> : <RiBookmarkLine size={16} />} 
          label={bookmarked ? "Remove bookmark" : "Bookmark"}
          onClick={handleBookmarkToggle}
          isActive={bookmarked}
        />
        {/* Show refresh button for AI messages */}
        {!isUser && (
          <ActionButton 
            icon={<RiLoopRightFill size={16} />} 
            label="Refresh" 
            onClick={handleRefresh}
          />
        )}
        <ActionButton 
          icon={<RiReplyLine size={16} />} 
          label={isInReplyContext ? "Remove from reply" : isReplyDisabled ? "Maximum 3 replies selected" : "Reply to this"}
          onClick={handleReply}
          isActive={isInReplyContext}
          disabled={isReplyDisabled}
        />
        <ActionButton 
          icon={justCopied ? <RiCheckLine size={16} /> : <RiFileCopyLine size={16} />} 
          label={justCopied ? "Copied!" : "Copy"}
          onClick={handleCopy}
          isActive={justCopied}
        />

      </TooltipProvider>
    </div>
  );
}

type BookmarkIndicatorProps = {
  messageId: string;
};

