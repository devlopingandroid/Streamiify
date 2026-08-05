import React, { useState, useEffect } from "react";
import { useCreatePlaylist, useUpdatePlaylist } from "../../hooks/useUserFeatures";
import { Modal } from "./Modal";
import { InputField } from "./InputField";
import { Button } from "./Button";
import { toast } from "react-hot-toast";

export const CreatePlaylistModal = ({ isOpen, onClose, playlist = null }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [errorMsg, setErrorMsg] = useState("");

  const createPlaylistMutation = useCreatePlaylist();
  const updatePlaylistMutation = useUpdatePlaylist(playlist?._id);

  // Sync state with playlist prop when modal opens/changes
  useEffect(() => {
    if (playlist) {
      setName(playlist.name || "");
      setDescription(playlist.description || "");
      setVisibility(playlist.visibility?.toLowerCase() || "public");
    } else {
      setName("");
      setDescription("");
      setVisibility("public");
    }
    setErrorMsg("");
  }, [playlist, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!name.trim()) {
      setErrorMsg("Playlist name is required");
      return;
    }

    if (playlist) {
      // Edit Mode
      updatePlaylistMutation.mutate(
        {
          name: name.trim(),
          description: description.trim(),
          visibility: visibility.toLowerCase(),
        },
        {
          onSuccess: () => {
            toast.success(`Updated playlist "${name}" successfully.`);
            onClose();
          },
          onError: (err) => {
            toast.error(err?.message || "Failed to update playlist.");
          },
        }
      );
    } else {
      // Create Mode
      createPlaylistMutation.mutate(
        {
          name: name.trim(),
          description: description.trim(),
          visibility: visibility.toLowerCase(),
        },
        {
          onSuccess: () => {
            toast.success(`Created playlist "${name}" successfully.`);
            setName("");
            setDescription("");
            setVisibility("public");
            onClose();
          },
          onError: (err) => {
            toast.error(err?.message || "Failed to create playlist.");
          },
        }
      );
    }
  };

  const isPending = playlist ? updatePlaylistMutation.isPending : createPlaylistMutation.isPending;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={playlist ? "Edit Playlist Details" : "Create New Playlist"}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
        <InputField
          label="Playlist Title"
          placeholder="e.g. Distributed Core Systems"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (e.target.value.trim()) setErrorMsg("");
          }}
          disabled={isPending}
          error={errorMsg}
          autoFocus
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-2xs font-semibold uppercase tracking-wider text-slate-400">
            Description
          </label>
          <textarea
            placeholder="Provide a description for this playlist folder..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isPending}
            className="w-full h-24 bg-slate-900 border border-slate-800 focus:border-brand-cyan hover:border-slate-700 text-xs text-slate-200 p-3 rounded-lg focus:outline-none transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-2xs font-semibold uppercase tracking-wider text-slate-400">
            Visibility
          </label>
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
            disabled={isPending}
            className="w-full bg-slate-900 border border-slate-800 focus:border-brand-cyan hover:border-slate-700 text-xs text-slate-200 p-3 rounded-lg focus:outline-none transition-colors"
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </div>

        <div className="flex justify-end gap-2.5 mt-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" variant="solid" size="sm" isLoading={isPending}>
            {playlist ? "Save Changes" : "Create Playlist"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreatePlaylistModal;
