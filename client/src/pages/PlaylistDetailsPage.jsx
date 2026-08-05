import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { usePlaylist, useDeletePlaylist, useUpdatePlaylistVisibility } from "../hooks/useUserFeatures";
import { VideoCard } from "../components/video/VideoCard";
import { VideoGrid } from "../components/video/VideoGrid";
import { Avatar } from "../components/ui/Avatar";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorState } from "../components/ui/ErrorState";
import { PageLoader } from "../components/ui/PageLoader";
import { CreatePlaylistModal } from "../components/ui/CreatePlaylistModal";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { PlaySquare, Globe, Lock, Calendar, ChevronLeft, Edit, Trash2 } from "lucide-react";
import { formatDate } from "../utils";
import { toast } from "react-hot-toast";

export const PlaylistDetailsPage = () => {
  const { playlistId } = useParams();
  const { data: playlist, isLoading, error, refetch } = usePlaylist(playlistId);
  const navigate = useNavigate();

  const { user: currentUser } = useSelector((state) => state.auth);
  
  // Modals state
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showVisibilityConfirm, setShowVisibilityConfirm] = useState(false);

  // Mutations
  const deletePlaylistMutation = useDeletePlaylist();
  const updateVisibilityMutation = useUpdatePlaylistVisibility();

  if (isLoading) {
    return <PageLoader message="Opening playlist container..." />;
  }

  if (error || !playlist) {
    return (
      <div className="p-6 md:p-12">
        <ErrorState
          title="Playlist Access Error"
          description="Failed to load playlist records. It may have been deleted or visibility settings prevent access."
          onRetry={refetch}
        />
      </div>
    );
  }

  // Verify ownership
  const isOwner = currentUser?._id && (
    playlist.owner === currentUser._id || 
    playlist.owner?._id === currentUser._id ||
    playlist.owner?.username === currentUser.username
  );

  const videos = playlist.videos || [];
  const totalVideos = videos.length;
  const firstVideoThumbnail = videos[0]?.thumbnail;
  const formattedDate = formatDate(playlist.createdAt, "standard");

  const handleDeleteConfirm = () => {
    deletePlaylistMutation.mutate(playlist._id, {
      onSuccess: () => {
        setShowDeleteConfirm(false);
        navigate("/playlists");
      }
    });
  };

  const handleVisibilityToggle = () => {
    const nextVisibility = playlist.visibility?.toLowerCase() === "public" ? "private" : "public";
    if (nextVisibility === "private") {
      setShowVisibilityConfirm(true);
    } else {
      updateVisibilityMutation.mutate(
        { playlistId: playlist._id, visibility: "public" },
        {
          onSuccess: () => {
            toast.success("Playlist is now Public.");
          }
        }
      );
    }
  };

  const handleVisibilityToggleConfirm = () => {
    updateVisibilityMutation.mutate(
      { playlistId: playlist._id, visibility: "private" },
      {
        onSuccess: () => {
          setShowVisibilityConfirm(false);
          toast.success("Playlist is now Private.");
        }
      }
    );
  };

  return (
    <div className="p-6 md:p-8 max-w-[1440px] mx-auto animate-fade-in text-slate-100 select-none font-sans">
      
      {/* Back button */}
      <Link to="/playlists" className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-brand-cyan mb-6 transition-colors">
        <ChevronLeft size={16} />
        <span>Back to Playlists</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-8">
        
        {/* Left Side: Playlist Metadata Card */}
        <div className="flex flex-col rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900/40 to-slate-900/10 p-6 self-start w-full lg:sticky lg:top-20">
          {/* Cover/Thumbnail Stack */}
          <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center mb-6">
            {firstVideoThumbnail ? (
              <img src={firstVideoThumbnail} alt={playlist.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-700">
                <PlaySquare size={40} className="text-slate-800 mb-1" />
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-600">Empty Playlist</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                <PlaySquare size={16} className="text-brand-cyan" />
                <span>{totalVideos} {totalVideos === 1 ? "Video" : "Videos"}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 text-left font-sans">
            <div>
              <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                <h1 className="text-lg font-bold text-slate-100 leading-snug">{playlist.name}</h1>
                {isOwner ? (
                  <button
                    type="button"
                    onClick={handleVisibilityToggle}
                    disabled={updateVisibilityMutation.isPending}
                    className={`inline-flex items-center gap-1 text-[8px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full cursor-pointer hover:opacity-85 transition-opacity disabled:opacity-50 ${
                      playlist.visibility?.toLowerCase() === "public"
                        ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                        : "bg-slate-800 text-slate-400 border border-slate-700/60"
                    }`}
                    title="Click to toggle visibility"
                  >
                    {playlist.visibility?.toLowerCase() === "public" ? <Globe size={8} /> : <Lock size={8} />}
                    <span className="capitalize">{playlist.visibility || "public"}</span>
                  </button>
                ) : (
                  <span className={`inline-flex items-center gap-1 text-[8px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                    playlist.visibility?.toLowerCase() === "public"
                      ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                      : "bg-slate-800 text-slate-400 border border-slate-700/60"
                  }`}>
                    {playlist.visibility?.toLowerCase() === "public" ? <Globe size={8} /> : <Lock size={8} />}
                    <span className="capitalize">{playlist.visibility || "public"}</span>
                  </span>
                )}
              </div>
              
              <p className="text-xs text-slate-400 leading-relaxed break-words whitespace-pre-wrap">
                {playlist.description || "No description provided for this playlist folder."}
              </p>
            </div>

            <hr className="border-slate-800/60 my-1" />

            {/* Creator / Owner */}
            {playlist.owner && (
              <div className="flex items-center gap-3">
                <Link to={`/c/${playlist.owner.username}`}>
                  <Avatar src={playlist.owner.avatar} name={playlist.owner.fullname} size="sm" />
                </Link>
                <div className="flex flex-col min-w-0">
                  <Link to={`/c/${playlist.owner.username}`} className="text-xs font-semibold text-slate-200 hover:text-brand-cyan transition-colors truncate">
                    {playlist.owner.fullname}
                  </Link>
                  <span className="text-[10px] text-slate-500 truncate">@{playlist.owner.username}</span>
                </div>
              </div>
            )}

            {/* Created info */}
            <div className="flex items-center gap-2 text-[10px] text-slate-500">
              <Calendar size={12} />
              <span>Created on {formattedDate}</span>
            </div>

            {/* Management Buttons */}
            {isOwner && (
              <div className="flex gap-2.5 mt-2.5">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-grow gap-1.5 rounded-full text-xs text-slate-350 hover:text-brand-cyan hover:border-cyan-500/20 py-2 border-slate-800"
                  onClick={() => setShowEditModal(true)}
                >
                  <Edit size={12} />
                  <span>Edit</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-grow gap-1.5 rounded-full text-xs text-slate-350 hover:text-red-400 hover:border-red-500/20 py-2 border-slate-800"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 size={12} />
                  <span>Delete</span>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Videos List */}
        <div className="flex flex-col gap-4">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest text-left mb-2">Playlist Contents</h2>
          
          {videos.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/10 p-12 text-center flex flex-col items-center justify-center">
              <EmptyState
                title="Playlist Empty"
                description="No videos have been added to this playlist yet."
              />
            </div>
          ) : (
            <VideoGrid className="grid-cols-1 sm:grid-cols-2 xl:grid-cols-3!">
              {videos.map((video) => (
                <VideoCard key={video._id} video={video} />
              ))}
            </VideoGrid>
          )}
        </div>

      </div>

      {/* Edit Playlist Modal */}
      <CreatePlaylistModal 
        isOpen={showEditModal} 
        onClose={() => setShowEditModal(false)} 
        playlist={playlist}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog 
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Playlist"
        message={`Are you sure you want to delete the playlist "${playlist.name}"? Videos contained inside will not be affected.`}
        confirmLabel="Delete"
        isDanger={true}
        isLoading={deletePlaylistMutation.isPending}
      />

      {/* Visibility Confirmation Dialog */}
      <ConfirmDialog 
        isOpen={showVisibilityConfirm}
        onClose={() => setShowVisibilityConfirm(false)}
        onConfirm={handleVisibilityToggleConfirm}
        title="Change Visibility to Private"
        message={`Are you sure you want to make "${playlist.name}" Private? It will no longer be visible on your public channel.`}
        confirmLabel="Make Private"
        isLoading={updateVisibilityMutation.isPending}
      />

    </div>
  );
};

export default PlaylistDetailsPage;
