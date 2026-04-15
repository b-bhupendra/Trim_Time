import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Globe, 
  Code, 
  Image as ImageIcon, 
  Video, 
  AlertCircle, 
  Loader2, 
  Copy, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp,
  RefreshCw,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// --- Types ---

interface MediaItem {
  url: string;
  type: 'image' | 'video';
  source: 'ld+json' | 'inline-json' | 'dom';
  thumbnail?: string;
}

interface ScrapeResult {
  items: MediaItem[];
  rawJson: any[];
  stats: {
    ldJson: number;
    inlineJson: number;
    dom: number;
  };
}

// --- Utils ---

const normalizeUrl = (url: string) => {
  try {
    const u = new URL(url);
    // Remove common tracking params but keep signature params if needed
    // For IG viewer sites, usually the full URL is needed
    return u.href;
  } catch {
    return url;
  }
};

const deduplicateMedia = (items: MediaItem[]): MediaItem[] => {
  const seen = new Set<string>();
  return items.filter(item => {
    const normalized = normalizeUrl(item.url);
    if (seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  });
};

// --- Main Component ---

export const InstagramScraper: React.FC = () => {
  const [username, setUsername] = useState('kyliejenner');
  const [proxy, setProxy] = useState('https://api.allorigins.win/raw?url=');
  const [status, setStatus] = useState<'idle' | 'fetching' | 'parsing' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScrapeResult | null>(null);
  const [showRaw, setShowRaw] = useState(false);
  const [limit, setLimit] = useState(12);

  const fetchPage = async (proxyUrl: string, targetUser: string) => {
    const targetUrl = `https://insta-stories-viewer.com/${targetUser}/`;
    const finalUrl = proxyUrl ? `${proxyUrl}${encodeURIComponent(targetUrl)}` : targetUrl;
    
    setStatus('fetching');
    try {
      const response = await fetch(finalUrl);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const html = await response.text();
      return html;
    } catch (err) {
      console.error("Fetch failed:", err);
      throw new Error("Failed to fetch page. Try a different CORS proxy or check the username.");
    }
  };

  const parseHtmlForMedia = (html: string): ScrapeResult => {
    setStatus('parsing');
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const items: MediaItem[] = [];
    const rawJson: any[] = [];
    const stats = { ldJson: 0, inlineJson: 0, dom: 0 };

    // Strategy A: JSON-LD
    const ldScripts = doc.querySelectorAll('script[type="application/ld+json"]');
    ldScripts.forEach(script => {
      try {
        const json = JSON.parse(script.textContent || '');
        rawJson.push(json);
        
        // Recursive search for image/video URLs in JSON-LD
        const findMedia = (obj: any) => {
          if (!obj || typeof obj !== 'object') return;
          
          if (obj.contentUrl || obj.url) {
            const url = obj.contentUrl || obj.url;
            if (typeof url === 'string' && (url.includes('.jpg') || url.includes('.png') || url.includes('.mp4') || url.includes('cdninstagram'))) {
              items.push({
                url,
                type: url.includes('.mp4') ? 'video' : 'image',
                source: 'ld+json'
              });
              stats.ldJson++;
            }
          }
          
          Object.values(obj).forEach(val => findMedia(val));
        };
        findMedia(json);
      } catch (e) {
        console.warn("Failed to parse JSON-LD", e);
      }
    });

    // Strategy B: Inline JS JSON blobs
    const scripts = doc.querySelectorAll('script');
    scripts.forEach(script => {
      const content = script.textContent || '';
      // Look for common IG viewer patterns or sharedData
      const jsonMatch = content.match(/window\._sharedData\s*=\s*({.*?});/s) || 
                        content.match(/__INITIAL_STATE__\s*=\s*({.*?});/s) ||
                        content.match(/const\s+data\s*=\s*({.*?});/s);
      
      if (jsonMatch && jsonMatch[1]) {
        try {
          const json = JSON.parse(jsonMatch[1]);
          rawJson.push(json);
          
          const findMedia = (obj: any) => {
            if (!obj || typeof obj !== 'object') return;
            if (typeof obj.display_url === 'string') {
              items.push({ url: obj.display_url, type: 'image', source: 'inline-json' });
              stats.inlineJson++;
            }
            if (typeof obj.video_url === 'string') {
              items.push({ url: obj.video_url, type: 'video', source: 'inline-json' });
              stats.inlineJson++;
            }
            Object.values(obj).forEach(val => findMedia(val));
          };
          findMedia(json);
        } catch (e) {
          console.warn("Failed to parse inline JSON", e);
        }
      }
    });

    // Strategy C: DOM Fallback
    // Images
    doc.querySelectorAll('img').forEach(img => {
      const src = img.src || img.getAttribute('data-src');
      if (src && !src.startsWith('data:') && (src.includes('cdninstagram') || src.includes('.jpg'))) {
        items.push({ url: src, type: 'image', source: 'dom' });
        stats.dom++;
      }
    });
    // Videos
    doc.querySelectorAll('video, source').forEach(v => {
      const src = (v as HTMLVideoElement).src || v.getAttribute('src');
      if (src && (src.includes('.mp4') || src.includes('cdninstagram'))) {
        items.push({ url: src, type: 'video', source: 'dom' });
        stats.dom++;
      }
    });

    return {
      items: deduplicateMedia(items),
      rawJson,
      stats
    };
  };

  const handleScrape = async () => {
    if (!username) {
      toast.error("Please enter a username");
      return;
    }

    setError(null);
    setResult(null);
    
    try {
      const html = await fetchPage(proxy, username);
      const data = parseHtmlForMedia(html);
      
      if (data.items.length === 0) {
        setError("No media found. The profile might be private or the site structure has changed.");
        setStatus('error');
      } else {
        setResult(data);
        setStatus('success');
        toast.success(`Found ${data.items.length} media items!`);
      }
    } catch (err: any) {
      setError(err.message);
      setStatus('error');
      toast.error(err.message);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("URL copied to clipboard");
  };

  const visibleItems = useMemo(() => {
    return result?.items.slice(0, limit) || [];
  }, [result, limit]);

  return (
    <div className="space-y-12 max-w-7xl mx-auto p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-5xl md:text-7xl font-heading font-black uppercase tracking-tighter">INSTA EXPLORER</h2>
          <p className="text-black font-black uppercase tracking-[0.4em] text-sm border-l-8 border-primary pl-6 mt-4">
            PUBLIC MEDIA EXTRACTION TERMINAL
          </p>
        </div>
        <Badge variant="outline" className="brutalist-border bg-black text-white px-4 py-2 font-black">
          v1.0.4-STABLE
        </Badge>
      </div>

      {/* Controls */}
      <Card className="brutalist-card bg-white overflow-hidden">
        <CardHeader className="bg-black text-white border-b-4 border-black">
          <CardTitle className="text-2xl font-heading font-black uppercase flex items-center gap-3">
            <Globe className="h-6 w-6" /> MISSION PARAMETERS
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <Label className="text-xs font-black uppercase tracking-widest">TARGET USERNAME</Label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-black/40" />
                <Input 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. kyliejenner"
                  className="brutalist-border h-16 pl-12 text-xl font-black rounded-none"
                />
              </div>
            </div>
            <div className="space-y-4">
              <Label className="text-xs font-black uppercase tracking-widest">CORS PROXY (OPTIONAL)</Label>
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-black/40" />
                <Input 
                  value={proxy}
                  onChange={(e) => setProxy(e.target.value)}
                  placeholder="https://api.allorigins.win/raw?url="
                  className="brutalist-border h-16 pl-12 text-sm font-black rounded-none"
                />
              </div>
            </div>
          </div>
          <Button 
            onClick={handleScrape}
            disabled={status === 'fetching' || status === 'parsing'}
            className="w-full h-20 brutalist-border bg-primary text-black text-2xl font-black uppercase hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50"
          >
            {status === 'fetching' || status === 'parsing' ? (
              <>
                <Loader2 className="mr-4 h-8 w-8 animate-spin" />
                {status.toUpperCase()}...
              </>
            ) : (
              'EXECUTE EXTRACTION'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Status & Stats */}
      {result && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="brutalist-card bg-primary p-6 flex flex-col justify-center items-center text-center">
            <span className="text-4xl font-black">{result.items.length}</span>
            <span className="text-xs font-black uppercase tracking-widest">TOTAL ITEMS</span>
          </div>
          <div className="brutalist-card bg-white p-6 flex flex-col justify-center items-center text-center">
            <span className="text-4xl font-black">{result.stats.ldJson}</span>
            <span className="text-xs font-black uppercase tracking-widest">LD+JSON</span>
          </div>
          <div className="brutalist-card bg-white p-6 flex flex-col justify-center items-center text-center">
            <span className="text-4xl font-black">{result.stats.inlineJson}</span>
            <span className="text-xs font-black uppercase tracking-widest">INLINE JSON</span>
          </div>
          <div className="brutalist-card bg-white p-6 flex flex-col justify-center items-center text-center">
            <span className="text-4xl font-black">{result.stats.dom}</span>
            <span className="text-xs font-black uppercase tracking-widest">DOM SCAN</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="brutalist-card bg-red-500 text-white p-10 flex items-center gap-8">
          <AlertCircle className="h-16 w-16 shrink-0" />
          <div>
            <h3 className="text-3xl font-heading font-black uppercase mb-2">EXTRACTION FAILED</h3>
            <p className="font-bold uppercase tracking-widest opacity-90">{error}</p>
            <Button 
              variant="outline" 
              className="mt-6 border-2 border-white text-white hover:bg-white hover:text-red-500 font-black"
              onClick={handleScrape}
            >
              RETRY MISSION
            </Button>
          </div>
        </div>
      )}

      {/* Results Grid */}
      {result && (
        <div className="space-y-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {visibleItems.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="group relative brutalist-card bg-black overflow-hidden aspect-square"
              >
                {item.type === 'image' ? (
                  <img 
                    src={item.url} 
                    alt={`Result ${idx}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <video 
                    src={item.url} 
                    controls 
                    preload="metadata"
                    className="w-full h-full object-cover"
                  />
                )}
                
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="icon" className="h-10 w-10 brutalist-border bg-white text-black" onClick={() => copyToClipboard(item.url)}>
                    <Copy className="h-5 w-5" />
                  </Button>
                  <Button size="icon" className="h-10 w-10 brutalist-border bg-primary text-black" onClick={() => window.open(item.url, '_blank')}>
                    <ExternalLink className="h-5 w-5" />
                  </Button>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/80 backdrop-blur-sm translate-y-full group-hover:translate-y-0 transition-transform">
                  <div className="flex justify-between items-center">
                    <Badge className="bg-primary text-black font-black uppercase text-[10px]">
                      {item.source}
                    </Badge>
                    <span className="text-[10px] text-white font-black uppercase tracking-widest">
                      {item.type}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {result.items.length > limit && (
            <div className="flex justify-center pt-8">
              <Button 
                onClick={() => setLimit(prev => prev + 12)}
                className="h-20 px-16 brutalist-border bg-black text-white text-xl font-black uppercase hover:bg-primary hover:text-black transition-all"
              >
                LOAD MORE INTEL
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Debug Panel */}
      {result && (
        <Card className="brutalist-card bg-white">
          <CardHeader 
            className="cursor-pointer hover:bg-muted transition-colors border-b-4 border-black"
            onClick={() => setShowRaw(!showRaw)}
          >
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl font-heading font-black uppercase flex items-center gap-3">
                <Code className="h-6 w-6" /> RAW DATA LOGS (DEBUG)
              </CardTitle>
              {showRaw ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
            </div>
          </CardHeader>
          <AnimatePresence>
            {showRaw && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <CardContent className="p-0">
                  <ScrollArea className="h-[500px] bg-black p-8">
                    <pre className="text-green-500 font-mono text-xs leading-relaxed">
                      {JSON.stringify(result.rawJson, null, 2)}
                    </pre>
                  </ScrollArea>
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      )}

      {/* Legal Disclaimer */}
      <div className="p-8 bg-muted brutalist-border border-dashed text-center">
        <p className="text-xs font-bold text-black/40 uppercase tracking-widest leading-relaxed">
          LEGAL NOTICE: THIS TOOL IS FOR EDUCATIONAL PURPOSES ONLY. <br />
          ONLY ACCESS PUBLIC CONTENT. RESPECT INSTAGRAM'S TERMS OF SERVICE AND USER PRIVACY. <br />
          DO NOT USE FOR UNAUTHORIZED DATA SCRAPING OR REDISTRIBUTION.
        </p>
      </div>
    </div>
  );
};

export default InstagramScraper;
