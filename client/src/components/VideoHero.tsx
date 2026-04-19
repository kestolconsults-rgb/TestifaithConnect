interface VideoHeroProps {
  videoSrc: string;
  headline?: string;
  subheadline?: string;
  scripture?: string;
  scriptureReference?: string;
  height?: string;
}

export default function VideoHero({
  videoSrc,
  headline = "TestiFaith exists as a memorial to preserve God's faithfulness across every life through real stories and lived testimonies, so that in seasons of doubt, fear, or waiting, hearts are reminded of who He is, what He has done, and are strengthened to trust Him again.",
  subheadline = "",
  scripture = "And they overcame him by the blood of the Lamb, and by the word of their testimony.",
  scriptureReference = "Revelation 12:11",
  height = "500px"
}: VideoHeroProps) {
  return (
    <div className="relative w-full overflow-hidden" style={{ height }}>
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        data-testid="hero-video"
      >
        <source src={videoSrc} type="video/mp4" />
      </video>

      {/* Dark Overlay for Text Readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/70 to-black/80" />

      {/* Text Overlay */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 md:px-6">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Main Message */}
          <p 
            className="text-lg md:text-2xl lg:text-3xl text-white leading-relaxed font-medium" 
            style={{ 
              fontFamily: 'League Spartan, sans-serif',
              textShadow: '0 2px 8px rgba(0, 0, 0, 0.8), 0 4px 16px rgba(0, 0, 0, 0.5)'
            }}
            data-testid="hero-headline"
          >
            {headline}
          </p>
          {subheadline && (
            <p 
              className="text-lg md:text-2xl lg:text-3xl text-white leading-relaxed font-medium" 
              style={{ 
                fontFamily: 'League Spartan, sans-serif',
                textShadow: '0 2px 8px rgba(0, 0, 0, 0.8)' 
              }}
              data-testid="hero-subheadline"
            >
              {subheadline}
            </p>
          )}

          {/* Scripture Verse */}
          <div className="pt-8 space-y-3">
            <p 
              className="text-lg md:text-xl lg:text-2xl text-white/95 italic leading-relaxed" 
              style={{ 
                fontFamily: 'Crimson Pro, serif',
                textShadow: '0 2px 8px rgba(0, 0, 0, 0.8)'
              }}
              data-testid="hero-scripture"
            >
              "{scripture}"
            </p>
            <p 
              className="text-base md:text-lg text-white/80 font-medium" 
              style={{ textShadow: '0 2px 8px rgba(0, 0, 0, 0.8)' }}
              data-testid="hero-scripture-reference"
            >
              — {scriptureReference}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
