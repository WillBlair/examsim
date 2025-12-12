interface BadgeIconProps {
  tier: "bronze" | "silver" | "gold" | "diamond";
  category: "creation" | "completion" | "mastery" | "streak" | "dedication";
  unlocked: boolean;
}

export function BadgeIcon({ tier, category, unlocked }: BadgeIconProps) {
  const tierColors = {
    bronze: {
      primary: "#CD7F32",
      secondary: "#8B4513",
      tertiary: "#DEB887",
      highlight: "#FFE5B4",
      glow: "#D4A574",
      shadow: "#6B4423"
    },
    silver: {
      primary: "#E8E8E8",
      secondary: "#B0B0B0",
      tertiary: "#F5F5F5",
      highlight: "#FFFFFF",
      glow: "#D3D3D3",
      shadow: "#808080"
    },
    gold: {
      primary: "#FFD700",
      secondary: "#FFA500",
      tertiary: "#FFEC8B",
      highlight: "#FFFACD",
      glow: "#FFE55C",
      shadow: "#DAA520"
    },
    diamond: {
      primary: "#3B82F6",
      secondary: "#A855F7",
      tertiary: "#60A5FA",
      highlight: "#DBEAFE",
      glow: "#93C5FD",
      shadow: "#1E40AF"
    }
  };

  const colors = tierColors[tier];
  
  const getCategoryBadge = () => {
    switch(category) {
      case "creation":
        return (
          <svg viewBox="0 0 160 160" className="w-full h-full">
            <defs>
              <radialGradient id={`glow-${tier}-creation-outer`}>
                <stop offset="0%" style={{ stopColor: colors.glow, stopOpacity: 0.6 }} />
                <stop offset="100%" style={{ stopColor: colors.glow, stopOpacity: 0 }} />
              </radialGradient>
              <linearGradient id={`grad-${tier}-creation`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: colors.highlight, stopOpacity: 1 }} />
                <stop offset="35%" style={{ stopColor: colors.tertiary, stopOpacity: 1 }} />
                <stop offset="70%" style={{ stopColor: colors.primary, stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: colors.secondary, stopOpacity: 1 }} />
              </linearGradient>
              <linearGradient id={`grad-${tier}-creation-ring`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: colors.tertiary, stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: colors.primary, stopOpacity: 1 }} />
              </linearGradient>
              <filter id={`blur-${tier}-creation`} x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur stdDeviation="8" result="blur"/>
                <feFlood floodColor={colors.glow} floodOpacity="0.8"/>
                <feComposite in2="blur" operator="in"/>
                <feMerge>
                  <feMergeNode/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            {/* Outer Glow Rings - Multiple Layers */}
            <circle cx="80" cy="80" r="78" fill={`url(#glow-${tier}-creation-outer)`} opacity="0.8"/>
            <circle cx="80" cy="80" r="72" fill={`url(#glow-${tier}-creation-outer)`} opacity="0.6"/>
            <circle cx="80" cy="80" r="68" fill="none" stroke={colors.glow} strokeWidth="1" opacity="0.4" strokeDasharray="3 3"/>
            
            {/* Rotating Ring Pattern */}
            <circle cx="80" cy="80" r="64" fill="none" stroke={colors.tertiary} strokeWidth="0.5" opacity="0.3" strokeDasharray="8 4"/>
            <circle cx="80" cy="80" r="61" fill="none" stroke={colors.primary} strokeWidth="0.5" opacity="0.2" strokeDasharray="4 8"/>
            
            {/* Main Octagon with Depth */}
            <path 
              d="M48 18 L112 18 L134 40 L134 104 L112 126 L48 126 L26 104 L26 40 Z" 
              fill={colors.shadow}
              opacity="0.3"
              transform="translate(2, 2)"
            />
            <path 
              d="M48 18 L112 18 L134 40 L134 104 L112 126 L48 126 L26 104 L26 40 Z" 
              fill={`url(#grad-${tier}-creation)`}
              stroke={colors.shadow}
              strokeWidth="5"
              filter={`url(#blur-${tier}-creation)`}
            />
            
            {/* Inner Geometric Pattern */}
            <path 
              d="M54 28 L106 28 L124 46 L124 98 L106 116 L54 116 L36 98 L36 46 Z" 
              fill="none"
              stroke={colors.highlight}
              strokeWidth="2.5"
              opacity="0.5"
            />
            <path 
              d="M60 38 L100 38 L114 52 L114 92 L100 106 L60 106 L46 92 L46 52 Z" 
              fill="none"
              stroke={colors.tertiary}
              strokeWidth="2"
              opacity="0.4"
            />
            
            {/* Ornamental Corners with Gems */}
            {[
              [48, 18], [112, 18], [134, 40], [134, 104], 
              [112, 126], [48, 126], [26, 104], [26, 40]
            ].map(([x, y], i) => (
              <g key={i}>
                <circle cx={x} cy={y} r="5" fill={colors.glow} opacity="0.4"/>
                <circle cx={x} cy={y} r="4" fill={colors.highlight} stroke={colors.secondary} strokeWidth="1.5"/>
                <circle cx={x} cy={y} r="2" fill="white" opacity="0.8"/>
              </g>
            ))}
            
            {/* Radial Spoke Pattern */}
            {Array.from({length: 8}).map((_, i) => {
              const angle = (i * 45) * Math.PI / 180;
              const x1 = 80 + Math.cos(angle) * 40;
              const y1 = 80 + Math.sin(angle) * 40;
              const x2 = 80 + Math.cos(angle) * 48;
              const y2 = 80 + Math.sin(angle) * 48;
              return (
                <line 
                  key={i}
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke={colors.secondary}
                  strokeWidth="2.5"
                  opacity="0.2"
                  strokeLinecap="round"
                />
              );
            })}
            
            {/* Center Medallion with Multiple Rings */}
            <circle cx="80" cy="80" r="42" fill={`url(#grad-${tier}-creation-ring)`} stroke={colors.shadow} strokeWidth="3.5"/>
            <circle cx="80" cy="80" r="38" fill="none" stroke={colors.highlight} strokeWidth="2" opacity="0.6"/>
            <circle cx="80" cy="80" r="34" fill="none" stroke={colors.tertiary} strokeWidth="1.5" opacity="0.4" strokeDasharray="4 2"/>
            <circle cx="80" cy="80" r="30" fill="none" stroke={colors.primary} strokeWidth="1" opacity="0.3" strokeDasharray="2 2"/>
            
            {/* Scroll Icon - Ultra Detailed */}
            <rect x="62" y="62" width="36" height="36" rx="4" fill="white" opacity="0.98" stroke={colors.shadow} strokeWidth="3"/>
            <rect x="64" y="64" width="32" height="32" rx="2" fill="none" stroke={colors.tertiary} strokeWidth="1" opacity="0.3"/>
            
            <line x1="69" y1="71" x2="91" y2="71" stroke={colors.secondary} strokeWidth="3" strokeLinecap="round"/>
            <line x1="69" y1="80" x2="91" y2="80" stroke={colors.secondary} strokeWidth="3" strokeLinecap="round"/>
            <line x1="69" y1="89" x2="82" y2="89" stroke={colors.secondary} strokeWidth="3" strokeLinecap="round"/>
            
            <circle cx="71" cy="71" r="1.5" fill={colors.primary}/>
            <circle cx="71" cy="80" r="1.5" fill={colors.primary}/>
            <circle cx="71" cy="89" r="1.5" fill={colors.primary}/>
            
            {/* Top Shine - Dramatic */}
            <ellipse cx="80" cy="32" rx="32" ry="16" fill="white" opacity="0.5"/>
            <ellipse cx="70" cy="28" rx="18" ry="10" fill="white" opacity="0.7"/>
            
            {/* Sparkle Effects */}
            {[[105, 50], [55, 110], [95, 95], [65, 65]].map(([x, y], i) => (
              <g key={`sparkle-${i}`}>
                <circle cx={x} cy={y} r="2.5" fill="white" opacity="0.9"/>
                <circle cx={x} cy={y} r="1" fill={colors.highlight}/>
              </g>
            ))}
          </svg>
        );
      
      case "completion":
        return (
          <svg viewBox="0 0 160 160" className="w-full h-full">
            <defs>
              <radialGradient id={`glow-${tier}-completion-outer`}>
                <stop offset="0%" style={{ stopColor: colors.glow, stopOpacity: 0.7 }} />
                <stop offset="100%" style={{ stopColor: colors.glow, stopOpacity: 0 }} />
              </radialGradient>
              <linearGradient id={`grad-${tier}-completion`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: colors.highlight, stopOpacity: 1 }} />
                <stop offset="40%" style={{ stopColor: colors.tertiary, stopOpacity: 1 }} />
                <stop offset="75%" style={{ stopColor: colors.primary, stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: colors.secondary, stopOpacity: 1 }} />
              </linearGradient>
              <radialGradient id={`grad-${tier}-completion-center`}>
                <stop offset="0%" style={{ stopColor: colors.highlight, stopOpacity: 1 }} />
                <stop offset="70%" style={{ stopColor: colors.tertiary, stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: colors.primary, stopOpacity: 1 }} />
              </radialGradient>
              <filter id={`blur-${tier}-completion`} x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur stdDeviation="10" result="blur"/>
                <feFlood floodColor={colors.glow} floodOpacity="0.9"/>
                <feComposite in2="blur" operator="in"/>
                <feMerge>
                  <feMergeNode/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            {/* Intense Outer Glow */}
            <ellipse cx="80" cy="85" rx="75" ry="80" fill={`url(#glow-${tier}-completion-outer)`} opacity="0.9"/>
            <ellipse cx="80" cy="85" rx="68" ry="72" fill={`url(#glow-${tier}-completion-outer)`} opacity="0.7"/>
            
            {/* Decorative Ring Pattern */}
            <circle cx="80" cy="80" r="70" fill="none" stroke={colors.glow} strokeWidth="1" opacity="0.3" strokeDasharray="6 3"/>
            <circle cx="80" cy="80" r="66" fill="none" stroke={colors.tertiary} strokeWidth="0.5" opacity="0.2" strokeDasharray="3 6"/>
            
            {/* Main Shield with Shadow */}
            <path 
              d="M80 12 L128 32 L128 75 Q128 105 80 130 Q32 105 32 75 L32 32 Z" 
              fill={colors.shadow}
              opacity="0.3"
              transform="translate(2, 2)"
            />
            <path 
              d="M80 12 L128 32 L128 75 Q128 105 80 130 Q32 105 32 75 L32 32 Z" 
              fill={`url(#grad-${tier}-completion)`}
              stroke={colors.shadow}
              strokeWidth="5"
              filter={`url(#blur-${tier}-completion)`}
            />
            
            {/* Inner Shield Layers */}
            <path 
              d="M80 24 L116 40 L116 75 Q116 98 80 118 Q44 98 44 75 L44 40 Z" 
              fill="none"
              stroke={colors.highlight}
              strokeWidth="2.5"
              opacity="0.6"
            />
            <path 
              d="M80 32 L108 45 L108 75 Q108 92 80 108 Q52 92 52 75 L52 45 Z" 
              fill="none"
              stroke={colors.tertiary}
              strokeWidth="2"
              opacity="0.4"
            />
            
            {/* Cross Pattern Engraving */}
            <line x1="80" y1="32" x2="80" y2="115" stroke={colors.secondary} strokeWidth="2.5" opacity="0.15"/>
            <line x1="44" y1="65" x2="116" y2="65" stroke={colors.secondary} strokeWidth="2.5" opacity="0.15"/>
            
            {/* Decorative Rivets - Enhanced */}
            {[
              [80, 32], [100, 42], [116, 60], [110, 82], 
              [90, 100], [70, 100], [50, 82], [44, 60], [60, 42]
            ].map(([x, y], i) => (
              <g key={i}>
                <circle cx={x} cy={y} r="5" fill={colors.glow} opacity="0.5"/>
                <circle cx={x} cy={y} r="4" fill={colors.highlight} stroke={colors.shadow} strokeWidth="1.5"/>
                <circle cx={x} cy={y} r="2" fill={colors.primary} opacity="0.8"/>
                <circle cx={x} cy={y} r="1" fill="white" opacity="0.9"/>
              </g>
            ))}
            
            {/* Center Emblem */}
            <circle cx="80" cy="72" r="34" fill={`url(#grad-${tier}-completion-center)`} stroke={colors.shadow} strokeWidth="3.5"/>
            <circle cx="80" cy="72" r="30" fill="none" stroke={colors.highlight} strokeWidth="2" opacity="0.5"/>
            <circle cx="80" cy="72" r="26" fill="none" stroke="white" strokeWidth="1.5" opacity="0.3" strokeDasharray="2 2"/>
            
            {/* Checkmark - Triple Layer for Depth */}
            <path 
              d="M60 72 L72 86 L100 56" 
              fill="none"
              stroke={colors.shadow}
              strokeWidth="12"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.3"
              transform="translate(2, 2)"
            />
            <path 
              d="M60 72 L72 86 L100 56" 
              fill="none"
              stroke="white"
              strokeWidth="10"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path 
              d="M60 72 L72 86 L100 56" 
              fill="none"
              stroke={colors.highlight}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.5"
            />
            
            {/* Dramatic Shine */}
            <ellipse cx="70" cy="40" rx="30" ry="18" fill="white" opacity="0.45"/>
            <ellipse cx="65" cy="35" rx="20" ry="12" fill="white" opacity="0.6"/>
            
            {/* Laurel Wreath Details */}
            <path d="M42 100 Q35 108 30 118" stroke={colors.tertiary} strokeWidth="2.5" fill="none" opacity="0.5" strokeLinecap="round"/>
            <path d="M118 100 Q125 108 130 118" stroke={colors.tertiary} strokeWidth="2.5" fill="none" opacity="0.5" strokeLinecap="round"/>
            
            {/* Sparkles */}
            {[[110, 48], [50, 90], [95, 105]].map(([x, y], i) => (
              <g key={`sparkle-${i}`}>
                <circle cx={x} cy={y} r="2.5" fill="white" opacity="0.9"/>
                <circle cx={x} cy={y} r="1" fill={colors.highlight}/>
              </g>
            ))}
          </svg>
        );
      
      case "mastery":
        return (
          <svg viewBox="0 0 160 160" className="w-full h-full">
            <defs>
              <radialGradient id={`glow-${tier}-mastery-mega`}>
                <stop offset="0%" style={{ stopColor: colors.glow, stopOpacity: 0.9 }} />
                <stop offset="50%" style={{ stopColor: colors.glow, stopOpacity: 0.5 }} />
                <stop offset="100%" style={{ stopColor: colors.glow, stopOpacity: 0 }} />
              </radialGradient>
              <linearGradient id={`grad-${tier}-mastery`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: colors.highlight, stopOpacity: 1 }} />
                <stop offset="35%" style={{ stopColor: colors.tertiary, stopOpacity: 1 }} />
                <stop offset="70%" style={{ stopColor: colors.primary, stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: colors.secondary, stopOpacity: 1 }} />
              </linearGradient>
              <radialGradient id={`grad-${tier}-mastery-jewel`}>
                <stop offset="0%" style={{ stopColor: "white", stopOpacity: 1 }} />
                <stop offset="40%" style={{ stopColor: colors.highlight, stopOpacity: 1 }} />
                <stop offset="80%" style={{ stopColor: colors.primary, stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: colors.secondary, stopOpacity: 1 }} />
              </radialGradient>
              <filter id={`blur-${tier}-mastery`} x="-150%" y="-150%" width="400%" height="400%">
                <feGaussianBlur stdDeviation="12" result="blur"/>
                <feFlood floodColor={colors.glow} floodOpacity="1"/>
                <feComposite in2="blur" operator="in"/>
                <feMerge>
                  <feMergeNode/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            {/* Mega Outer Glow - Multiple Intense Layers */}
            <circle cx="80" cy="80" r="80" fill={`url(#glow-${tier}-mastery-mega)`} opacity="1"/>
            <circle cx="80" cy="80" r="75" fill={`url(#glow-${tier}-mastery-mega)`} opacity="0.8"/>
            <circle cx="80" cy="80" r="70" fill={`url(#glow-${tier}-mastery-mega)`} opacity="0.6"/>
            
            {/* Rotating Decorative Rings */}
            <circle cx="80" cy="80" r="72" fill="none" stroke={colors.glow} strokeWidth="1" opacity="0.4" strokeDasharray="5 3"/>
            <circle cx="80" cy="80" r="68" fill="none" stroke={colors.tertiary} strokeWidth="0.5" opacity="0.3" strokeDasharray="3 5"/>
            <circle cx="80" cy="80" r="64" fill="none" stroke={colors.highlight} strokeWidth="0.5" opacity="0.2" strokeDasharray="2 2"/>
            
            {/* 24-Point Star Background */}
            {Array.from({length: 24}).map((_, i) => {
              const angle = (i * 15) * Math.PI / 180;
              const r1 = i % 2 === 0 ? 60 : 45;
              const x = 80 + Math.cos(angle) * r1;
              const y = 80 + Math.sin(angle) * r1;
              return (
                <circle key={`bg-star-${i}`} cx={x} cy={y} r="2" fill={colors.primary} opacity="0.15"/>
              );
            })}
            
            {/* Main 12-Point Star */}
            {Array.from({length: 12}).map((_, i) => {
              const angle = (i * 30) * Math.PI / 180;
              const nextAngle = ((i + 1) * 30) * Math.PI / 180;
              const r1 = i % 2 === 0 ? 65 : 40;
              const r2 = (i + 1) % 2 === 0 ? 65 : 40;
              const x1 = 80 + Math.cos(angle) * r1;
              const y1 = 80 + Math.sin(angle) * r1;
              const x2 = 80 + Math.cos(nextAngle) * r2;
              const y2 = 80 + Math.sin(nextAngle) * r2;
              
              return (
                <path 
                  key={`star-${i}`}
                  d={`M 80 80 L ${x1} ${y1} L ${x2} ${y2} Z`}
                  fill={`url(#grad-${tier}-mastery)`}
                  stroke={colors.shadow}
                  strokeWidth="2.5"
                  opacity="0.95"
                  filter={`url(#blur-${tier}-mastery)`}
                />
              );
            })}
            
            {/* Inner Star Detail Layer */}
            {Array.from({length: 12}).map((_, i) => {
              const angle = (i * 30 + 15) * Math.PI / 180;
              const x1 = 80 + Math.cos(angle) * 50;
              const y1 = 80 + Math.sin(angle) * 50;
              const x2 = 80 + Math.cos(angle) * 35;
              const y2 = 80 + Math.sin(angle) * 35;
              
              return (
                <line 
                  key={`inner-spoke-${i}`}
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke={colors.highlight}
                  strokeWidth="2"
                  opacity="0.4"
                  strokeLinecap="round"
                />
              );
            })}
            
            {/* Concentric Decorative Circles */}
            <circle cx="80" cy="80" r="48" fill="none" stroke={colors.highlight} strokeWidth="2.5" opacity="0.3" strokeDasharray="4 4"/>
            <circle cx="80" cy="80" r="44" fill="none" stroke={colors.tertiary} strokeWidth="2" opacity="0.25" strokeDasharray="3 3"/>
            <circle cx="80" cy="80" r="40" fill="none" stroke={colors.primary} strokeWidth="1.5" opacity="0.2" strokeDasharray="2 2"/>
            
            {/* Center Jewel - Multi-Layered */}
            <circle cx="80" cy="80" r="28" fill={`url(#grad-${tier}-mastery-jewel)`} stroke={colors.shadow} strokeWidth="4"/>
            <circle cx="80" cy="80" r="24" fill="none" stroke="white" strokeWidth="2.5" opacity="0.5"/>
            <circle cx="80" cy="80" r="20" fill="none" stroke={colors.highlight} strokeWidth="2" opacity="0.4"/>
            <circle cx="80" cy="80" r="16" fill="white" opacity="0.4"/>
            <circle cx="80" cy="80" r="12" fill={colors.primary} opacity="0.9"/>
            <circle cx="80" cy="80" r="8" fill="white" opacity="0.8"/>
            
            {/* Gemstone Facets - Detailed Cut */}
            <path d="M80 52 L96 80 L80 108 L64 80 Z" fill="white" opacity="0.25"/>
            <path d="M52 80 L80 64 L108 80 L80 96 Z" fill="white" opacity="0.2"/>
            <path d="M68 68 L80 64 L92 68 L88 80 L80 84 L72 80 Z" fill="white" opacity="0.3"/>
            
            {/* Star Point Accents with Glow */}
            {Array.from({length: 12}).map((_, i) => {
              if (i % 2 === 0) {
                const angle = (i * 30) * Math.PI / 180;
                const x = 80 + Math.cos(angle) * 65;
                const y = 80 + Math.sin(angle) * 65;
                return (
                  <g key={`point-${i}`}>
                    <circle cx={x} cy={y} r="5" fill={colors.glow} opacity="0.6"/>
                    <circle cx={x} cy={y} r="3.5" fill="white" opacity="0.9"/>
                    <circle cx={x} cy={y} r="2" fill={colors.highlight}/>
                  </g>
                );
              }
              return null;
            })}
            
            {/* Epic Shine Effects */}
            <ellipse cx="70" cy="40" rx="28" ry="16" fill="white" opacity="0.5"/>
            <ellipse cx="65" cy="35" rx="20" ry="12" fill="white" opacity="0.7"/>
            <circle cx="85" cy="70" r="5" fill="white" opacity="0.7"/>
            
            {/* Constellation Sparkles */}
            {[[115, 45], [45, 115], [105, 115], [55, 45], [125, 80], [35, 80]].map(([x, y], i) => (
              <g key={`constellation-${i}`}>
                <circle cx={x} cy={y} r="3" fill="white" opacity="0.9"/>
                <circle cx={x} cy={y} r="1.5" fill={colors.highlight}/>
              </g>
            ))}
          </svg>
        );
      
      case "streak":
        return (
          <svg viewBox="0 0 160 160" className="w-full h-full">
            <defs>
              <radialGradient id={`glow-${tier}-streak-mega`}>
                <stop offset="0%" style={{ stopColor: colors.glow, stopOpacity: 0.9 }} />
                <stop offset="50%" style={{ stopColor: colors.glow, stopOpacity: 0.6 }} />
                <stop offset="100%" style={{ stopColor: colors.glow, stopOpacity: 0 }} />
              </radialGradient>
              <linearGradient id={`grad-${tier}-streak`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: colors.highlight, stopOpacity: 1 }} />
                <stop offset="25%" style={{ stopColor: colors.tertiary, stopOpacity: 1 }} />
                <stop offset="60%" style={{ stopColor: colors.primary, stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: colors.secondary, stopOpacity: 1 }} />
              </linearGradient>
              <linearGradient id={`grad-${tier}-streak-inner`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: colors.highlight, stopOpacity: 1 }} />
                <stop offset="50%" style={{ stopColor: colors.tertiary, stopOpacity: 0.8 }} />
                <stop offset="100%" style={{ stopColor: colors.primary, stopOpacity: 0.4 }} />
              </linearGradient>
              <radialGradient id={`grad-${tier}-streak-core`}>
                <stop offset="0%" style={{ stopColor: "white", stopOpacity: 1 }} />
                <stop offset="50%" style={{ stopColor: colors.highlight, stopOpacity: 0.8 }} />
                <stop offset="100%" style={{ stopColor: colors.tertiary, stopOpacity: 0.3 }} />
              </radialGradient>
              <filter id={`blur-${tier}-streak`} x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur stdDeviation="10" result="blur"/>
                <feFlood floodColor={colors.glow} floodOpacity="0.95"/>
                <feComposite in2="blur" operator="in"/>
                <feMerge>
                  <feMergeNode/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            {/* Mega Glow - Pulsating Effect */}
            <ellipse cx="80" cy="85" rx="70" ry="85" fill={`url(#glow-${tier}-streak-mega)`} opacity="1"/>
            <ellipse cx="80" cy="85" rx="60" ry="75" fill={`url(#glow-${tier}-streak-mega)`} opacity="0.8"/>
            <ellipse cx="80" cy="85" rx="50" ry="65" fill={`url(#glow-${tier}-streak-mega)`} opacity="0.6"/>
            
            {/* Main Flame Shape - Enhanced */}
            <path 
              d="M80 8 Q88 16 96 30 Q104 46 102 64 Q100 82 94 98 Q87 114 80 125 Q73 114 66 98 Q60 82 58 64 Q56 46 64 30 Q72 16 80 8 Z" 
              fill={colors.shadow}
              opacity="0.3"
              transform="translate(2, 2)"
            />
            <path 
              d="M80 8 Q88 16 96 30 Q104 46 102 64 Q100 82 94 98 Q87 114 80 125 Q73 114 66 98 Q60 82 58 64 Q56 46 64 30 Q72 16 80 8 Z" 
              fill={`url(#grad-${tier}-streak)`}
              stroke={colors.shadow}
              strokeWidth="4"
              filter={`url(#blur-${tier}-streak)`}
            />
            
            {/* Outer Flame Licks - Multiple */}
            {[
              "M80 15 Q85 20 88 32 Q90 44 88 58",
              "M80 15 Q75 20 72 32 Q70 44 72 58",
              "M82 18 Q86 24 88 36",
              "M78 18 Q74 24 72 36"
            ].map((d, i) => (
              <path 
                key={`lick-${i}`}
                d={d}
                fill="none"
                stroke={colors.highlight}
                strokeWidth={i < 2 ? "2.5" : "1.5"}
                opacity={i < 2 ? "0.5" : "0.3"}
                strokeLinecap="round"
              />
            ))}
            
            {/* Inner Flame Layer 1 */}
            <path 
              d="M80 22 Q85 28 88 42 Q90 56 87 72 Q83 88 80 100 Q77 88 73 72 Q70 56 72 42 Q75 28 80 22 Z" 
              fill={`url(#grad-${tier}-streak-inner)`}
            />
            
            {/* Inner Flame Layer 2 */}
            <path 
              d="M80 32 Q83 37 85 48 Q87 58 85 70 Q83 80 80 90 Q77 80 75 70 Q73 58 75 48 Q77 37 80 32 Z" 
              fill={`url(#grad-${tier}-streak-core)`}
            />
            
            {/* Core Bright Center - Multi-Layer */}
            <ellipse cx="80" cy="68" rx="12" ry="30" fill="white" opacity="0.8"/>
            <ellipse cx="80" cy="65" rx="9" ry="22" fill="white" opacity="0.95"/>
            <ellipse cx="80" cy="62" rx="6" ry="16" fill={colors.highlight} opacity="0.9"/>
            
            {/* Ember Particles - Floating */}
            {[
              [65, 40, 2.5], [85, 45, 2], [73, 35, 2], [87, 38, 1.5],
              [70, 28, 1.5], [90, 32, 1.5], [75, 48, 1.5], [85, 52, 1.5]
            ].map(([x, y, r], i) => (
              <g key={`ember-${i}`}>
                <circle cx={x} cy={y} r={Number(r) + 1} fill={colors.glow} opacity="0.6"/>
                <circle cx={x} cy={y} r={r} fill={colors.highlight} opacity="0.9"/>
                <circle cx={x} cy={y} r={Number(r) * 0.5} fill="white" opacity="0.9"/>
              </g>
            ))}
            
            {/* Flame Tips - Dancing */}
            <path 
              d="M68 16 Q71 10 73 12 Q75 10 76 13 Q78 10 80 14 Q82 10 84 13 Q86 10 87 12 Q89 10 92 16" 
              fill={colors.highlight}
              opacity="0.7"
            />
            <path 
              d="M70 20 Q73 15 75 17 Q77 15 79 18 Q81 15 83 17 Q85 15 87 20" 
              fill="white"
              opacity="0.9"
            />
            
            {/* Heat Distortion Lines */}
            {Array.from({length: 6}).map((_, i) => {
              const y = 100 + i * 3;
              return (
                <ellipse 
                  key={`heat-${i}`}
                  cx="80" 
                  cy={y} 
                  rx={20 - i * 2} 
                  ry="1.5" 
                  fill={colors.secondary} 
                  opacity={0.15 - i * 0.02}
                />
              );
            })}
            
            {/* Energy Wisps - Dramatic */}
            <path d="M50 72 Q44 67 38 60 Q35 55 32 48" stroke={colors.tertiary} strokeWidth="2.5" fill="none" opacity="0.4" strokeLinecap="round"/>
            <path d="M110 72 Q116 67 122 60 Q125 55 128 48" stroke={colors.tertiary} strokeWidth="2.5" fill="none" opacity="0.4" strokeLinecap="round"/>
            <path d="M55 85 Q48 82 42 78" stroke={colors.primary} strokeWidth="2" fill="none" opacity="0.3" strokeLinecap="round"/>
            <path d="M105 85 Q112 82 118 78" stroke={colors.primary} strokeWidth="2" fill="none" opacity="0.3" strokeLinecap="round"/>
            
            {/* Sparkle Trail */}
            {[[60, 55], [100, 60], [70, 68], [90, 75]].map(([x, y], i) => (
              <g key={`sparkle-${i}`}>
                <circle cx={x} cy={y} r="2.5" fill="white" opacity="0.95"/>
                <circle cx={x} cy={y} r="1" fill={colors.highlight}/>
              </g>
            ))}
          </svg>
        );
      
      case "dedication":
        return (
          <svg viewBox="0 0 160 160" className="w-full h-full">
            <defs>
              <radialGradient id={`glow-${tier}-dedication-outer`}>
                <stop offset="0%" style={{ stopColor: colors.glow, stopOpacity: 0.8 }} />
                <stop offset="100%" style={{ stopColor: colors.glow, stopOpacity: 0 }} />
              </radialGradient>
              <linearGradient id={`grad-${tier}-dedication`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: colors.highlight, stopOpacity: 1 }} />
                <stop offset="40%" style={{ stopColor: colors.tertiary, stopOpacity: 1 }} />
                <stop offset="75%" style={{ stopColor: colors.primary, stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: colors.secondary, stopOpacity: 1 }} />
              </linearGradient>
              <linearGradient id={`grad-${tier}-dedication-bolt`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: "white", stopOpacity: 1 }} />
                <stop offset="50%" style={{ stopColor: colors.highlight, stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: colors.tertiary, stopOpacity: 1 }} />
              </linearGradient>
              <filter id={`blur-${tier}-dedication`} x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur stdDeviation="9" result="blur"/>
                <feFlood floodColor={colors.glow} floodOpacity="0.9"/>
                <feComposite in2="blur" operator="in"/>
                <feMerge>
                  <feMergeNode/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            {/* Intense Outer Glow */}
            <circle cx="80" cy="80" r="78" fill={`url(#glow-${tier}-dedication-outer)`} opacity="0.9"/>
            <circle cx="80" cy="80" r="72" fill={`url(#glow-${tier}-dedication-outer)`} opacity="0.7"/>
            <circle cx="80" cy="80" r="68" fill="none" stroke={colors.glow} strokeWidth="1" opacity="0.4" strokeDasharray="5 3"/>
            
            {/* Outer Hexagon Ring System */}
            <path d="M80 10 L112 30 L112 100 L80 120 L48 100 L48 30 Z" fill="none" stroke={colors.tertiary} strokeWidth="1" opacity="0.3" strokeDasharray="6 4"/>
            <path d="M80 12 L110 31 L110 99 L80 118 L50 99 L50 31 Z" fill="none" stroke={colors.primary} strokeWidth="0.5" opacity="0.2" strokeDasharray="4 6"/>
            
            {/* Main Hexagon with Depth */}
            <path 
              d="M80 18 L108 38 L108 92 L80 112 L52 92 L52 38 Z" 
              fill={colors.shadow}
              opacity="0.3"
              transform="translate(2, 2)"
            />
            <path 
              d="M80 18 L108 38 L108 92 L80 112 L52 92 L52 38 Z" 
              fill={`url(#grad-${tier}-dedication)`}
              stroke={colors.shadow}
              strokeWidth="5"
              filter={`url(#blur-${tier}-dedication)`}
            />
            
            {/* Multi-Layer Inner Hexagons */}
            <path d="M80 28 L98 42 L98 88 L80 102 L62 88 L62 42 Z" fill="none" stroke={colors.highlight} strokeWidth="2.5" opacity="0.5"/>
            <path d="M80 36 L92 47 L92 83 L80 94 L68 83 L68 47 Z" fill="none" stroke={colors.tertiary} strokeWidth="2" opacity="0.4"/>
            <path d="M80 42 L88 50 L88 80 L80 88 L72 80 L72 50 Z" fill={colors.tertiary} stroke={colors.primary} strokeWidth="2" opacity="0.3"/>
            
            {/* Geometric Web Pattern */}
            {[
              [[80, 18], [80, 42]],
              [[108, 38], [88, 50]],
              [[108, 92], [88, 80]],
              [[80, 112], [80, 88]],
              [[52, 92], [72, 80]],
              [[52, 38], [72, 50]]
            ].map(([[x1, y1], [x2, y2]], i) => (
              <line 
                key={`web-${i}`}
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={colors.highlight}
                strokeWidth="2.5"
                opacity="0.25"
              />
            ))}
            
            {/* Corner Nodes - Enhanced */}
            {[
              [80, 42], [88, 50], [88, 80], 
              [80, 88], [72, 80], [72, 50]
            ].map(([x, y], i) => (
              <g key={`node-${i}`}>
                <circle cx={x} cy={y} r="6" fill={colors.glow} opacity="0.6"/>
                <circle cx={x} cy={y} r="5" fill={colors.highlight} stroke={colors.shadow} strokeWidth="2"/>
                <circle cx={x} cy={y} r="2.5" fill={colors.primary} opacity="0.9"/>
                <circle cx={x} cy={y} r="1.5" fill="white" opacity="0.9"/>
              </g>
            ))}
            
            {/* Lightning Bolt - Ultra Detailed */}
            {/* Shadow layer */}
            <path 
              d="M85 42 L64 68 L74 68 L68 96 L89 70 L79 70 L85 42 Z" 
              fill={colors.shadow}
              opacity="0.3"
              transform="translate(2, 2)"
            />
            {/* Main bolt */}
            <path 
              d="M85 42 L64 68 L74 68 L68 96 L89 70 L79 70 L85 42 Z" 
              fill={`url(#grad-${tier}-dedication-bolt)`}
              stroke={colors.shadow}
              strokeWidth="3.5"
            />
            {/* Inner glow */}
            <path 
              d="M85 42 L64 68 L74 68 L68 96 L89 70 L79 70 L85 42 Z" 
              fill="white"
              opacity="0.5"
            />
            {/* Center line */}
            <path 
              d="M82 42 L70 68 L76 68 L72 96" 
              stroke="white"
              strokeWidth="2"
              opacity="0.7"
              strokeLinecap="round"
            />
            
            {/* Energy Crackle Around Bolt */}
            {[
              [[68, 55], [64, 60]],
              [[86, 77], [90, 82]],
              [[72, 62], [68, 66]],
              [[84, 72], [88, 76]]
            ].map(([[x1, y1], [x2, y2]], i) => (
              <line 
                key={`crackle-${i}`}
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="white"
                strokeWidth="2.5"
                opacity="0.7"
                strokeLinecap="round"
              />
            ))}
            
            {/* Electricity Arcs */}
            <path d="M68 50 Q62 48 58 46" stroke={colors.highlight} strokeWidth="1.5" fill="none" opacity="0.5" strokeLinecap="round"/>
            <path d="M92 82 Q96 84 100 86" stroke={colors.highlight} strokeWidth="1.5" fill="none" opacity="0.5" strokeLinecap="round"/>
            
            {/* Epic Shine */}
            <ellipse cx="70" cy="45" rx="26" ry="15" fill="white" opacity="0.4"/>
            <ellipse cx="65" cy="40" rx="18" ry="10" fill="white" opacity="0.6"/>
            
            {/* Corner Sparkles */}
            {[[105, 42], [55, 90], [100, 88], [60, 42]].map(([x, y], i) => (
              <g key={`sparkle-${i}`}>
                <circle cx={x} cy={y} r="2.5" fill="white" opacity="0.95"/>
                <circle cx={x} cy={y} r="1" fill={colors.highlight}/>
              </g>
            ))}
          </svg>
        );
    }
  };

  return (
    <div className="relative w-24 h-24">
      {unlocked ? (
        getCategoryBadge()
      ) : (
        <div className="w-full h-full opacity-25 grayscale blur-[1px]">
          {getCategoryBadge()}
        </div>
      )}
    </div>
  );
}
