import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, Sparkles, BookOpen, Heart, Sun, Check } from "lucide-react";

interface GuidedTestimonyEditorProps {
  value: string;
  onChange: (value: string) => void;
  isVideoMode?: boolean;
}

interface StorySection {
  id: string;
  title: string;
  subtitle: string;
  prompt: string;
  icon: typeof BookOpen;
  placeholder: string;
  scripture?: string;
}

const STORY_SECTIONS: StorySection[] = [
  {
    id: "beginning",
    title: "Before He Moved",
    subtitle: "What was life like going into this?",
    prompt: "Where were you when this started? What were you carrying — emotionally, spiritually, practically? Don't dress it up. Write it the way it felt.",
    icon: BookOpen,
    placeholder: "Write whatever comes naturally. What was happening in your life before God stepped in?\n\nExample: 'For months I had been...' or 'I was at a point where I didn't know how...'",
    scripture: "\"In my distress I called to the Lord; I cried to my God for help.\" — Psalm 18:6"
  },
  {
    id: "turning_point",
    title: "When Things Shifted",
    subtitle: "What happened? When did you notice God in it?",
    prompt: "At what point did something change? Was it a moment, a word, a person He sent, a prayer, a peace that came from nowhere? Describe it as honestly as you can.",
    icon: Sparkles,
    placeholder: "When did you sense God moving? What did He do, say, or send?\n\nExample: 'One afternoon while I was...' or 'Out of nowhere, someone said to me...'",
    scripture: "\"I sought the Lord, and he answered me; he delivered me from all my fears.\" — Psalm 34:4"
  },
  {
    id: "transformation",
    title: "What He Did",
    subtitle: "The answer, the change, the miracle — write it plainly.",
    prompt: "Name what God did. Don't understate it. This is the part where you declare His faithfulness — write it clearly, specifically, and with gratitude.",
    icon: Sun,
    placeholder: "What changed? What did He do? Be specific.\n\nExample: 'The results came back and...' or 'Within days, the situation...' or 'I woke up one morning and...'",
    scripture: "\"He put a new song in my mouth, a hymn of praise to our God.\" — Psalm 40:3"
  },
  {
    id: "encouragement",
    title: "What You're Carrying Forward",
    subtitle: "What do you want to remember about this?",
    prompt: "What lesson, reminder, or truth has stayed with you? And if someone is in the same place you were — what would you want them to know?",
    icon: Heart,
    placeholder: "Write what you'd say to yourself a year ago, or to someone in the middle of what you just came through.\n\nExample: 'What I know now that I didn't know then is...' or 'If you're reading this and you're still waiting...'",
    scripture: "\"Praise be to the God and Father of our Lord Jesus Christ, who comforts us in all our troubles, so that we can comfort those in any trouble.\" — 2 Corinthians 1:3-4"
  }
];

export function GuidedTestimonyEditor({ value, onChange, isVideoMode = false }: GuidedTestimonyEditorProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [sectionContents, setSectionContents] = useState<Record<string, string>>({
    beginning: "",
    turning_point: "",
    transformation: "",
    encouragement: ""
  });

  useEffect(() => {
    if (value && !Object.values(sectionContents).some(s => s.trim())) {
      const sections = parseExistingContent(value);
      if (Object.values(sections).some(s => s.trim())) {
        setSectionContents(sections);
      }
    }
  }, []);

  const parseExistingContent = (content: string): Record<string, string> => {
    const result: Record<string, string> = {
      beginning: "",
      turning_point: "",
      transformation: "",
      encouragement: ""
    };

    const beginningMatch = content.match(/\*\*Before He Moved\*\*\n([\s\S]*?)(?=\n\n\*\*|$)/);
    const turningMatch = content.match(/\*\*When Things Shifted\*\*\n([\s\S]*?)(?=\n\n\*\*|$)/);
    const transformMatch = content.match(/\*\*What He Did\*\*\n([\s\S]*?)(?=\n\n\*\*|$)/);
    const encourageMatch = content.match(/\*\*What You're Carrying Forward\*\*\n([\s\S]*?)$/);

    if (beginningMatch) result.beginning = beginningMatch[1].trim();
    if (turningMatch) result.turning_point = turningMatch[1].trim();
    if (transformMatch) result.transformation = transformMatch[1].trim();
    if (encourageMatch) result.encouragement = encourageMatch[1].trim();

    return result;
  };

  const combineStory = (sections: Record<string, string>): string => {
    const parts: string[] = [];

    if (sections.beginning.trim()) {
      parts.push(`**Before He Moved**\n${sections.beginning.trim()}`);
    }
    if (sections.turning_point.trim()) {
      parts.push(`**When Things Shifted**\n${sections.turning_point.trim()}`);
    }
    if (sections.transformation.trim()) {
      parts.push(`**What He Did**\n${sections.transformation.trim()}`);
    }
    if (sections.encouragement.trim()) {
      parts.push(`**What You're Carrying Forward**\n${sections.encouragement.trim()}`);
    }

    return parts.join("\n\n");
  };

  const handleSectionChange = (sectionId: string, content: string) => {
    const newContents = { ...sectionContents, [sectionId]: content };
    setSectionContents(newContents);
    onChange(combineStory(newContents));
  };

  const currentSection = STORY_SECTIONS[currentStep];
  const progress = ((currentStep + 1) / STORY_SECTIONS.length) * 100;
  const completedSections = Object.values(sectionContents).filter(s => s.trim().length > 0).length;
  const IconComponent = currentSection.icon;

  const goToNext = () => {
    if (currentStep < STORY_SECTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {STORY_SECTIONS.map((section, index) => (
            <button
              key={section.id}
              type="button"
              onClick={() => setCurrentStep(index)}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                index === currentStep
                  ? "bg-primary text-primary-foreground"
                  : sectionContents[section.id]?.trim()
                  ? "bg-green-500/20 text-green-600 border border-green-500/30"
                  : "bg-muted text-muted-foreground"
              }`}
              data-testid={`button-step-${index + 1}`}
            >
              {sectionContents[section.id]?.trim() ? <Check className="w-4 h-4" /> : index + 1}
            </button>
          ))}
        </div>
        <span className="text-sm text-muted-foreground">
          {completedSections}/{STORY_SECTIONS.length} sections
        </span>
      </div>

      <Progress value={progress} className="h-1" />

      <Card className="rounded-xl border-primary/20 bg-gradient-to-br from-background to-muted/20">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <IconComponent className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {currentSection.title}
              </CardTitle>
              <CardDescription>{currentSection.subtitle}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground leading-relaxed">
            {currentSection.prompt}
          </p>

          {currentSection.scripture && (
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
              <p className="text-sm italic text-muted-foreground" style={{ fontFamily: "'Crimson Pro', serif" }}>
                {currentSection.scripture}
              </p>
            </div>
          )}

          <Textarea
            value={sectionContents[currentSection.id] || ""}
            onChange={(e) => handleSectionChange(currentSection.id, e.target.value)}
            placeholder={currentSection.placeholder}
            className="min-h-[200px] resize-none text-base leading-relaxed"
            data-testid={`textarea-section-${currentSection.id}`}
          />

          <div className="flex items-center justify-between pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={goToPrev}
              disabled={currentStep === 0}
              data-testid="button-prev-section"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>

            {currentStep < STORY_SECTIONS.length - 1 ? (
              <Button
                type="button"
                onClick={goToNext}
                data-testid="button-next-section"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <div className="flex items-center gap-2 text-green-600">
                <Check className="w-5 h-5" />
                <span className="font-medium">Entry complete</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {isVideoMode && (
        <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <p className="text-sm text-amber-700 dark:text-amber-400">
            <strong>Before you record:</strong> Use these prompts to gather your thoughts. You don't need to follow them word for word — just let your heart speak.
          </p>
        </div>
      )}
    </div>
  );
}

interface GuidedVideoPromptsProps {
  onReady: () => void;
}

export function GuidedVideoPrompts({ onReady }: GuidedVideoPromptsProps) {
  const [currentPrompt, setCurrentPrompt] = useState(0);

  const prompts = [
    {
      title: "Before He moved",
      description: "Where were you when this started? Give the raw version — what you were going through.",
      example: "The situation, the struggle, the season you were in."
    },
    {
      title: "When things shifted",
      description: "What did God do, say, or send into your life?",
      example: "The moment, the prayer, the person, the turning point."
    },
    {
      title: "What He did",
      description: "Name the change plainly. Don't understate it.",
      example: "The healing, the provision, the breakthrough, the peace that came."
    },
    {
      title: "What you'd say to someone still in it",
      description: "End with a word for the person watching who is where you used to be.",
      example: "What would you tell them to hold on to?"
    }
  ];

  return (
    <Card className="rounded-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          <Sparkles className="w-5 h-5 text-primary" />
          Before You Hit Record
        </CardTitle>
        <CardDescription>
          Think through these four things. You don't have to be perfect — just be real.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {prompts.map((prompt, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border transition-all cursor-pointer ${
              currentPrompt === index
                ? "border-primary bg-primary/5"
                : "border-muted hover:border-primary/50"
            }`}
            onClick={() => setCurrentPrompt(index)}
          >
            <div className="flex items-start gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium shrink-0 ${
                currentPrompt === index ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}>
                {index + 1}
              </div>
              <div>
                <h4 className="font-medium">{prompt.title}</h4>
                <p className="text-sm text-muted-foreground mt-1">{prompt.description}</p>
                <p className="text-xs text-muted-foreground mt-1 italic">{prompt.example}</p>
              </div>
            </div>
          </div>
        ))}

        <Button onClick={onReady} className="w-full mt-4" data-testid="button-ready-to-record">
          I'm ready — start recording
        </Button>
      </CardContent>
    </Card>
  );
}
