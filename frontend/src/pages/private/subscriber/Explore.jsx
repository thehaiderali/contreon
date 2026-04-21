import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Search, ChevronRight, ChevronLeft, Mic, Zap, Music, BookOpen, Box, Palette, Gamepad2, Coffee, Scissors, Heart } from "lucide-react";

// ─────────────────────────────────────────────
// DATA STRUCTURES  (replace with real API data)
// ─────────────────────────────────────────────

/**
 * Category filter chips
 * GET /api/explore/categories
 * Returns: Category[]
 */
const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "crypto", label: "Crypto" },
  { id: "comedy", label: "Comedy" },
  { id: "apps", label: "Apps & software" },
  { id: "math", label: "Mathematics" },
  { id: "podcasts", label: "Podcasts & shows" },
  { id: "lifestyle", label: "Lifestyle" },
  { id: "finance", label: "Finance" },
  { id: "entertainment", label: "Entertainment" },
  { id: "educational", label: "Educational" },
  { id: "popculture", label: "Pop culture" },
];

/**
 * Recently visited creators
 * GET /api/explore/recently-visited
 * Returns: Creator[]
 */
const RECENTLY_VISITED = [
  { id: "1", name: "Michael Reeves", avatar: "https://i.pravatar.cc/40?img=1", slug: "michael-reeves" },
  { id: "2", name: "3Blue1Brown", avatar: "https://i.pravatar.cc/40?img=2", slug: "3blue1brown" },
  { id: "3", name: "Learn to code with Ayush", avatar: "https://i.pravatar.cc/40?img=3", slug: "ayush" },
];

/**
 * Personalised creator cards (based on memberships)
 * GET /api/explore/creators-for-you
 * Returns: CreatorCard[]
 */
const CREATORS_FOR_YOU = [
  { id: "c1", name: "GOD - TheGeekyTrader", tagline: "Welcome to GeekOnDaily – Th...", cover: "https://picsum.photos/seed/geek/300/200" },
  { id: "c2", name: "Amanda Sargent", tagline: "creating videos n stuff", cover: "https://picsum.photos/seed/amanda/300/200" },
  { id: "c3", name: "SeerLight", tagline: "creating Digital illustrations an...", cover: "https://picsum.photos/seed/seer/300/200" },
  { id: "c4", name: "Cowokie", tagline: "creating Digital Art", cover: "https://picsum.photos/seed/cowokie/300/200" },
  { id: "c5", name: "The Gospel Ingrained", tagline: "Living out the gospel in...", cover: "https://picsum.photos/seed/gospel/300/200" },
  { id: "c6", name: "WrenchMaster", tagline: "Makes Art and Videos :D", cover: "https://picsum.photos/seed/wrench/300/200" },
];

/**
 * Popular this week creators
 * GET /api/explore/popular-this-week
 * Returns: CreatorRow[]
 */
const POPULAR_THIS_WEEK = [
  { id: "p1", name: "Elis James and John Robins", tagline: "A comedy entertainment podcast", avatar: "https://i.pravatar.cc/48?img=10" },
  { id: "p2", name: "INFLUENCER CITY", tagline: "CONTENT", avatar: "https://i.pravatar.cc/48?img=11" },
  { id: "p3", name: "Mihon", tagline: "Making the best manga reader!", avatar: "https://i.pravatar.cc/48?img=12" },
  { id: "p4", name: "Aranaktu", tagline: "Creating modding tools for various games", avatar: "https://i.pravatar.cc/48?img=13" },
  { id: "p5", name: "WolfeyVGC", tagline: "Creating Pokémon content", avatar: "https://i.pravatar.cc/48?img=14" },
  { id: "p6", name: "Martin Karbowski", tagline: "creating media content & journalism", avatar: "https://i.pravatar.cc/48?img=15" },
  { id: "p7", name: "Your Friend Trin", tagline: 'It just got cool to be in the "Friend Zone"', avatar: "https://i.pravatar.cc/48?img=16" },
  { id: "p8", name: "DJJINOreacts", tagline: "creating Music Reactions", avatar: "https://i.pravatar.cc/48?img=17" },
  { id: "p9", name: "WrestleTalk", tagline: "Creating fun wrestling videos and podcasts!", avatar: "https://i.pravatar.cc/48?img=18" },
];

/**
 * Explore topic grid
 * GET /api/explore/topics
 * Returns: Topic[]
 */
const TOPICS = [
  { id: "t1", label: "Podcasts & shows", icon: Mic },
  { id: "t2", label: "Tabletop games", icon: Zap },
  { id: "t3", label: "Music", icon: Music },
  { id: "t4", label: "Writing", icon: BookOpen },
  { id: "t5", label: "Apps & software", icon: Box },
  { id: "t6", label: "Visual arts", icon: Palette },
  { id: "t7", label: "Video games", icon: Gamepad2 },
  { id: "t8", label: "Lifestyle", icon: Coffee },
  { id: "t9", label: "Handicrafts", icon: Scissors },
  { id: "t10", label: "Social impact", icon: Heart },
];

/**
 * Top creators by category
 * GET /api/explore/top-creators?category=crypto
 * Returns: { category: string; creators: CreatorCard[] }[]
 */
const TOP_CREATORS_BY_CATEGORY = [
  {
    category: "Crypto",
    creators: [
      { id: "cr1", name: "Vojta Žižka", tagline: "Rozhovory ze světa financí,…", cover: "https://picsum.photos/seed/vojta/300/200" },
      { id: "cr2", name: "Money or Life美股频道", tagline: "Sharing finance insights...", cover: "https://picsum.photos/seed/mol/300/200" },
      { id: "cr3", name: "SummerTea", tagline: "Sharing Knowledge on…", cover: "https://picsum.photos/seed/sumtea/300/200" },
      { id: "cr4", name: "MetaTFT", tagline: "creating MetaTFT.com -…", cover: "https://picsum.photos/seed/meta/300/200" },
      { id: "cr5", name: "WatersAbove Crypto", tagline: "Creating educational videos…", cover: "https://picsum.photos/seed/waters/300/200" },
      { id: "cr6", name: "KuvdraYT", tagline: "The official Patreon page of th…", cover: "https://picsum.photos/seed/kuvdra/300/200" },
    ],
  },
  {
    category: "Comedy",
    creators: [
      { id: "co1", name: "Tim Dillon Show", tagline: "No-holds-barred comedy podcast", cover: "https://picsum.photos/seed/tim/300/200" },
      { id: "co2", name: "Elis & John", tagline: "A comedy entertainment podcast", cover: "https://picsum.photos/seed/elisj/300/200" },
      { id: "co3", name: "Tuggy after Tuggy", tagline: "Did you get yours?", cover: "https://picsum.photos/seed/tuggy/300/200" },
      { id: "co4", name: "Stand-Up Circuit", tagline: "Live sets & behind the scenes", cover: "https://picsum.photos/seed/standup/300/200" },
    ],
  },
];

/**
 * New on platform creators
 * GET /api/explore/new
 * Returns: CreatorCard[]
 */
const NEW_ON_PLATFORM = [
  { id: "n1", name: "Pixel Drift Studio", tagline: "Generative art & code", cover: "https://picsum.photos/seed/pixel/300/200" },
  { id: "n2", name: "The Freud Files", tagline: "Psychology deep dives", cover: "https://picsum.photos/seed/freud/300/200" },
  { id: "n3", name: "Lo-fi Architect", tagline: "Ambient music for focus", cover: "https://picsum.photos/seed/lofi/300/200" },
  { id: "n4", name: "NomadBytes", tagline: "Dev life on the road", cover: "https://picsum.photos/seed/nomad/300/200" },
  { id: "n5", name: "Craft & Circuit", tagline: "Electronics meets handmade", cover: "https://picsum.photos/seed/craft/300/200" },
  { id: "n6", name: "Dark Matter Reads", tagline: "Sci-fi book club & reviews", cover: "https://picsum.photos/seed/dark/300/200" },
];

// ─────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────

/** Horizontal filter chip row */
function CategoryFilter({ selected, onSelect }) {
  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex gap-2 pb-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-colors
              ${selected === cat.id
                ? "bg-foreground text-background border-foreground"
                : "bg-transparent text-muted-foreground border-border hover:border-foreground hover:text-foreground"
              }`}
          >
            {cat.label}
          </button>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}

/** Single creator card (large image + title) */
function CreatorCard({ creator }) {
  return (
    <div className="group flex-shrink-0 w-[180px] cursor-pointer">
      <div className="rounded-xl overflow-hidden aspect-[4/3] mb-2 border border-border">
        <img
          src={creator.cover}
          alt={creator.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <p className="text-sm font-semibold truncate">{creator.name}</p>
      <p className="text-xs text-muted-foreground truncate">{creator.tagline}</p>
    </div>
  );
}

/** Row item (avatar + text) used in "Popular this week" */
function CreatorRow({ creator }) {
  return (
    <div className="flex items-center gap-3 py-2 cursor-pointer group">
      <img
        src={creator.avatar}
        alt={creator.name}
        className="w-11 h-11 rounded-full object-cover border border-border shrink-0"
      />
      <div className="min-w-0">
        <p className="text-sm font-semibold truncate group-hover:underline">{creator.name}</p>
        <p className="text-xs text-muted-foreground truncate">{creator.tagline}</p>
      </div>
    </div>
  );
}

/** Horizontal scrollable section with prev/next buttons */
function HorizontalSection({ title, linkLabel = "See all", children }) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <button className="flex items-center gap-1 text-lg font-bold hover:underline">
          {title} <ChevronRight className="w-4 h-4" />
        </button>
        <div className="flex gap-1">
          <Button variant="outline" size="icon" className="h-7 w-7 rounded-full">
            <ChevronLeft className="w-3 h-3" />
          </Button>
          <Button variant="outline" size="icon" className="h-7 w-7 rounded-full">
            <ChevronRight className="w-3 h-3" />
          </Button>
        </div>
      </div>
      <ScrollArea className="w-full">
        <div className="flex gap-4 pb-3">{children}</div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </section>
  );
}

/** Recently visited pills */
function RecentlyVisited() {
  return (
    <section className="space-y-3">
      <button className="flex items-center gap-1 text-base font-bold hover:underline">
        Recently visited <ChevronRight className="w-4 h-4" />
      </button>
      <div className="flex gap-3 flex-wrap">
        {RECENTLY_VISITED.map((c) => (
          <div
            key={c.id}
            className="flex items-center gap-2.5 bg-muted rounded-xl px-4 py-2.5 cursor-pointer hover:bg-muted/70 transition-colors"
          >
            <img src={c.avatar} alt={c.name} className="w-7 h-7 rounded-full object-cover" />
            <span className="text-sm font-medium">{c.name}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

/** Explore topics grid */
function ExploreTopics() {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-bold">Explore topics</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {TOPICS.map((topic) => {
          const Icon = topic.icon;
          return (
            <div
              key={topic.id}
              className="relative rounded-xl border border-border bg-muted/40 hover:bg-muted transition-colors cursor-pointer px-4 py-5 flex items-end justify-between overflow-hidden group"
            >
              <span className="text-sm font-semibold leading-tight z-10">{topic.label}</span>
              <Icon className="w-5 h-5 text-muted-foreground z-10 group-hover:scale-110 transition-transform" />
            </div>
          );
        })}
      </div>
    </section>
  );
}

/** Popular this week – 3-column grid of rows */
function PopularThisWeek() {
  const columns = [
    POPULAR_THIS_WEEK.slice(0, 3),
    POPULAR_THIS_WEEK.slice(3, 6),
    POPULAR_THIS_WEEK.slice(6, 9),
  ];
  return (
    <section className="space-y-4">
      <button className="flex items-center gap-1 text-lg font-bold hover:underline">
        Popular this week <ChevronRight className="w-4 h-4" />
      </button>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-8 divide-y sm:divide-y-0 sm:divide-x divide-border">
        {columns.map((col, ci) => (
          <div key={ci} className={`${ci > 0 ? "sm:pl-8" : ""} divide-y divide-border`}>
            {col.map((c) => (
              <CreatorRow key={c.id} creator={c} />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

/** Top creators horizontal carousel per category */
function TopCreatorsSection() {
  return (
    <>
      {TOP_CREATORS_BY_CATEGORY.map((section) => (
        <HorizontalSection key={section.category} title={`Top creators · ${section.category}`}>
          {section.creators.map((c) => (
            <CreatorCard key={c.id} creator={c} />
          ))}
        </HorizontalSection>
      ))}
    </>
  );
}

/** Search bar */
function SearchBar() {
  return (
    <div className="relative w-full max-w-xl mx-auto">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input
        placeholder="Search creators or topics"
        className="pl-9 rounded-full bg-muted border-border focus-visible:ring-1"
      />
    </div>
  );
}

// ─────────────────────────────────────────────
// PAGE ENTRY POINT
// ─────────────────────────────────────────────

export default function ExplorePage() {
  const [activeCategory, setActiveCategory] = useState("all");
  console.log("Active Category : ",activeCategory)

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sticky top bar */}
      <div className="sticky top-0 z-20 bg-background border-b border-border px-4 py-3 space-y-3">
        <SearchBar />
        <CategoryFilter selected={activeCategory} onSelect={setActiveCategory} />
      </div>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-10">
        <RecentlyVisited />
        <Separator />

        {/* Creators for you */}
        <section className="space-y-2">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
            Based on your memberships
          </p>
          <HorizontalSection title="Creators for you">
            {CREATORS_FOR_YOU.map((c) => (
              <CreatorCard key={c.id} creator={c} />
            ))}
          </HorizontalSection>
        </section>

        <Separator />
        <PopularThisWeek />

        <Separator />
        <ExploreTopics />

        <Separator />
        {/* New on platform */}
        <HorizontalSection title="New on Platform">
          {NEW_ON_PLATFORM.map((c) => (
            <CreatorCard key={c.id} creator={c} />
          ))}
        </HorizontalSection>

        <Separator />
        <TopCreatorsSection />
      </main>
    </div>
  );
}