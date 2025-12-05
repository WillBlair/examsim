export function GridBackground({ maskType = "fade" }: { maskType?: "fade" | "full" }) {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none bg-white">
      <svg
        className="w-full h-full"
        viewBox="0 0 1440 1000"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <pattern id="smallGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
          </pattern>
          <pattern id="grid" width="400" height="400" patternUnits="userSpaceOnUse">
            <rect width="400" height="400" fill="url(#smallGrid)" />
            <path d="M 400 0 L 0 0 0 400" fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth="1" />
          </pattern>
          
          {/* Default Fade Mask (Hero) - Clear center */}
          <linearGradient id="fadeMask" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(255,255,255,1)" />
            <stop offset="15%" stopColor="rgba(255,255,255,0.4)" />
            <stop offset="35%" stopColor="rgba(255,255,255,0.02)" />
            <stop offset="65%" stopColor="rgba(255,255,255,0.02)" />
            <stop offset="85%" stopColor="rgba(255,255,255,0.4)" />
            <stop offset="100%" stopColor="rgba(255,255,255,1)" />
          </linearGradient>

          {/* Full Grid Mask (Auth) - Consistent visibility across screen */}
          <linearGradient id="fullMask" x1="0" y1="0" x2="1" y2="0">
             {/* Slightly fade edges but keep center strong for background effect */}
            <stop offset="0%" stopColor="rgba(255,255,255,0.8)" /> 
            <stop offset="50%" stopColor="rgba(255,255,255,0.8)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.8)" />
          </linearGradient>
          
          <mask id="gridMask">
            <rect width="100%" height="100%" fill={maskType === "full" ? "url(#fullMask)" : "url(#fadeMask)"} />
          </mask>
        </defs>
        
        <rect width="100%" height="100%" fill="url(#grid)" mask="url(#gridMask)" />
      </svg>
      
      {/* Subtle Glows - Only show on hero (fade mask) to avoid dirty look on auth pages */}
      {maskType === "fade" && (
        <>
          <div className="absolute top-[60%] right-[10%] w-[400px] h-[400px] bg-blue-500/5 blur-[100px] rounded-full" />
          <div className="absolute bottom-[10%] left-[10%] w-[600px] h-[600px] bg-orange-500/5 blur-[100px] rounded-full" />
        </>
      )}
    </div>
  );
}
