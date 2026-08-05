import React, { useState } from "react";
import { useMyPlaylists, useAddVideoToPlaylist, useRemoveVideoFromPlaylist, useCreatePlaylist } from "../../hooks/useUserFeatures";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { InputField } from "./InputField";
import { PlaySquare, Globe, Lock, Plus } from "lucide-react";
import { toast } from "react-hot-toast";

export const AddToPlaylistModal = ({ isOpen, onClose, videoId }) => {
  const { data: playlists, isLoading, error } = useMyPlaylists();
  const addVideoMutation = useAddVideoToPlaylist();
  const removeVideoMutation = useRemoveVideoFromPlaylist();
  const createPlaylistMutation = useCreatePlaylist();

  // Inline playlist creation state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newVisibility, setNewVisibility] = useState("public");
  const [createError, setCreateError] = useState("");

  const handleToggleVideo = (playlist, belongs) => {
    if (belongs) {
      removeVideoMutation.mutate(
        { playlistId: playlist._id, videoId },
        {
          onSuccess: () => {
            toast.success(`Removed video from playlist "${playlist.name}".`);
          },
        }
      );
    } else {
      addVideoMutation.mutate(
        { playlistId: playlist._id, videoId },
        {
          onSuccess: () => {
            toast.success(`Added video to playlist "${playlist.name}".`);
          },
        }
      );
    }
  };

  const handleCreatePlaylist = (e) => {
    e.preventDefault();
    setCreateError("");

    if (!newName.trim()) {
      setCreateError("Playlist name is required");
      return;
    }

    createPlaylistMutation.mutate(
      {
        name: newName.trim(),
        description: newDescription.trim(),
        visibility: newVisibility.toLowerCase(),
      },
      {
        onSuccess: (data) => {
          const newPlaylist = data?.data || data;
          toast.success(`Created playlist "${newName}"`);
          
          // Automatically add the current video to the newly created playlist
          if (newPlaylist?._id) {
            addVideoMutation.mutate(
              { playlistId: newPlaylist._id, videoId },
              {
                onSuccess: () => {
                  toast.success(`Added video to newly created playlist "${newName}".`);
                },
              }
            );
          }

          // Reset form fields
          setNewName("");
          setNewDescription("");
          setNewVisibility("public");
          setShowCreateForm(false);
        },
        onError: (err) => {
          toast.error(err?.message || "Failed to create playlist.");
        },
      }
    );
  };

  const isCreating = createPlaylistMutation.isPending;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Save to playlist...">
      <div className="flex flex-col gap-5 text-left text-slate-100 font-sans max-h-[60vh] overflow-hidden">
        {/* Playlists checklist section */}
        <div className="flex-grow overflow-y-auto max-h-[30vh] flex flex-col gap-3 pr-1 scrollbar-thin">
          {isLoading ? (
            <div className="flex flex-col gap-3 animate-pulse">
              {[1, 2, 3].map((n) => (
                <div key={n} className="flex items-center gap-3 py-1.5">
                  <div className="w-4.5 h-4.5 bg-slate-800 rounded" />
                  <div className="w-10 h-7 bg-slate-800 rounded" />
                  <div className="flex-grow flex flex-col gap-1.5">
                    <div className="h-3 w-[50%] bg-slate-800 rounded" />
                    <div className="h-2 w-[30%] bg-slate-800 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <p className="text-xs text-red-400">Failed to load playlists.</p>
          ) : !playlists || playlists.length === 0 ? (
            <div className="text-center py-4 text-slate-500 text-xs flex flex-col items-center gap-1">
              <PlaySquare size={24} className="text-slate-700" />
              <span>No playlists created yet.</span>
            </div>
          ) : (
            playlists.map((playlist) => {
              const belongs = playlist.videos?.some(
                (v) => (typeof v === "string" ? v : v?._id) === videoId
              );
              
              const isToggling = (addVideoMutation.isPending || removeVideoMutation.isPending) && 
                (addVideoMutation.variables?.playlistId === playlist._id || removeVideoMutation.variables?.playlistId === playlist._id);

              const firstThumbnail = playlist.videos?.[0]?.thumbnail;

              return (
                <label 
                  key={playlist._id} 
                  className={`flex items-center justify-between p-2.5 rounded-xl border border-slate-800/40 hover:bg-slate-900/20 cursor-pointer select-none transition-colors ${
                    belongs ? "bg-slate-900/10 border-slate-800" : "bg-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <input
                      type="checkbox"
                      checked={belongs || false}
                      disabled={isToggling}
                      onChange={() => handleToggleVideo(playlist, belongs)}
                      className="w-4.5 h-4.5 rounded border-slate-700 bg-slate-900 text-brand-cyan focus:ring-brand-cyan/20 cursor-pointer accent-brand-cyan disabled:opacity-50"
                    />
                    
                    {/* Small thumbnail representation */}
                    <div className="w-10 h-7 rounded bg-slate-950 overflow-hidden flex items-center justify-center border border-slate-800 flex-shrink-0">
                      {firstThumbnail ? (
                        <img src={firstThumbnail} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <PlaySquare size={12} className="text-slate-700" />
                      )}
                    </div>

                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-semibold text-slate-200 truncate">{playlist.name}</span>
                      <span className="text-[9px] text-slate-500 mt-0.5">
                        {playlist.videosCount || 0} {playlist.videosCount === 1 ? "video" : "videos"}
                      </span>
                    </div>
                  </div>

                  <span className={`inline-flex items-center gap-0.5 text-[7px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full flex-shrink-0 ${
                    playlist.visibility === "Public" || playlist.visibility === "public"
                      ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                      : "bg-slate-800 text-slate-400 border border-slate-700/60"
                  }`}>
                    {playlist.visibility === "Public" || playlist.visibility === "public" ? <Globe size={6} /> : <Lock size={6} />}
                    <span className="capitalize">{playlist.visibility || "Public"}</span>
                  </span>
                </label>
              );
            })
          )}
        </div>

        {/* Inline Create Form Section */}
        <div className="border-t border-slate-800 pt-4 flex flex-col gap-3">
          {!showCreateForm ? (
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-2 text-xs font-semibold text-brand-cyan hover:text-cyan-300 transition-colors w-fit px-1 py-0.5 cursor-pointer"
            >
              <Plus size={14} />
              <span>Create new playlist</span>
            </button>
          ) : (
            <form onSubmit={handleCreatePlaylist} className="flex flex-col gap-3 animate-fade-in text-left">
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs font-bold text-slate-300">New Playlist Detail</span>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="text-[10px] text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <InputField
                label="Playlist Title"
                placeholder="Enter title..."
                value={newName}
                onChange={(e) => {
                  setNewName(e.target.value);
                  if (e.target.value.trim()) setCreateError("");
                }}
                disabled={isCreating}
                error={createError}
                autoFocus
                className="py-1.5!"
              />

              <textarea
                placeholder="Description (optional)..."
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                disabled={isCreating}
                className="w-full h-16 bg-slate-900 border border-slate-800 focus:border-brand-cyan hover:border-slate-700 text-xs text-slate-200 p-2.5 rounded-lg focus:outline-none transition-colors"
              />

              <div className="flex items-center justify-between gap-4 mt-1">
                <select
                  value={newVisibility}
                  onChange={(e) => setNewVisibility(e.target.value)}
                  disabled={isCreating}
                  className="bg-slate-900 border border-slate-800 text-[11px] text-slate-200 px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-brand-cyan hover:border-slate-700 transition-colors"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>

                <Button 
                  type="submit" 
                  variant="solid" 
                  size="xs" 
                  isLoading={isCreating}
                  className="rounded-full"
                >
                  Create
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default AddToPlaylistModal;
