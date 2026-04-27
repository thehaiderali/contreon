import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Search, ChevronRight, ChevronLeft, X } from "lucide-react";
import exploreService from "@/src/services/exploreService";

// ─────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────

/** Horizontal filter chip row */
function CategoryFilter({ categories, selected, onSelect }) {
  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex gap-2 pb-2">
        {categories.map((cat) => (
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
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (creator.pageUrl) {
      navigate(`/c/${creator.pageUrl}`);
    }
  };

  return (
    <div 
      className="group flex-shrink-0 w-[180px] cursor-pointer"
      onClick={handleClick}
    >
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
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (creator.pageUrl) {
      navigate(`/c/${creator.pageUrl}`);
    }
  };

  return (
    <div 
      className="flex items-center gap-3 py-2 cursor-pointer group"
      onClick={handleClick}
    >
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
function HorizontalSection({ title, children }) {
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
function RecentlyVisited({ creators }) {
  const navigate = useNavigate();
  
  if (!creators || creators.length === 0) return null;
  
  const handleClick = (slug) => {
    if (slug) {
      navigate(`/c/${slug}`);
    }
  };
  
  return (
    <section className="space-y-3">
      <button className="flex items-center gap-1 text-base font-bold hover:underline">
        Recently visited <ChevronRight className="w-4 h-4" />
      </button>
      <div className="flex gap-3 flex-wrap">
        {creators.map((c) => (
          <div
            key={c.id}
            className="flex items-center gap-2.5 bg-muted rounded-xl px-4 py-2.5 cursor-pointer hover:bg-muted/70 transition-colors"
            onClick={() => handleClick(c.slug)}
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
function ExploreTopics({ topics, onTopicClick }) {
  if (!topics || topics.length === 0) return null;
  
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-bold">Explore topics</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {topics.map((topic) => (
          <div
            key={topic.id}
            className="relative rounded-xl border border-border bg-muted/40 hover:bg-muted transition-colors cursor-pointer px-4 py-5 flex items-end justify-between overflow-hidden group"
            onClick={() => onTopicClick && onTopicClick(topic.label)}
          >
            <span className="text-sm font-semibold leading-tight z-10">{topic.label}</span>
            {topic.icon && (
              <span className="text-lg z-10 group-hover:scale-110 transition-transform">
                {topic.icon}
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

/** Popular this week – 3-column grid of rows */
function PopularThisWeek({ creators }) {
  if (!creators || creators.length === 0) return null;
  
  const columns = [
    creators.slice(0, 3),
    creators.slice(3, 6),
    creators.slice(6, 9),
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
function TopCreatorsSection({ topCreatorsByCategory }) {
  if (!topCreatorsByCategory || topCreatorsByCategory.length === 0) return null;
  
  return (
    <>
      {topCreatorsByCategory.map((section) => (
        <HorizontalSection key={section.category} title={`Top creators · ${section.category}`}>
          {section.creators.map((c) => (
            <CreatorCard key={c.id} creator={c} />
          ))}
        </HorizontalSection>
      ))}
    </>
  );
}

/** Search results dropdown */
function SearchResults({ results, isOpen, onClose }) {
  const navigate = useNavigate();
  
  if (!isOpen || !results || results.length === 0) return null;
  
  const handleCreatorClick = (result) => {
    if (result.pageUrl) {
      navigate(`/c/${result.pageUrl}`);
      onClose();
    }
  };
  
  const handleTopicClick = () => {
    onClose();
  };
  
  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-xl shadow-lg z-50 max-h-96 overflow-y-auto">
      {results.map((result, index) => (
        <div key={result.id || index}>
          {result.type === 'creator' ? (
            <div 
              className="flex items-center gap-3 px-4 py-3 hover:bg-muted cursor-pointer"
              onClick={() => handleCreatorClick(result)}
            >
              <img 
                src={result.avatar} 
                alt={result.name} 
                className="w-10 h-10 rounded-full object-cover" 
              />
              <div>
                <p className="text-sm font-medium">{result.name}</p>
                <p className="text-xs text-muted-foreground truncate">{result.tagline}</p>
              </div>
            </div>
          ) : (
            <div 
              className="px-4 py-3 hover:bg-muted cursor-pointer flex items-center gap-2"
              onClick={() => handleTopicClick(result.label)}
            >
              <span className="text-lg">{result.icon}</span>
              <span className="text-sm font-medium">{result.label}</span>
              <span className="text-xs text-muted-foreground ml-auto">Topic</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/** Search bar */
function SearchBar({ onSearch }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  
  useEffect(() => {
    const searchCreators = async () => {
      if (query.trim().length < 2) {
        setResults([]);
        setShowResults(false);
        return;
      }
      
      try {
        const response = await exploreService.searchCreatorsOrTopics(query);
        setResults(response.results || []);
        setShowResults(true);
      } catch (err) {
        console.error('Error searching:', err);
        setResults([]);
      }
    };
    
    const debounceTimer = setTimeout(searchCreators, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim() && onSearch) {
      onSearch(query);
    }
    setShowResults(false);
  };
  
  const handleClose = () => {
    setShowResults(false);
    setQuery("");
    setResults([]);
  };
  
  return (
    <div className="relative w-full max-w-xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search creators or topics"
          className="pl-9 pr-10 rounded-full bg-muted border-border focus-visible:ring-1"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setShowResults(true)}
        />
        {query && (
          <button
            type="button"
            onClick={handleClose}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </form>
      <SearchResults 
        results={results} 
        isOpen={showResults} 
        onClose={handleClose}
      />
    </div>
  );
}

// ─────────────────────────────────────────────
// PAGE ENTRY POINT
// ─────────────────────────────────────────────

export default function ExplorePage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [categories, setCategories] = useState([]);
  const [recentlyVisited, setRecentlyVisited] = useState([]);
  const [creatorsForYou, setCreatorsForYou] = useState([]);
  const [popularThisWeek, setPopularThisWeek] = useState([]);
  const [topics, setTopics] = useState([]);
  const [topCreatorsByCategory, setTopCreatorsByCategory] = useState([]);
  const [newCreators, setNewCreators] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    
    try {
      const [
        categoriesRes,
        popularRes,
        topicsRes,
        topCreatorsRes,
        newRes
      ] = await Promise.all([
        exploreService.getCategories(),
        exploreService.getPopularThisWeek(),
        exploreService.getTopics(),
        exploreService.getTopCreatorsByCategory(activeCategory !== 'all' ? activeCategory : null),
        exploreService.getNewCreators()
      ]);

      setCategories(categoriesRes.categories || []);
      setPopularThisWeek(popularRes.popularThisWeek || []);
      setTopics(topicsRes.topics || []);
      setTopCreatorsByCategory(topCreatorsRes.topCreatorsByCategory || []);
      setNewCreators(newRes.newCreators || []);
    } catch (err) {
      console.error('Error fetching explore data:', err);
    }

    try {
      const [recentRes, forYouRes] = await Promise.all([
        exploreService.getRecentlyVisited(),
        exploreService.getCreatorsForYou()
      ]);
      setRecentlyVisited(recentRes.recentlyVisited || []);
      setCreatorsForYou(forYouRes.creatorsForYou || []);
    } catch (err) {
      console.error('Error fetching user-specific data:', err);
    }

    setLoading(false);
  }, [activeCategory]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const handleSearch = useCallback((query) => {
    console.log("Searching for:", query);
  }, []);

  const handleTopicClick = useCallback((topicLabel) => {
    setActiveCategory(topicLabel.toLowerCase());
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sticky top bar */}
      <div className="sticky top-0 z-20 bg-background border-b border-border px-4 py-3 space-y-3">
        <SearchBar onSearch={handleSearch} onTopicClick={handleTopicClick} />
        <CategoryFilter categories={categories} selected={activeCategory} onSelect={setActiveCategory} />
      </div>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-10">
        <RecentlyVisited creators={recentlyVisited} />
        <Separator />

        {/* Creators for you */}
        {creatorsForYou.length > 0 && (
          <>
            <section className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
                Based on your memberships
              </p>
              <HorizontalSection title="Creators for you">
                {creatorsForYou.map((c) => (
                  <CreatorCard key={c.id} creator={c} />
                ))}
              </HorizontalSection>
            </section>
            <Separator />
          </>
        )}

        <PopularThisWeek creators={popularThisWeek} />

        <Separator />
        <ExploreTopics topics={topics} onTopicClick={handleTopicClick} />

        <Separator />
        {/* New on platform */}
        {newCreators.length > 0 && (
          <>
            <HorizontalSection title="New on Platform">
              {newCreators.map((c) => (
                <CreatorCard key={c.id} creator={c} />
              ))}
            </HorizontalSection>
            <Separator />
          </>
        )}
        <TopCreatorsSection topCreatorsByCategory={topCreatorsByCategory} />
      </main>
    </div>
  );
}