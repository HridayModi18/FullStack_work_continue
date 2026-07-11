import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import labubuImg from "../assets/labubu.png";
import "./DoubtPromptWidget.css";
import { HelpCircle } from "lucide-react";

const DoubtPromptWidget = () => {
  const [isPeeling, setIsPeeling] = useState(false);
  const navigate = useNavigate();

  const handleAsk = () => {
    setIsPeeling(true);

    setTimeout(() => {
      navigate("/doubts");
    }, 2000);
  };

  return (
    <>
      <motion.div
        className="doubt-widget-container"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1, type: "spring", stiffness: 100, damping: 15 }}
      >
        <img src={labubuImg} alt="Labubu Mascot" className="labubu-mascot" />

        <div className="doubt-prompt-box">
          <p className="doubt-prompt-text">
            Have doubts? Ask our expert admins
          </p>
          <button className="doubt-ask-btn" onClick={handleAsk}>
            Ask Now
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {isPeeling && (
          <motion.div
            className="peel-overlay"
            initial={{ clipPath: "circle(0% at 5% 95%)" }}
            animate={{ clipPath: "circle(150% at 5% 95%)" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: [0.64, 0, 0.1, 1] }}
          >
            <motion.div
              className="peel-content"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <HelpCircle size={64} color="white" />
              <h2>Taking you to the experts...</h2>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DoubtPromptWidget;
