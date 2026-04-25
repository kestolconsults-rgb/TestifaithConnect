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
    title: "The Beginning",
    subtitle: "Where your story starts",
    prompt: "Describe your situation before God's intervention. What challenges, struggles, or circumstances were you facing? Paint a picture of where you were in life and in your faith.",
    icon: BookOpen,
    placeholder: "Share what your life or situation looked like before this testimony...\n\nExample: 'For months, I struggled with...' or 'I found myself in a difficult season where...'",
    scripture: "\"In my distress I called to the Lord; I cried to my God for help.\" - Psalm 18:6"
  },
  {
    id: "turning_point",
    title: "The Turning Point",
    subtitle: "When God showed up",
    prompt: "Describe how God intervened in your situation. What happened? Was it a prayer answered, a sign, a person He sent, or a supernatural experience? Share the moment things began to change.",
    icon: Sparkles,
    placeholder: "Tell us about the moment God stepped in...\n\nExample: 'One day, while I was praying...' or 'God sent someone into my life who...'",
    scripture: "\"I sought the Lord, and he answered me; he delivered me from all my fears.\" - Psalm 34:4"
  },
  {
    id: "transformation",
    title: "The Transformation",
    subtitle: "How everything changed",
    prompt: "Share the outcome and how your situation was transformed. What is different now? How has this experience strengthened your faith and relationship with God?",
    icon: Sun,
    placeholder: "Describe how things are different now...\n\nExample: 'Today, I can testify that...' or 'This experience has taught me...'",
    scripture: "\"He put a new song in my mouth, a hymn of praise to our God.\" - Psalm 40:3"
  },
  {
    id: "encouragement",
    title: "Words of Encouragement",
    subtitle: "Your message to others",
    prompt: "What would you like to say to someone going through a similar situation? Share a word of hope, a lesson learned, or encouragement for others facing the same struggle.",
    icon: Heart,
    placeholder: "Leave an encouraging message for others...\n\nExample: 'If you're going through something similar, I want you to know...' or 'Hold on to faith because...'",
    scripture: "\"Praise be to the God and Father of our Lord Jesus Christ, who comforts us in all our troubles, so that we can comfort those in any trouble.\" - 2 Corinthians 1:3-4"
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
    
    const beginningMatch = content.match(/\*\*The Beginning\*\*\n([\s\S]*?)(?=\n\n\*\*|$)/);
    const turningMatch = content.match(/\*\*The Turning Point\*\*\n([\s\S]*?)(?=\n\n\*\*|$)/);
    const transformMatch = content.match(/\*\*The Transformation\*\*\n([\s\S]*?)(?=\n\n\*\*|$)/);
    const encourageMatch = content.match(/\*\*Words of Encouragement\*\*\n([\s\S]*?)$/);

    if (beginningMatch) result.beginning = beginningMatch[1].trim();
    if (turningMatch) result.turning_point = turningMatch[1].trim();
    if (transformMatch) result.transformation = transformMatch[1].trim();
    if (encourageMatch) result.encouragement = encourageMatch[1].trim();

    return result;
  };

  const combineStory = (sections: Record<string, string>): string => {
    const parts: string[] = [];
    
    if (sections.beginning.trim()) {
      parts.push(`**The Beginning**\n${sections.beginning.trim()}`);
    }
    if (sections.turning_point.trim()) {
      parts.push(`**The Turning Point**\n${sections.turning_point.trim()}`);
    }
    if (sections.transformation.trim()) {
      parts.push(`**The Transformation**\n${sections.transformation.trim()}`);
    }
    if (sections.encouragement.trim()) {
      parts.push(`**Words of Encouragement**\n${sections.encouragement.trim()}`);
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
              <p className="text-sm italic text-muted-foreground">
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
                <span className="font-medium">Story Complete</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {isVideoMode && (
        <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <p className="text-sm text-amber-700 dark:text-amber-400">
            <strong>Video Tip:</strong> Use these prompts to prepare your thoughts before recording. 
            You don't need to read them word-for-word — let your heart speak naturally!
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
      title: "Start with your situation",
      description: "Briefly describe what you were going through before God's intervention.",
      example: "Share the challenge, struggle, or need you faced."
    },
    {
      title: "Share the turning point",
      description: "Tell us how God showed up in your life.",
      example: "What prayer was answered? What moment changed everything?"
    },
    {
      title: "Describe the outcome",
      description: "How is your life different now?",
      example: "What has changed? How has your faith grown?"
    },
    {
      title: "Encourage others",
      description: "End with words of hope for someone facing similar struggles.",
      example: "What would you tell them to hold onto?"
    }
  ];

  return (
    <Card className="rounded-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          <Sparkles className="w-5 h-5 text-primary" />
          Story Structure Guide
        </CardTitle>
        <CardDescription>
          Follow this structure to share a powerful testimony
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
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
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
          I'm Ready to Record
        </Button>
      </CardContent>
    </Card>
  );
}
