import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import Swal from "sweetalert2";
import spinSound from './spin.mp3'; 
import Confetti from 'react-confetti';

const App = () => {
  const colors = ["#FF5733", "#33FF57", "#3357FF", "#F0CF50", "#EE4040", "#34A24F"];
  const segments = Array.from({ length: 12 }, (_, index) => ({
    number: index + 1,
    color: colors[index % colors.length],
  }));

  const [spinAngle, setSpinAngle] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [isSpinning, setIsSpinning] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const audioRef = useRef(new Audio(spinSound));

  useEffect(() => {
    const bulbContainer = document.querySelector('.bulb-container');
    bulbContainer.innerHTML = ''; 

    segments.forEach((_, index) => {
      const angle = index * 30 + 15; 
      const bulb = document.createElement('div');
      bulb.className = 'bulb';
      const radius = 150; 
      const x = Math.cos((angle - 90) * (Math.PI / 180)) * radius;
      const y = Math.sin((angle - 90) * (Math.PI / 180)) * radius;
      bulb.style.transform = `translate(${x + 150}px, ${y + 150}px)`; 
      bulb.style.backgroundColor = colors[index % colors.length];
      bulbContainer.appendChild(bulb);
    });

    return () => {
      if (bulbContainer) {
        bulbContainer.innerHTML = '';
      }
    };
  }, [segments]);

  const handleSpin = () => {
    const targetNumber = parseInt(inputValue, 10);
  
    if (isNaN(targetNumber) || targetNumber < 1 || targetNumber > 12) {
      Swal.fire("Invalid input!", "Please enter a number between 1 and 12.", "error");
      return;
    }
  
    
    const winningSegment = segments.find(segment => segment.number === targetNumber);
    const winningColor = winningSegment ? winningSegment.color : '#000'; 
  
    const segmentAngle = 360 / 12;
    const currentRotation = spinAngle % 360;
    const targetAngle = (12 - targetNumber) * segmentAngle + segmentAngle / 2;
  
    const randomFullRotations = Math.floor(Math.random() * 4) + 3;
    const totalSpin = randomFullRotations * 360 + (targetAngle - currentRotation);
  
    setIsSpinning(true);
    setSpinAngle((prevAngle) => prevAngle + totalSpin);
  
    
    const audio = audioRef.current;
    audio.currentTime = 0; 
    audio.play();
  
    
    const bulbs = document.querySelectorAll('.bulb');
    bulbs.forEach((bulb) => {
      bulb.classList.add('blinking');
    });
  
    setTimeout(() => {
      bulbs.forEach((bulb) => {
        bulb.classList.remove('blinking');
      });
      setIsSpinning(false);
  
      // Pause audio
      audio.pause();
      audio.currentTime = 0;

      setShowConfetti(true);
  
      Swal.fire({
        html: `Great pick! The wheel has settled on number <span class="winning-number">${targetNumber}</span>. Congratulations!`,
        didOpen: () => {
          const winningNumberElement = document.querySelector('.winning-number');
          if (winningNumberElement) {
            winningNumberElement.style.color = winningColor; 
            winningNumberElement.style.fontWeight = 'bold'; 
            winningNumberElement.style.fontSize = '1.5em';
          }
        },
        willClose: () => {
          setShowConfetti(false); 
        }
      });
    }, 2800);
  };
  
  

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  return (
    <div className="app-container">
      <div className="wheel-container">
        <svg
          className={`wheel ${isSpinning ? 'spinning' : ''}`}
          viewBox="0 0 200 200"
          style={{ transform: `rotate(${spinAngle}deg)` }}
        >
          {segments.map((segment, index) => (
            <g key={index}>
              <path
                d={describeArc(100, 100, 90, index * 30, (index + 1) * 30)}
                fill={segment.color}
                stroke="#fff"
                strokeWidth="1"
              />
              <text
                x="50%" y="50%"
                transform={`rotate(${index * 30 + 15} 100 100) translate(0, -65)`}
                textAnchor="middle"
                fill="#fff"
                fontSize="14px"
                fontWeight="bold"
              >
                {segment.number}
              </text>
            </g>
          ))}
        </svg>
        <div className="pointer"></div>
        <div className="bulb-container"></div>
      </div>

      <input
        type="number"
        min="1"
        max="12"
        placeholder="Enter a number (1-12)"
        className="number-input"
        value={inputValue}
        onChange={handleInputChange}
      />

      <button className="spin-button" onClick={handleSpin} disabled={isSpinning}>
        Spin
      </button>

      {showConfetti && <Confetti />}
    </div>
  );
};


function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function describeArc(x, y, radius, startAngle, endAngle) {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  const d = [
    "M", start.x, start.y,
    "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
    "L", x, y,
    "Z"
  ].join(" ");
  return d;
}

export default App;
