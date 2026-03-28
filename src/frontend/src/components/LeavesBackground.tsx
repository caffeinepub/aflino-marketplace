const LEAVES = [
  {
    id: "l1",
    left: "5%",
    delay: "0s",
    duration: "14s",
    size: 22,
    color: "#2d6a4f",
    opacity: 0.28,
    rotate: 15,
  },
  {
    id: "l2",
    left: "12%",
    delay: "-3s",
    duration: "11s",
    size: 18,
    color: "#52b788",
    opacity: 0.25,
    rotate: -20,
  },
  {
    id: "l3",
    left: "20%",
    delay: "-7s",
    duration: "16s",
    size: 26,
    color: "#40916c",
    opacity: 0.3,
    rotate: 30,
  },
  {
    id: "l4",
    left: "30%",
    delay: "-1s",
    duration: "13s",
    size: 20,
    color: "#74c69d",
    opacity: 0.22,
    rotate: -10,
  },
  {
    id: "l5",
    left: "40%",
    delay: "-9s",
    duration: "18s",
    size: 24,
    color: "#2d6a4f",
    opacity: 0.27,
    rotate: 45,
  },
  {
    id: "l6",
    left: "50%",
    delay: "-5s",
    duration: "12s",
    size: 19,
    color: "#52b788",
    opacity: 0.25,
    rotate: -35,
  },
  {
    id: "l7",
    left: "58%",
    delay: "-12s",
    duration: "15s",
    size: 28,
    color: "#40916c",
    opacity: 0.3,
    rotate: 20,
  },
  {
    id: "l8",
    left: "65%",
    delay: "-2s",
    duration: "10s",
    size: 21,
    color: "#95d5b2",
    opacity: 0.23,
    rotate: -15,
  },
  {
    id: "l9",
    left: "72%",
    delay: "-8s",
    duration: "17s",
    size: 23,
    color: "#2d6a4f",
    opacity: 0.28,
    rotate: 50,
  },
  {
    id: "l10",
    left: "80%",
    delay: "-4s",
    duration: "9s",
    size: 20,
    color: "#74c69d",
    opacity: 0.26,
    rotate: -25,
  },
  {
    id: "l11",
    left: "88%",
    delay: "-11s",
    duration: "14s",
    size: 25,
    color: "#52b788",
    opacity: 0.24,
    rotate: 10,
  },
  {
    id: "l12",
    left: "95%",
    delay: "-6s",
    duration: "16s",
    size: 18,
    color: "#40916c",
    opacity: 0.27,
    rotate: -40,
  },
];

export default function LeavesBackground() {
  return (
    <>
      <style>{`
        @keyframes leafFall {
          0% {
            transform: translateY(-10%) translateX(0px) rotate(0deg);
            opacity: 0;
          }
          5% { opacity: 1; }
          45% { transform: translateY(45vh) translateX(25px) rotate(360deg); }
          55% { transform: translateY(55vh) translateX(-20px) rotate(400deg); }
          95% { opacity: 0.8; }
          100% {
            transform: translateY(110vh) translateX(10px) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          overflow: "hidden",
        }}
        aria-hidden="true"
      >
        {LEAVES.map((leaf) => (
          <div
            key={leaf.id}
            style={{
              position: "absolute",
              top: 0,
              left: leaf.left,
              width: leaf.size,
              height: leaf.size * 1.4,
              backgroundColor: leaf.color,
              opacity: leaf.opacity,
              borderRadius: "50% 0% 50% 0%",
              transform: `rotate(${leaf.rotate}deg)`,
              animation: `leafFall ${leaf.duration} linear ${leaf.delay} infinite`,
              willChange: "transform, opacity",
            }}
          />
        ))}
      </div>
    </>
  );
}
