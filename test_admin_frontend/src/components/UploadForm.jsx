import React, { useRef, useState } from "react";
import gsap from "gsap";
import {
  Type,
  BarChart2,
  Image as ImageIcon,
  Video,
  BookOpen,
  Plus,
  X,
} from "lucide-react";
import CreatePostModal from "./CreatePostModal";
import "./UploadForm.css";

const UploadForm = () => {
  const containerRef = useRef(null);
  const cardsRef = useRef([]);
  const triggerRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeFormType, setActiveFormType] = useState(null);

  const toggleCards = () => {
    if (!isOpen) {
      gsap.to(triggerRef.current, {
        scale: 0.95,
        opacity: 0.7,
        z: -50,
        duration: 0.6,
        ease: "power3.out",
      });

      const totalCards = cardsRef.current.length;
      const radius = 220;

      cardsRef.current.forEach((card, index) => {
        // math for pentagon arrangment , notes me calculation dekh lena pg142

        const angle = -Math.PI / 2 + index * ((2 * Math.PI) / totalCards);
        const xPos = Math.cos(angle) * radius;
        const yPos = Math.sin(angle) * radius;
        const rY = -(xPos / radius) * 20;
        const rX = (yPos / radius) * 15;

        gsap.to(card, {
          x: xPos,
          y: yPos,
          z: 50,
          rotationY: rY,
          rotationX: rX,
          scale: 1,
          opacity: 1,
          duration: 0.8,
          ease: "back.out(1.2)",
          delay: index * 0.08,
          pointerEvents: "auto",
        });
      });
    } else {
      gsap.to(triggerRef.current, {
        scale: 1,
        opacity: 1,
        z: 0,
        duration: 0.5,
        ease: "power3.out",
      });

      gsap.to(cardsRef.current, {
        x: 0,
        y: 0,
        z: -200,
        rotationY: 0,
        rotationX: 0,
        scale: 0.5,
        opacity: 0,
        duration: 0.5,
        ease: "power3.in",
        pointerEvents: "none",
        stagger: 0.05,
      });
    }
    setIsOpen(!isOpen);
  };

  const uploadOptions = [
    {
      title: "Text Post",
      icon: <Type size={42} color="#3b82f6" />,
      class: "card-text",
      desc: "Create a text announcement",
    },
    {
      title: "Poll",
      icon: <BarChart2 size={42} color="#10b981" />,
      class: "card-poll",
      desc: "Create a voting poll",
    },
    {
      title: "Image",
      icon: <ImageIcon size={42} color="#ec4899" />,
      class: "card-image",
      desc: "Upload an image",
    },
    {
      title: "Video",
      icon: <Video size={42} color="#f59e0b" />,
      class: "card-video",
      desc: "Upload a video",
    },
    {
      title: "Assignment",
      icon: <BookOpen size={42} color="#8b5cf6" />,
      class: "card-assignment",
      desc: "Upload a PDF assignment",
    },
  ];

  return (
    <div className="upload-container" ref={containerRef}>
      {/* Floating 3D Cards (Rendered first so they sit behind by default) */}
      {uploadOptions.map((opt, i) => (
        <div
          key={opt.title}
          className={`upload-card ${opt.class}`}
          ref={(el) => (cardsRef.current[i] = el)}
          onClick={() => setActiveFormType(opt.title)}
        >
          {opt.icon}
          <h3>{opt.title}</h3>
          <p
            style={{
              fontSize: "0.85rem",
              color: "#a1a1aa",
              textAlign: "center",
              margin: 0,
            }}
          >
            {opt.desc}
          </p>
        </div>
      ))}

      <div
        className={`upload-trigger-box ${isOpen ? "open" : ""}`}
        onClick={toggleCards}
        ref={triggerRef}
      >
        <div className="trigger-icon-wrapper">
          {isOpen ? (
            <X size={48} color="#ef4444" />
          ) : (
            <Plus size={48} color="#fff" />
          )}
        </div>
        <h2>{isOpen ? "Close Menu" : "Create New"}</h2>
        <p className="trigger-subtitle">
          {isOpen ? "Click anywhere to collapse" : "Select an upload type"}
        </p>
      </div>

      {activeFormType && (
        <CreatePostModal
          type={activeFormType}
          onClose={() => setActiveFormType(null)}
        />
      )}
    </div>
  );
};

export default UploadForm;
