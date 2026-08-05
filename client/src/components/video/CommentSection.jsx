import React from "react";
import { CommentInput } from "./CommentInput";
import { CommentItem } from "./CommentItem";
import { Button } from "../ui/Button";
import {
  useCommentCount,
  useInfiniteVideoComments,
  useCreateComment,
} from "../../hooks/useComments";

export const CommentSection = ({ videoId }) => {
  // Query counts and infinite comment states
  const { data: count, isLoading: countLoading } = useCommentCount(videoId);
  const {
    data: commentsData,
    isLoading: commentsLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteVideoComments(videoId);

  const createMutation = useCreateComment(videoId);

  const handleCommentSubmit = (content) => {
    createMutation.mutate(content);
  };

  if (commentsLoading) {
    return (
      <div className="mt-8 text-left animate-pulse">
        <div className="h-4 bg-slate-800 rounded w-24 mb-4" />
        <div className="h-10 bg-slate-800 rounded w-full mb-6" />
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={`comment-skeleton-${idx}`} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-800" />
              <div className="flex-grow flex flex-col gap-2">
                <div className="h-3 bg-slate-800 rounded w-32" />
                <div className="h-3 bg-slate-800 rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mt-8 text-center text-xs text-slate-500 py-6">
        Failed to load comments. Please refresh the page.
      </div>
    );
  }

  // Flatten comments from all pages
  const comments = commentsData?.pages.flatMap((page) => page?.comments || []) || [];

  return (
    <div className="mt-8 text-left">
      {/* Header with Comment Counts */}
      <h3 className="text-sm font-bold text-[#111827] mb-4 select-none">
        {countLoading ? "Comments" : `${count} ${count === 1 ? "Comment" : "Comments"}`}
      </h3>

      {/* Root input to create comments */}
      <div className="mb-6 bg-slate-900/10 border border-slate-800/40 p-4 rounded-xl">
        <CommentInput
          placeholder="Add a public comment..."
          submitLabel="Comment"
          onSubmit={handleCommentSubmit}
          isLoading={createMutation.isPending}
        />
      </div>

      {/* List of comments */}
      {comments.length === 0 ? (
        <div className="text-center text-xs text-slate-500 py-8 select-none">
          No comments yet. Be the first to share your thoughts!
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          {comments.map((comment) => (
            <CommentItem key={comment._id} comment={comment} videoId={videoId} />
          ))}
        </div>
      )}

      {/* Pagination loader */}
      {hasNextPage && (
        <div className="flex justify-center mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            isLoading={isFetchingNextPage}
            className="rounded-full px-6 text-2xs uppercase tracking-wider"
          >
            Load More Comments
          </Button>
        </div>
      )}
    </div>
  );
};

export default CommentSection;
