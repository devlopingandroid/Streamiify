import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { MessageSquare, Edit2, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Avatar } from "../ui/Avatar";
import { CommentInput } from "./CommentInput";
import {
  useCommentReplies,
  useCreateReply,
  useUpdateComment,
  useDeleteComment,
} from "../../hooks/useComments";
import { formatTimeAgo } from "../../utils";

export const CommentItem = ({ comment, videoId, parentCommentId = null }) => {
  const { user } = useSelector((state) => state.auth);

  // States
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [showReplies, setShowReplies] = useState(false);

  // Hook integrations
  const isCommentOwner = user && comment.owner && user._id === (comment.owner._id || comment.owner);
  const isParent = !comment.parentComment;

  const { data: replies, refetch: fetchReplies, isLoading: repliesLoading } = useCommentReplies(comment._id);

  const replyMutation = useCreateReply(videoId, comment._id);
  const updateMutation = useUpdateComment(videoId, parentCommentId);
  const deleteMutation = useDeleteComment(videoId, parentCommentId);

  const handleToggleReplies = () => {
    if (!showReplies) {
      fetchReplies();
    }
    setShowReplies(!showReplies);
  };

  const handleEditSubmit = (newContent) => {
    updateMutation.mutate(
      { commentId: comment._id, content: newContent },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
      }
    );
  };

  const handleReplySubmit = (replyContent) => {
    replyMutation.mutate(replyContent, {
      onSuccess: () => {
        setIsReplying(false);
        setShowReplies(true);
        fetchReplies();
      },
    });
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      deleteMutation.mutate(comment._id);
    }
  };

  return (
    <div className="flex gap-3 text-left py-3 border-b border-slate-800/30 group/comment">
      <Link to="/landing" className="flex-shrink-0">
        <Avatar src={comment.owner?.avatar} name={comment.owner?.fullname || "User"} size="sm" />
      </Link>

      <div className="flex flex-col flex-grow min-w-0">
        {/* Author / Time Details Header */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link to="/landing" className="text-xs font-semibold text-[#374151] hover:text-[#111827] transition-colors">
            {comment.owner?.fullname}
          </Link>
          <span className="text-[10px] text-[#6B7280]">@{comment.owner?.username}</span>
          <span className="text-[10px] text-[#6B7280]">•</span>
          <span className="text-[10px] text-[#6B7280]">{formatTimeAgo(comment.createdAt)}</span>
          {comment.isEdited && (
            <span className="text-[9px] text-[#6B7280] font-medium italic bg-slate-100 px-1.5 py-0.5 rounded">
              Edited
            </span>
          )}
        </div>

        {/* Content Box or Inline Edit Field */}
        <div className="mt-1.5 text-xs text-[#374151] leading-relaxed break-words pr-2">
          {isEditing ? (
            <CommentInput
              initialValue={comment.content}
              submitLabel="Save"
              onSubmit={handleEditSubmit}
              onCancel={() => setIsEditing(false)}
              isLoading={updateMutation.isPending}
              autoFocus
            />
          ) : (
            <p>{comment.content}</p>
          )}
        </div>

        {/* Actions Row */}
        {!isEditing && (
          <div className="flex items-center gap-4 mt-2.5 text-[10px] text-[#6B7280] font-semibold select-none">
            {isParent && (
              <button
                onClick={() => setIsReplying(!isReplying)}
                className="flex items-center gap-1 hover:text-[#111827] transition-colors cursor-pointer"
                aria-label="Reply to comment"
              >
                <MessageSquare size={12} />
                <span>Reply</span>
              </button>
            )}

            {isCommentOwner && (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1 hover:text-[#111827] transition-colors cursor-pointer"
                  aria-label="Edit comment"
                >
                  <Edit2 size={12} />
                  <span>Edit</span>
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-1 hover:text-red-500 transition-colors cursor-pointer"
                  aria-label="Delete comment"
                >
                  <Trash2 size={12} />
                  <span>Delete</span>
                </button>
              </>
            )}
          </div>
        )}

        {/* Inline Reply input field */}
        {isReplying && (
          <div className="mt-3 pl-2 border-l border-slate-800">
            <CommentInput
              placeholder={`Reply to @${comment.owner?.username}...`}
              submitLabel="Reply"
              onSubmit={handleReplySubmit}
              onCancel={() => setIsReplying(false)}
              isLoading={replyMutation.isPending}
              autoFocus
            />
          </div>
        )}

        {/* Replies toggle triggers */}
        {isParent && comment.replyCount > 0 && (
          <div className="mt-2 text-left">
            <button
              onClick={handleToggleReplies}
              className="inline-flex items-center gap-1.5 text-[10px] font-bold text-brand-cyan hover:underline cursor-pointer"
            >
              {showReplies ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              <span>
                {showReplies ? "Hide" : "Show"} {comment.replyCount}{" "}
                {comment.replyCount === 1 ? "reply" : "replies"}
              </span>
            </button>
          </div>
        )}

        {/* Nested replies loader / recursion tree */}
        {showReplies && (
          <div className="mt-2 pl-4 border-l border-slate-800/60 flex flex-col gap-2">
            {repliesLoading ? (
              <span className="text-[10px] text-slate-500 animate-pulse">Loading replies...</span>
            ) : (
              replies?.map((reply) => (
                <CommentItem
                  key={reply._id}
                  comment={reply}
                  videoId={videoId}
                  parentCommentId={comment._id}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentItem;
