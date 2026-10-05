import { Link } from "wouter";

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
  headline = "Remember what God has done. Encourage someone today.",
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
        aria-hidden="true"
        data-testid="hero-video"
      >
        <source src={videoSrc} type="video/mp4" />
      </video>

      {/* Dark Overlay for Text Readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/70 to-black/80" />

      {/* Text Overlay */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 md:px-6">
        <div className="max-w-4xl mx-auto space-y-5">
          {/* Main Message */}
          <h1 
            className="text-3xl md:text-5xl lg:text-6xl text-white leading-tight font-semibold" 
            style={{ 
              fontFamily: 'Space Grotesk, sans-serif',
              textShadow: '0 2px 8px rgba(0, 0, 0, 0.8), 0 4px 16px rgba(0, 0, 0, 0.5)'
            }}
            data-testid="hero-headline"
          >
            {headline}
          </h1>
          {subheadline && (
            <p 
              className="text-base md:text-xl text-white/90 leading-relaxed font-medium" 
              style={{ 
                fontFamily: 'Space Grotesk, sans-serif',
                textShadow: '0 2px 8px rgba(0, 0, 0, 0.8)' 
              }}
              data-testid="hero-subheadline"
            >
              {subheadline}
            </p>
          )}

          {/* Scripture Verse */}
          <div className="pt-2 space-y-3">
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
          <div className="flex flex-wrap justify-center gap-3 pt-1">
            <Link href="/testimonies" className="inline-flex min-h-11 items-center rounded-full bg-white px-6 text-sm font-semibold text-slate-950 shadow-lg hover:bg-white/90">
              Browse testimonies
            </Link>
            <Link href="/signin" className="inline-flex min-h-11 items-center rounded-full border border-white/60 bg-black/20 px-6 text-sm font-semibold text-white hover:bg-black/40">
              Start a private journal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
