import React, { useState } from "react";
import axios from "axios";
import { X, Plus, Trash2, UploadCloud, Loader2 } from "lucide-react";
import "./CreatePostModal.css";

const PREMADE_TAGS = ["Announcement", "Update", "Notification", "Opportunity"];

const TagSelector = ({ selectedTags, setSelectedTags }) => {
  const [customTagInput, setCustomTagInput] = useState("");
  const [isAddingCustom, setIsAddingCustom] = useState(false);

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleAddCustom = (e) => {
    e.preventDefault();
    if (
      customTagInput.trim() &&
      !selectedTags.includes(customTagInput.trim())
    ) {
      setSelectedTags([...selectedTags, customTagInput.trim()]);
    }
    setCustomTagInput("");
    setIsAddingCustom(false);
  };

  return (
    <div className="tag-selector-wrapper">
      <label>Post Tags</label>
      <div className="tags-container">
        {PREMADE_TAGS.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => toggleTag(tag)}
            className={`tag-pill ${selectedTags.includes(tag) ? "active" : ""}`}
          >
            {tag}
          </button>
        ))}

        {/* custom tag banana hua to */}
        {selectedTags
          .filter((tag) => !PREMADE_TAGS.includes(tag))
          .map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className="tag-pill active custom-tag"
            >
              {tag} <X size={14} />
            </button>
          ))}

        {isAddingCustom ? (
          <form onSubmit={handleAddCustom} className="custom-tag-form">
            <input
              type="text"
              autoFocus
              value={customTagInput}
              onChange={(e) => setCustomTagInput(e.target.value)}
              placeholder="New tag..."
              onBlur={() => {
                if (!customTagInput) setIsAddingCustom(false);
              }}
            />
          </form>
        ) : (
          <button
            type="button"
            className="add-tag-btn"
            onClick={() => setIsAddingCustom(true)}
          >
            <Plus size={16} /> Add Custom
          </button>
        )}
      </div>
    </div>
  );
};

const TextPostForm = ({ postToEdit, onSubmit, isSubmitting }) => {
  const [title, setTitle] = useState(postToEdit?.title || "");
  const [content, setContent] = useState(postToEdit?.content || "");
  const [tags, setTags] = useState(postToEdit?.tags || []);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ type: "message", title, content, tags });
  };

  return (
    <form className="post-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Title</label>
        <input
          type="text"
          placeholder="Enter announcement title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          disabled={isSubmitting}
        />
      </div>
      <div className="form-group">
        <label>Body Content</label>
        <textarea
          placeholder="Write your post here..."
          rows={6}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          disabled={isSubmitting}
        ></textarea>
      </div>
      <TagSelector
        selectedTags={tags}
        setSelectedTags={setTags}
        disabled={isSubmitting}
      />

      <button
        type="submit"
        className="submit-post-btn media-btn"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <Loader2 size={20} className="animate-spin" />
        ) : (
          <UploadCloud size={20} />
        )}
        {isSubmitting ? "Updating..." : "Save Changes"}
      </button>
    </form>
  );
};

const PollPostForm = ({ postToEdit, onSubmit, isSubmitting }) => {
  const [title, setTitle] = useState(postToEdit?.title || "");
  const [content, setContent] = useState(postToEdit?.content || "");
  const [tags, setTags] = useState(postToEdit?.tags || []);
  const [options, setOptions] = useState(postToEdit?.pollOptions || ["", ""]); // Default 2 options

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    setOptions([...options, ""]);
  };

  const removeOption = (indexToRemove) => {
    setOptions(options.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validOptions = options.filter((opt) => opt.trim() !== "");
    onSubmit({
      type: "poll",
      title,
      pollOptions: validOptions,
      tags,
    });
  };

  return (
    <form className="post-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Poll Question</label>
        <input
          type="text"
          placeholder="Ask a question..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="form-group options-group">
        <label>Poll Options</label>
        <div className="poll-options-list">
          {options.map((opt, i) => (
            <div key={i} className="poll-option-row">
              <span className="option-number">{i + 1}.</span>
              <input
                type="text"
                placeholder={`Option ${i + 1}`}
                value={opt}
                onChange={(e) => handleOptionChange(i, e.target.value)}
                required
                disabled={isSubmitting}
              />
              {options.length > 2 && (
                <button
                  type="button"
                  className="remove-option-btn"
                  onClick={() => removeOption(i)}
                  disabled={isSubmitting}
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          className="add-option-btn"
          onClick={addOption}
          disabled={isSubmitting}
        >
          <Plus size={16} /> Add Option
        </button>
      </div>

      <TagSelector
        selectedTags={tags}
        setSelectedTags={setTags}
        disabled={isSubmitting}
      />

      <button
        type="submit"
        className="submit-post-btn poll-btn"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <Loader2 size={20} className="animate-spin" />
        ) : (
          <UploadCloud size={20} />
        )}
        {isSubmitting ? "Updating..." : `Save Changes`}
      </button>
    </form>
  );
};

const MediaUploadForm = ({ type, postToEdit, onSubmit, isSubmitting }) => {
  const [title, setTitle] = useState(postToEdit?.title || "");
  const [content, setContent] = useState(postToEdit?.content || "");
  const [tags, setTags] = useState(postToEdit?.tags || []);
  const [files, setFiles] = useState([]);
  const [assignmentId, setAssignmentId] = useState(postToEdit?.assignmentId || "");

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    if (type === "Image" && selected.length > 3) {
      alert("You can only upload a maximum of 3 images.");
      setFiles(selected.slice(0, 3));
    } else {
      setFiles(selected);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const mediaType =
      type === "Image" ? "photo" : type === "Video" ? "video" : "assignment";
    onSubmit({ type: mediaType, title, content, tags, files, assignmentId });
  };

  return (
    <form className="post-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Title</label>
        <input
          type="text"
          placeholder={`Enter ${type.toLowerCase()} title...`}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="form-group">
        <label>Body Content (Optional)</label>
        <textarea
          placeholder="Add some text context to this media..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows="3"
          disabled={isSubmitting}
        />
      </div>

      <div className="form-group">
        <label>Upload File</label>
        <div className="drag-drop-zone">
          <input
            type="file"
            className="file-input"
            onChange={handleFileChange}
            multiple={type === "Image"}
            accept={
              type === "Image"
                ? "image/*"
                : type === "Video"
                  ? "video/*"
                  : "application/pdf"
            }
            disabled={isSubmitting}
          />
          <div className="drag-drop-content">
            {isSubmitting ? (
              <Loader2 size={48} color="#3b82f6" className="animate-spin" />
            ) : (
              <UploadCloud
                size={48}
                color={files.length > 0 ? "#10b981" : "#3b82f6"}
              />
            )}
            <h3>
              {files.length > 0
                ? `${files.length} file(s) selected`
                : `Replace ${type} (Optional)`}
            </h3>
            <p>
              {files.length > 0
                ? files.map((f) => f.name).join(", ")
                : "Leave empty to keep existing media"}
            </p>
          </div>
        </div>
      </div>

      {type === "Assignment" && (
        <div className="form-group">
          <label>Assignment Number (1-20) *</label>
          <input
            type="number"
            min="1"
            max="20"
            placeholder="e.g. 1"
            value={assignmentId}
            onChange={(e) => setAssignmentId(e.target.value)}
            disabled={isSubmitting}
            required
          />
        </div>
      )}

      <TagSelector selectedTags={tags} setSelectedTags={setTags} />

      <button
        type="submit"
        className="submit-post-btn media-btn"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <Loader2 size={20} className="animate-spin" />
        ) : (
          <UploadCloud size={20} />
        )}
        {isSubmitting ? "Updating..." : `Save Changes`}
      </button>
    </form>
  );
};

const EditPostModal = ({ postToEdit, onClose, onUpdate }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Determine frontend 'type' string from backend type
  let typeString = "Text Post";
  if (postToEdit?.type === "poll") typeString = "Poll";
  if (postToEdit?.type === "photo") typeString = "Image";
  if (postToEdit?.type === "video") typeString = "Video";
  if (postToEdit?.type === "assignment") typeString = "Assignment";

  const type = typeString;

  const handleOverlayClick = (e) => {
    if (e.target.className === "modal-overlay" && !isSubmitting) {
      onClose();
    }
  };

  const submitToBackend = async (postData) => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const authHeaders = { Authorization: `Bearer ${token}` };

      let updatedPost = null;

      if (postData.type === "message" || postData.type === "poll") {
        const res = await axios.put(
          `http://localhost:5000/api/bootcamp/${postToEdit.id}`,
          postData,
          { headers: authHeaders },
        );
        updatedPost = res.data.post;
      } else {
        const formData = new FormData();
        formData.append("title", postData.title);
        if (postData.content) formData.append("content", postData.content);
        formData.append("type", postData.type);
        formData.append("tags", JSON.stringify(postData.tags));
        if (postData.files && postData.files.length > 0) {
          const fieldName =
            postData.type === "photo"
              ? "photo"
              : postData.type === "video"
                ? "video"
                : "assignment";
          postData.files.forEach((f) => {
            formData.append(fieldName, f);
          });
        }
        
        if (postData.type === "assignment" && postData.assignmentId) {
          formData.append("assignmentId", postData.assignmentId);
        }

        const res = await axios.put(
          `http://localhost:5000/api/bootcamp/${postToEdit.id}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              ...authHeaders,
            },
          },
        );
        updatedPost = res.data.post;
      }

      alert(`Success! Post has been updated.`);
      if (onUpdate && updatedPost) {
        onUpdate(updatedPost);
      }
      onClose();
    } catch (err) {
      console.error(err);
      alert(`Failed to update: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-container">
        <button
          className="close-modal-btn"
          onClick={onClose}
          disabled={isSubmitting}
        >
          <X size={24} />
        </button>

        <div className="modal-header">
          <h2>Edit {type}</h2>
          <p>Make changes to your post and save.</p>
        </div>

        <div className="modal-body">
          {type === "Text Post" && (
            <TextPostForm
              postToEdit={postToEdit}
              onSubmit={submitToBackend}
              isSubmitting={isSubmitting}
            />
          )}
          {type === "Poll" && (
            <PollPostForm
              postToEdit={postToEdit}
              onSubmit={submitToBackend}
              isSubmitting={isSubmitting}
            />
          )}
          {(type === "Image" || type === "Video" || type === "Assignment") && (
            <MediaUploadForm
              type={type}
              postToEdit={postToEdit}
              onSubmit={submitToBackend}
              isSubmitting={isSubmitting}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default EditPostModal;
