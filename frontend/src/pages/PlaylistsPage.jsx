import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useMyPlaylists, useDeletePlaylist, useUpdatePlaylistVisibility } from "../hooks/useUserFeatures";
import { CreatePlaylistModal } from "../components/ui/CreatePlaylistModal";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorState } from "../components/ui/ErrorState";
import { PlaySquare, Plus, Edit, Trash2 } from "lucide-react";
import { formatDate } from "../utils";
import { toast } from "react-hot-toast";

const PlaylistCardSkeleton = () => {
  return (
    <div className="flex flex-col rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-0 animate-pulse overflow-hidden select-none">
      <div className="aspect-video w-full shimmer-bg bg-slate-200 dark:bg-slate-800" />
      <div className="p-4 flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <div className="h-3 w-[60%] bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="h-3.5 w-12 bg-slate-200 dark:bg-slate-800 rounded-full" />
        </div>
        <div className="h-2.5 w-[85%] bg-slate-200 dark:bg-slate-800 rounded mt-1" />
        <div className="h-2.5 w-[50%] bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-2 w-20 bg-slate-200 dark:bg-slate-800 rounded mt-4" />
      </div>
    </div>
  );
};

const PlaylistCard = ({ playlist, onEdit, onDelete, onVisibilityToggle, isVisibilityUpdating }) => {
  const { user: currentUser } = useSelector((state) => state.auth);
  const firstVideoThumbnail = playlist.videos?.[0]?.thumbnail;
  const totalVideos = playlist.videos?.length || playlist.videosCount || 0;
  const formattedDate = formatDate(playlist.createdAt, "standard");

  // Verify ownership
  const isOwner = currentUser?._id && (
    playlist.owner === currentUser._id || 
    playlist.owner?._id === currentUser._id ||
    playlist.owner?.username === currentUser.username
  );

  return (
    <Link 
      to={`/playlists/${playlist._id}`}
      className="group flex flex-col rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] hover:border-slate-300 dark:hover:border-slate-700 shadow-xs hover:shadow-md transition-all duration-300 relative text-left"
    >
      {/* Thumbnail Stack */}
      <div className="relative aspect-video w-full bg-slate-100 dark:bg-slate-950 overflow-hidden flex items-center justify-center border-b border-slate-200 dark:border-slate-800">
        {firstVideoThumbnail ? (
          <img 
            src={firstVideoThumbnail} 
            alt={playlist.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-600">
            <PlaySquare size={32} className="mb-1 text-slate-400 dark:text-slate-600" />
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-500">Empty Playlist</span>
          </div>
        )}
        
        {/* Playlist Video Count Sidebar overlay */}
        <div className="absolute right-0 top-0 bottom-0 w-[36%] bg-slate-900/80 dark:bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center text-white gap-1 border-l border-white/10 select-none">
          <PlaySquare size={16} className="text-cyan-400" />
          <span className="text-xs font-bold">{totalVideos}</span>
          <span className="text-[8px] uppercase tracking-wider font-semibold text-slate-300">Videos</span>
        </div>
      </div>

      {/* Info panel details */}
      <div className="p-4 flex flex-col gap-2 flex-grow justify-between select-none">
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-start gap-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors truncate flex-grow">
              {playlist.name}
            </h3>
            {isOwner ? (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onVisibilityToggle(playlist);
                }}
                disabled={isVisibilityUpdating}
                className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full cursor-pointer hover:opacity-85 transition-opacity flex-shrink-0 disabled:opacity-50 ${
                  playlist.visibility?.toLowerCase() === "public" 
                    ? "bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800/60" 
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                }`}
                title="Click to toggle visibility"
              >
                <span className="capitalize">{playlist.visibility || "public"}</span>
              </button>
            ) : (
              <span className={`text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full flex-shrink-0 ${
                playlist.visibility?.toLowerCase() === "public" 
                  ? "bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800/60" 
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
              }`}>
                <span className="capitalize">{playlist.visibility || "public"}</span>
              </span>
            )}
          </div>
          
          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 min-h-[32px] leading-relaxed">
            {playlist.description || "No description provided."}
          </p>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800 pt-2.5 mt-1 flex justify-between items-center text-[10px] text-slate-500 dark:text-slate-400 font-medium">
          <span>Created {formattedDate}</span>
          {isOwner && (
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onEdit(playlist);
                }}
                className="p-1.5 rounded-md text-slate-500 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Edit Playlist"
              >
                <Edit size={13} />
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onDelete(playlist);
                }}
                className="p-1.5 rounded-md text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                title="Delete Playlist"
              >
                <Trash2 size={13} />
              </button>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export const PlaylistsPage = () => {
  const { data: playlists, isLoading, error, refetch } = useMyPlaylists();
  
  // Actions states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [playlistToEdit, setPlaylistToEdit] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [playlistToDelete, setPlaylistToDelete] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [playlistToToggleVisibility, setPlaylistToToggleVisibility] = useState(null);
  const [showVisibilityConfirm, setShowVisibilityConfirm] = useState(false);

  // Mutations
  const deletePlaylistMutation = useDeletePlaylist();
  const updateVisibilityMutation = useUpdatePlaylistVisibility();

  const handleEditInit = (playlist) => {
    setPlaylistToEdit(playlist);
    setShowEditModal(true);
  };

  const handleDeleteInit = (playlist) => {
    setPlaylistToDelete(playlist);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    if (!playlistToDelete) return;
    deletePlaylistMutation.mutate(playlistToDelete._id, {
      onSuccess: () => {
        setPlaylistToDelete(null);
        setShowDeleteConfirm(false);
      },
    });
  };

  const handleVisibilityToggle = (playlist) => {
    const nextVisibility = playlist.visibility?.toLowerCase() === "public" ? "private" : "public";
    if (nextVisibility === "private") {
      setPlaylistToToggleVisibility(playlist);
      setShowVisibilityConfirm(true);
    } else {
      updateVisibilityMutation.mutate(
        { playlistId: playlist._id, visibility: "public" },
        {
          onSuccess: () => {
            toast.success("Playlist visibility updated to Public.");
          },
        }
      );
    }
  };

  const handleVisibilityToggleConfirm = () => {
    if (!playlistToToggleVisibility) return;
    updateVisibilityMutation.mutate(
      { playlistId: playlistToToggleVisibility._id, visibility: "private" },
      {
        onSuccess: () => {
          setPlaylistToToggleVisibility(null);
          setShowVisibilityConfirm(false);
          toast.success("Playlist is now Private.");
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 flex flex-col gap-8 max-w-[1440px] mx-auto select-none animate-pulse">
        <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <PlaySquare size={20} className="text-slate-400" />
            <span>Library Playlists</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Organize your workspace streams in custom playlists.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, idx) => (
            <PlaylistCardSkeleton key={`playlists-skel-${idx}`} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 md:p-8">
        <ErrorState 
          title="Playlists Access Failure"
          description="We had trouble retrieving your playlist catalog."
          onRetry={refetch}
        />
      </div>
    );
  }

  const hasPlaylists = playlists && playlists.length > 0;

  return (
    <div className="p-4 sm:p-6 md:p-8 flex flex-col gap-8 select-none animate-fade-in max-w-[1440px] mx-auto relative font-sans">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 border border-cyan-200/60 dark:border-cyan-800/40">
              <PlaySquare size={20} />
            </span>
            <span>Library Playlists</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">Organize your workspace streams in custom playlists.</p>
        </div>

        <Button 
          variant="solid" 
          size="sm" 
          className="gap-1.5 rounded-full px-4 shadow-xs"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus size={15} />
          <span>New Playlist</span>
        </Button>
      </div>

      {!hasPlaylists ? (
        <EmptyState 
          icon={PlaySquare}
          title="No Playlists Available"
          description="Create your first playlist folder using the button above."
          actionLabel="Create Playlist"
          onAction={() => setShowCreateModal(true)}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {playlists.map((pl) => (
            <PlaylistCard 
              key={pl._id} 
              playlist={pl} 
              onEdit={handleEditInit}
              onDelete={handleDeleteInit}
              onVisibilityToggle={handleVisibilityToggle}
              isVisibilityUpdating={playlistToToggleVisibility?._id === pl._id && updateVisibilityMutation.isPending}
            />
          ))}
        </div>
      )}

      {/* Create Playlist Modal */}
      <CreatePlaylistModal 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)} 
      />

      {/* Edit Playlist Modal */}
      <CreatePlaylistModal 
        isOpen={showEditModal} 
        onClose={() => {
          setShowEditModal(false);
          setPlaylistToEdit(null);
        }} 
        initialData={playlistToEdit}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog 
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setPlaylistToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Playlist?"
        message={`Are you sure you want to delete "${playlistToDelete?.name || "this playlist"}"? This action cannot be undone.`}
        confirmLabel="Delete Playlist"
        isDanger={true}
        isLoading={deletePlaylistMutation.isPending}
      />

      {/* Confirm Make Private Dialog */}
      <ConfirmDialog 
        isOpen={showVisibilityConfirm}
        onClose={() => {
          setShowVisibilityConfirm(false);
          setPlaylistToToggleVisibility(null);
        }}
        onConfirm={handleVisibilityToggleConfirm}
        title="Make Playlist Private?"
        message={`Making "${playlistToToggleVisibility?.name || "this playlist"}" private will prevent other users from viewing it.`}
        confirmLabel="Make Private"
        cancelLabel="Cancel"
        isDanger={false}
        isLoading={updateVisibilityMutation.isPending}
      />

    </div>
  );
};

export default PlaylistsPage;
