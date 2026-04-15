import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Scissors, 
  Calendar as CalendarIcon, 
  MapPin, 
  User, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Clock,
  CheckCircle2,
  ChevronRight,
  Star,
  Navigation,
  History,
  Users,
  Home,
  LayoutGrid
} from 'lucide-react';
import { auth, db, OperationType, handleFirestoreError } from './firebase';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc, collection, query, where, onSnapshot, addDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { UserProfile, Service, Booking, BookingType, BookingStatus, BarberLocation } from './types';
import { SERVICES, CATEGORIES } from './constants';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Toaster, toast } from 'sonner';
import { format, addDays, startOfToday, isAfter, parseISO } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { cn } from '@/lib/utils';

import { Skeleton } from '@/components/ui/skeleton';

import { fetchSocialProfile, SocialProfileData } from './services/socialService';

// --- Components ---

const SocialFeed = ({ platform, handle }: { platform: 'instagram' | 'facebook', handle: string }) => {
  const [data, setData] = useState<SocialProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const result = await fetchSocialProfile(platform, handle);
        setData(result);
      } catch (error) {
        console.error("Failed to fetch social data", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [platform, handle]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <BrutalistSkeleton key={i} className="aspect-square" />
        ))}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-6 p-6 brutalist-border bg-white">
        <Avatar className="h-20 w-20 brutalist-border">
          <AvatarImage src={data.profilePicUrl} />
          <AvatarFallback>{data.handle[0].toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="text-2xl font-heading font-black uppercase">{data.displayName}</h3>
          <p className="text-sm font-black text-black/60">@{data.handle} • {data.followers.toLocaleString()} FOLLOWERS</p>
          <p className="text-xs font-bold mt-2 max-w-md">{data.bio}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {data.posts.map(post => (
          <a 
            key={post.id} 
            href={post.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="group relative aspect-square brutalist-border overflow-hidden bg-black"
          >
            <img 
              src={post.imageUrl} 
              alt={post.caption} 
              className="w-full h-full object-cover group-hover:opacity-50 transition-opacity"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-white font-black text-sm">VIEW POST</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

const BrutalistSkeleton = ({ className }: { className?: string }) => (
  <div className={cn("relative overflow-hidden brutalist-border bg-muted/20", className)}>
    <Skeleton className="absolute inset-0 bg-primary/20 animate-pulse" />
    <div className="absolute inset-0 halftone opacity-10 pointer-events-none"></div>
  </div>
);

const StyleGallery = () => {
  const photos = [
    { src: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=800&auto=format&fit=crop', label: 'THE CRAFT' },
    { src: 'https://images.unsplash.com/photo-1621605815841-aa88c82b022c?q=80&w=800&auto=format&fit=crop', label: 'THE RESULT' },
    { src: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=800&auto=format&fit=crop', label: 'PRECISION' },
    { src: 'https://images.unsplash.com/photo-1599351431247-f5793384797d?q=80&w=800&auto=format&fit=crop', label: 'STYLE' },
  ];

  return (
    <section className="py-24 bg-background relative overflow-hidden neo-grid">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-6 mb-16">
          <div className="h-16 w-16 bg-primary brutalist-border -rotate-3 flex items-center justify-center">
            <Star className="h-8 w-8 text-black fill-black" />
          </div>
          <h2 className="text-5xl md:text-8xl font-heading font-black uppercase tracking-tighter">STYLE GALLERY</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
          {photos.map((photo, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="group relative"
            >
              <div className="brutalist-card overflow-hidden aspect-[3/4] relative">
                <img 
                  src={photo.src} 
                  alt={photo.label}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-110 group-hover:scale-100"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity halftone"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-black">
                  <span className="text-2xl font-heading font-black text-white">
                    {photo.label}
                  </span>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 bg-accent-pink text-white px-4 py-2 font-black text-sm brutalist-border-pink opacity-0 group-hover:opacity-100 transition-all z-10">
                0{idx + 1}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="space-y-12">
          <div className="flex items-center gap-6">
            <div className="h-12 w-12 bg-accent-pink brutalist-border rotate-3 flex items-center justify-center">
              <Scissors className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-4xl font-heading font-black uppercase tracking-tighter">LIVE FROM INSTAGRAM</h3>
          </div>
          <SocialFeed platform="instagram" handle="trimtime_official" />
        </div>
      </div>
    </section>
  );
};

const Navbar = ({ onOpenAuth, activeView, setView }: { onOpenAuth: () => void, activeView: ViewType, setView: (v: ViewType) => void }) => {
  const { user, profile } = useAuth();

  const handleSignOut = async () => {
    await signOut(auth);
    toast.success("Signed out successfully");
  };

  const navItems: { id: ViewType, label: string, icon: any }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'services', label: 'Services', icon: LayoutGrid },
    { id: 'bookings', label: 'Bookings', icon: CalendarIcon },
  ];

  if (profile?.role === 'barber') {
    navItems.push({ id: 'staff', label: 'Staff', icon: Users });
  }

  if (user) {
    navItems.push({ id: 'settings', label: 'Settings', icon: Settings });
  }

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b-4 border-black bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 flex h-16 md:h-24 items-center justify-between">
          <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setView('home')}>
            <div className="h-10 w-10 md:h-14 md:w-14 bg-primary flex items-center justify-center brutalist-border -rotate-3 group-hover:rotate-0 transition-transform">
              <Scissors className="h-6 w-6 md:h-8 md:w-8 text-black" />
            </div>
            <span className="text-3xl md:text-5xl font-heading font-black tracking-tighter uppercase text-black">
              TRIM<span className="text-primary brutalist-shadow px-1 ml-1">TIME</span>
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-10">
            <div className="flex gap-10 text-sm uppercase font-black">
              {navItems.map(item => (
                <button 
                  key={item.id}
                  onClick={() => setView(item.id)}
                  className={`hover:text-primary transition-all relative ${activeView === item.id ? 'text-black' : 'text-muted-foreground'}`}
                >
                  {item.label}
                  {activeView === item.id && (
                    <motion.div layoutId="nav-underline" className="absolute -bottom-2 left-0 right-0 h-1 bg-black" />
                  )}
                </button>
              ))}
            </div>
            <div className="h-8 w-1 bg-black/10" />
            {user ? (
              <div className="flex items-center gap-6">
                <div className="flex flex-col items-end">
                  <span className="text-xs font-black uppercase tracking-widest text-black">{profile?.displayName || user.displayName}</span>
                  <span className="text-[10px] text-white uppercase tracking-widest bg-accent-pink px-2 py-0.5 brutalist-border">
                    {profile?.role || 'Customer'}
                  </span>
                </div>
                <Avatar className="h-12 w-12 rounded-none brutalist-border">
                  <AvatarImage src={user.photoURL || ''} />
                  <AvatarFallback className="rounded-none bg-muted font-black">{user.displayName?.charAt(0)}</AvatarFallback>
                </Avatar>
                <Button variant="ghost" size="icon" className="hover:bg-accent-pink hover:text-white h-12 w-12 brutalist-border" onClick={handleSignOut}>
                  <LogOut className="h-6 w-6" />
                </Button>
              </div>
            ) : (
              <Button className="rounded-none px-10 h-14 text-sm font-black uppercase brutalist-border bg-primary text-black hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all" onClick={onOpenAuth}>
                SIGN IN
              </Button>
            )}
          </div>

          {/* Mobile Profile/Sign In */}
          <div className="md:hidden flex items-center gap-4">
            {user ? (
              <Avatar className="h-10 w-10 rounded-none brutalist-border" onClick={handleSignOut}>
                <AvatarImage src={user.photoURL || ''} />
                <AvatarFallback className="rounded-none text-xs font-black">{user.displayName?.charAt(0)}</AvatarFallback>
              </Avatar>
            ) : (
              <Button variant="ghost" size="icon" className="h-10 w-10 brutalist-border bg-primary" onClick={onOpenAuth}>
                <User className="h-6 w-6 text-black" />
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation - Elevated UX */}
      <div className="md:hidden fixed bottom-6 left-6 right-6 z-50">
        <div className="bg-white brutalist-border flex items-center justify-around h-20 px-4">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`flex flex-col items-center justify-center gap-1 transition-all ${activeView === item.id ? 'text-primary scale-110' : 'text-muted-foreground'}`}
            >
              <div className={`p-2 brutalist-border ${activeView === item.id ? 'bg-black text-primary' : 'bg-white text-black'}`}>
                <item.icon className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-tighter">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

const ServiceCard = ({ service, onBook }: { service: Service, onBook: (s: Service) => void }) => (
  <Card className="brutalist-card overflow-hidden group">
    <CardHeader className="p-0">
      <div className="h-64 bg-muted relative overflow-hidden border-b-4 border-black">
        {/* Synchronous Barber/Trim Photos */}
        <img 
          src={`https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=600&auto=format&fit=crop&seed=${service.id}-barber`} 
          alt="Barber at work"
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-0"
          referrerPolicy="no-referrer"
        />
        <img 
          src={`https://images.unsplash.com/photo-1621605815841-aa88c82b022c?q=80&w=600&auto=format&fit=crop&seed=${service.id}-trim`} 
          alt="Finished trim"
          className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 halftone opacity-10 pointer-events-none"></div>
        <Badge className="absolute top-4 right-4 rounded-none bg-black text-white uppercase text-xs font-black px-4 py-2 brutalist-border-pink z-10">
          {service.category}
        </Badge>
        <div className="absolute bottom-4 left-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="bg-primary text-black px-4 py-1 text-xs font-black uppercase brutalist-border">
            RESULT REVEALED !!!
          </span>
        </div>
      </div>
    </CardHeader>
    <CardContent className="p-8">
      <div className="flex justify-between items-start mb-6">
        <CardTitle className="text-4xl font-heading font-black uppercase leading-none">{service.name}</CardTitle>
        <span className="font-mono text-3xl text-black font-black bg-primary px-2 brutalist-border">${service.price}</span>
      </div>
      <CardDescription className="line-clamp-2 mb-8 text-black font-sans font-bold text-lg leading-tight border-l-4 border-black pl-4">
        {service.description}
      </CardDescription>
      <div className="flex items-center justify-between text-xs uppercase font-black">
        <div className="flex items-center gap-2 bg-muted px-3 py-2 brutalist-border">
          <Clock className="h-4 w-4 text-black" /> {service.duration} MIN
        </div>
        <div className="flex items-center gap-2 bg-accent-pink text-white px-3 py-2 brutalist-border">
          <Star className="h-4 w-4 fill-white" /> 4.9 RATING
        </div>
      </div>
    </CardContent>
    <CardFooter className="p-8 pt-0">
      <Button className="w-full rounded-none h-16 font-black uppercase text-lg brutalist-border bg-black text-white hover:bg-primary hover:text-black transition-all" onClick={() => onBook(service)}>
        SELECT SERVICE
      </Button>
    </CardFooter>
  </Card>
);

const BookingBox = ({ onBook }: { onBook: (s: Service) => void }) => {
  const [activeService, setActiveService] = useState<Service>(SERVICES[0]);
  const [isHovering, setIsHovering] = useState(false);

  return (
    <section className="py-24 bg-background neo-grid">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row border-4 border-black bg-white overflow-hidden min-h-[600px] brutalist-shadow-lg">
            {/* Left Side: Service Selection */}
            <div className="w-full lg:w-1/2 p-8 md:p-16 flex flex-col justify-center border-b-4 lg:border-b-0 lg:border-r-4 border-black">
              <div className="mb-12">
                <div className="inline-block bg-accent-pink text-white px-6 py-2 mb-6 brutalist-border">
                  <span className="block uppercase font-black text-xs tracking-widest">
                    SELECT YOUR MISSION
                  </span>
                </div>
                <h2 className="text-6xl md:text-8xl font-heading font-black tracking-tighter uppercase leading-[0.9]">
                  CHOOSE <br />
                  <span className="text-primary brutalist-shadow px-2">YOUR CUT.</span>
                </h2>
              </div>

              {/* Desktop: List with Hover */}
              <div className="hidden lg:flex flex-col gap-4">
                {SERVICES.map((service) => (
                  <motion.div
                    key={service.id}
                    onMouseEnter={() => {
                      setActiveService(service);
                      setIsHovering(true);
                    }}
                    onMouseLeave={() => setIsHovering(false)}
                    onClick={() => onBook(service)}
                    className={`group relative p-8 cursor-pointer transition-all duration-200 border-3 ${
                      activeService.id === service.id 
                        ? 'border-black bg-primary translate-x-4 brutalist-shadow' 
                        : 'border-black/5 hover:border-black hover:bg-muted hover:translate-x-2'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className={`text-4xl font-heading font-black transition-colors uppercase ${activeService.id === service.id ? 'text-black' : 'group-hover:text-black'}`}>
                          {service.name}
                        </h3>
                        <p className="text-sm font-mono text-black/60 mt-2 uppercase font-black">
                          {service.duration} MIN • ${service.price}
                        </p>
                      </div>
                      <ChevronRight className={`h-10 w-10 transition-all ${activeService.id === service.id ? 'translate-x-0 text-black scale-125' : '-translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'}`} />
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Mobile: Dropdown/Select */}
              <div className="lg:hidden space-y-8">
                <Select 
                  onValueChange={(val) => setActiveService(SERVICES.find(s => s.id === val)!)}
                  value={activeService.id}
                >
                  <SelectTrigger className="h-20 rounded-none border-4 border-black bg-white text-2xl font-heading font-black uppercase">
                    <SelectValue placeholder="Choose a service" />
                  </SelectTrigger>
                  <SelectContent className="rounded-none border-4 border-black bg-white">
                    {SERVICES.map((service) => (
                      <SelectItem key={service.id} value={service.id} className="h-16 font-heading font-black text-xl uppercase">
                        {service.name} — ${service.price}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  className="w-full h-20 rounded-none text-2xl font-black uppercase brutalist-border bg-black text-white active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
                  onClick={() => onBook(activeService)}
                >
                  BOOK {activeService.name} !!!
                </Button>
              </div>
            </div>

            {/* Right Side: Dynamic Visual */}
            <div className="w-full lg:w-1/2 relative bg-muted overflow-hidden group">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeService.id}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.4, ease: "backOut" }}
                  className="absolute inset-0"
                >
                  <img 
                    src={`https://images.unsplash.com/photo-1593702295094-ada74bc4a149?q=80&w=800&auto=format&fit=crop&seed=${activeService.id}-process`} 
                    alt="Process"
                    className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 group-hover:opacity-0"
                    referrerPolicy="no-referrer"
                  />
                  <img 
                    src={`https://images.unsplash.com/photo-1512690196252-741d2fd3f305?q=80&w=800&auto=format&fit=crop&seed=${activeService.id}-result`} 
                    alt="Result"
                    className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-1000"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 halftone opacity-10"></div>
                </motion.div>
              </AnimatePresence>

              {/* Overlay Info */}
              <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 bg-black/40 backdrop-blur-sm">
                <motion.div
                  key={`info-${activeService.id}`}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="inline-block bg-primary text-black px-4 py-1 mb-6 brutalist-border">
                    <span className="block text-xs uppercase font-black">
                      {activeService.category}
                    </span>
                  </div>
                  <h4 className="text-6xl font-heading font-black mb-6 text-white uppercase leading-none">{activeService.name}</h4>
                  <p className="text-white text-xl max-w-md leading-tight mb-10 font-bold border-l-8 border-primary pl-6">
                    {activeService.description}
                  </p>
                  <div className="flex items-center gap-8 text-sm font-mono font-black uppercase">
                    <div className="flex items-center gap-3 bg-white px-4 py-3 brutalist-border text-black">
                      <Clock className="h-5 w-5" /> {activeService.duration} MIN
                    </div>
                    <div className="flex items-center gap-3 bg-accent-pink px-4 py-3 brutalist-border text-white">
                      <CheckCircle2 className="h-5 w-5" /> ELITE STATUS
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute top-12 right-12 border-4 border-black p-6 backdrop-blur-sm hidden md:block rotate-6 bg-white brutalist-shadow">
                <span className="text-sm uppercase font-black text-black">TRIM TIME STUDIO</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const BookingDialog = ({ 
  service, 
  isOpen, 
  onClose,
  onConfirm 
}: { 
  service: Service | null, 
  isOpen: boolean, 
  onClose: () => void,
  onConfirm: (booking: Partial<Booking>) => void
}) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState("10:00");
  const [type, setType] = useState<BookingType>("salon");
  const [address, setAddress] = useState("");

  if (!service) return null;

  const handleConfirm = () => {
    if (!date) return;
    onConfirm({
      serviceId: service.id,
      date: format(date, 'yyyy-MM-dd'),
      time,
      type,
      location: type === 'home' ? { lat: 0, lng: 0, address } : undefined,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] rounded-none border-4 border-black bg-white p-0 overflow-hidden brutalist-shadow-lg">
        <DialogHeader className="p-8 bg-primary border-b-4 border-black">
          <DialogTitle className="text-5xl font-heading font-black uppercase leading-none">BOOK MISSION</DialogTitle>
          <DialogDescription className="font-black text-black uppercase tracking-widest text-xs mt-2">
            PREPARING FOR: {service.name}
          </DialogDescription>
        </DialogHeader>
        <div className="p-8 space-y-8">
          <div className="grid gap-3">
            <Label className="font-black uppercase tracking-widest text-xs">SERVICE MODE</Label>
            <Select 
              defaultValue={type}
              onValueChange={(v: BookingType) => setType(v)}
            >
              <SelectTrigger className="rounded-none border-3 border-black bg-white h-16 font-black text-lg">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="rounded-none border-3 border-black bg-white">
                <SelectItem value="salon" className="font-black uppercase">AT THE STUDIO</SelectItem>
                <SelectItem value="home" className="font-black uppercase">HOME INVASION</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {type === 'home' && (
            <div className="grid gap-3">
              <Label htmlFor="address" className="font-black uppercase tracking-widest text-xs">TARGET LOCATION</Label>
              <Input 
                id="address" 
                placeholder="WHERE SHOULD WE DROP IN?" 
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="rounded-none border-3 border-black h-16 font-black text-lg placeholder:text-black/30"
              />
            </div>
          )}

          <div className="grid gap-3">
            <Label className="font-black uppercase tracking-widest text-xs">DEPLOYMENT DATE</Label>
            <div className="brutalist-border p-4 bg-white">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => setDate(d || undefined)}
                className="rounded-none mx-auto"
                disabled={(date) => date < startOfToday()}
              />
            </div>
          </div>

          <div className="grid gap-3">
            <Label className="font-black uppercase tracking-widest text-xs">EXTRACTION TIME</Label>
            <Select 
              defaultValue={time}
              onValueChange={setTime}
            >
              <SelectTrigger className="rounded-none border-3 border-black bg-white h-16 font-black text-lg">
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent className="rounded-none border-3 border-black bg-white">
                {Array.from({ length: 11 }).map((_, i) => {
                  const hour = 9 + i;
                  return (
                    <React.Fragment key={hour}>
                      <SelectItem value={`${hour}:00`} className="font-black">{hour}:00</SelectItem>
                      <SelectItem value={`${hour}:30`} className="font-black">{hour}:30</SelectItem>
                    </React.Fragment>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter className="p-8 bg-muted border-t-4 border-black flex-col sm:flex-row gap-4">
          <Button variant="outline" className="h-16 rounded-none border-3 border-black font-black uppercase flex-1" onClick={onClose}>ABORT</Button>
          <Button className="h-16 rounded-none border-3 border-black bg-black text-white font-black uppercase flex-1 hover:bg-primary hover:text-black transition-all" onClick={handleConfirm}>CONFIRM DEPLOYMENT</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const TrackingMap = ({ barberId, bookingId }: { barberId: string, bookingId: string }) => {
  const [location, setLocation] = useState<BarberLocation | null>(null);
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'barberLocations', barberId), (docSnap) => {
      if (docSnap.exists()) {
        setLocation(docSnap.data() as BarberLocation);
      }
    });
    return () => unsub();
  }, [barberId]);

  if (!apiKey) {
    return (
      <div className="h-64 bg-muted rounded-none border-2 border-dashed flex items-center justify-center p-6 text-center">
        <div className="space-y-2">
          <MapPin className="h-8 w-8 mx-auto text-muted-foreground opacity-50" />
          <p className="text-sm font-serif italic">Google Maps API Key not configured.</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Please add VITE_GOOGLE_MAPS_API_KEY to secrets.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-64 bg-muted rounded-none overflow-hidden border-2">
      {location ? (
        <Map
          defaultCenter={{ lat: location.lat, lng: location.lng }}
          defaultZoom={15}
          gestureHandling={'greedy'}
          disableDefaultUI={true}
          mapId="barber-tracking-map"
        >
          <AdvancedMarker position={{ lat: location.lat, lng: location.lng }}>
            <div className="relative">
              <div className="absolute -inset-4 bg-primary/20 rounded-full animate-ping" />
              <Pin background={'#D4AF37'} glyphColor={'#000'} borderColor={'#000'} />
            </div>
          </AdvancedMarker>
        </Map>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50 backdrop-blur-sm z-10">
          <div className="text-center p-4">
            <Navigation className="h-10 w-10 mx-auto mb-2 text-primary animate-pulse" />
            <h4 className="font-bold font-serif italic">Locating Barber...</h4>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Waiting for live signal</p>
          </div>
        </div>
      )}
      
      <div className="absolute bottom-4 left-4 z-10">
        <Badge className="bg-background/80 backdrop-blur border-primary/20 text-primary rounded-none text-[10px] tracking-widest uppercase">
          Live GPS
        </Badge>
      </div>
      
      {location && (
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-background/80 backdrop-blur p-2 border border-primary/20 text-[9px] uppercase tracking-widest font-bold">
            Updated: {new Date(location.lastUpdated).toLocaleTimeString()}
          </div>
        </div>
      )}
    </div>
  );
};

// --- Main App Component ---

type ViewType = 'home' | 'services' | 'bookings' | 'staff' | 'settings';

export default function App() {
  const { user, profile, loading, isAuthReady } = useAuth();
  const [activeView, setActiveView] = useState<ViewType>('home');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [staffBookings, setStaffBookings] = useState<Booking[]>([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isTrackingActive, setIsTrackingActive] = useState(false);
  const [isBookingsLoading, setIsBookingsLoading] = useState(true);
  const [isStaffBookingsLoading, setIsStaffBookingsLoading] = useState(true);

  // Fetch customer bookings
  useEffect(() => {
    if (user && isAuthReady) {
      setIsBookingsLoading(true);
      const q = query(collection(db, 'bookings'), where('customerId', '==', user.uid));
      const unsub = onSnapshot(q, (snap) => {
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
        setBookings(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        setIsBookingsLoading(false);
      }, (err) => {
        handleFirestoreError(err, OperationType.LIST, 'bookings');
        setIsBookingsLoading(false);
      });
      return () => unsub();
    } else if (isAuthReady && !user) {
      setIsBookingsLoading(false);
    }
  }, [user, isAuthReady]);

  // Fetch staff bookings
  useEffect(() => {
    if (user && profile?.role === 'barber' && isAuthReady) {
      setIsStaffBookingsLoading(true);
      const q = query(collection(db, 'bookings'), where('barberId', '==', user.uid));
      const unsub = onSnapshot(q, (snap) => {
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
        setStaffBookings(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        setIsStaffBookingsLoading(false);
      }, (err) => {
        handleFirestoreError(err, OperationType.LIST, 'bookings');
        setIsStaffBookingsLoading(false);
      });
      return () => unsub();
    } else if (isAuthReady) {
      setIsStaffBookingsLoading(false);
    }
  }, [user, profile, isAuthReady]);

  // Real-time location update for barber
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTrackingActive && user && profile?.role === 'barber') {
      interval = setInterval(() => {
        updateBarberLocation();
      }, 5000); // Update every 5 seconds
    }
    return () => clearInterval(interval);
  }, [isTrackingActive, user, profile]);

  const handleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const userRef = doc(db, 'users', result.user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
          role: 'customer',
          createdAt: new Date().toISOString()
        });
      }
      setIsAuthModalOpen(false);
      toast.success("Welcome to TrimTime!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to sign in");
    }
  };

  const handleBookService = (service: Service) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    setSelectedService(service);
    setIsBookingOpen(true);
  };

  const confirmBooking = async (bookingData: Partial<Booking>) => {
    if (!user) return;
    try {
      const bookingId = `${user.uid}_default-barber-id`; // Predictable ID for rules
      const newBooking: Booking = {
        id: bookingId,
        customerId: user.uid,
        barberId: 'default-barber-id',
        serviceId: bookingData.serviceId!,
        date: bookingData.date!,
        time: bookingData.time!,
        status: 'pending',
        type: bookingData.type!,
        location: bookingData.location,
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'bookings', bookingId), newBooking);
      setIsBookingOpen(false);
      toast.success("Booking requested successfully!");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'bookings');
    }
  };

  const updateBookingStatus = async (bookingId: string, status: BookingStatus) => {
    try {
      await updateDoc(doc(db, 'bookings', bookingId), { status });
      if (status === 'completed' || status === 'cancelled') {
        setIsTrackingActive(false);
      }
      toast.success(`Booking ${status}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'bookings');
    }
  };

  const updateBarberLocation = async () => {
    if (!user || profile?.role !== 'barber') return;
    
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          await setDoc(doc(db, 'barberLocations', user.uid), {
            barberId: user.uid,
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            lastUpdated: new Date().toISOString()
          });
        } catch (error) {
          console.error("Location update failed:", error);
        }
      }, (err) => {
        console.error("Geolocation error:", err);
        setIsTrackingActive(false);
        toast.error("Please enable location permissions");
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Scissors className="h-12 w-12 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}>
      <div className="min-h-screen bg-background font-sans antialiased selection:bg-primary selection:text-primary-foreground pb-20 md:pb-0">
        <Navbar onOpenAuth={() => setIsAuthModalOpen(true)} activeView={activeView} setView={setActiveView} />
        <Toaster position="top-center" theme="dark" />

      <main className="relative">
        <AnimatePresence mode="wait">
          {activeView === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.4 }}
            >
              <section className="py-12 md:py-32 relative overflow-hidden neo-grid">
                <div className="container mx-auto px-4 relative z-10">
                  <div className="mb-20">
                    <h2 className="text-6xl md:text-9xl font-heading font-black mb-4 text-black uppercase tracking-tighter">SETTINGS</h2>
                    <p className="text-black font-black uppercase tracking-[0.4em] text-sm border-l-8 border-primary pl-6">CONFIGURE YOUR PROFILE & CONNECTIONS</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <Card className="brutalist-card bg-white">
                      <CardHeader className="border-b-4 border-black bg-black text-white">
                        <CardTitle className="text-3xl font-heading font-black uppercase">PROFILE DATA</CardTitle>
                      </CardHeader>
                      <CardContent className="p-10 space-y-8">
                        <div className="space-y-4">
                          <Label className="text-xs font-black uppercase tracking-widest">DISPLAY NAME</Label>
                          <Input 
                            defaultValue={profile?.displayName || user?.displayName || ''} 
                            className="brutalist-border rounded-none h-14 font-black"
                          />
                        </div>
                        <div className="space-y-4">
                          <Label className="text-xs font-black uppercase tracking-widest">PHONE NUMBER</Label>
                          <Input 
                            defaultValue={profile?.phoneNumber || ''} 
                            placeholder="+1 (555) 000-0000"
                            className="brutalist-border rounded-none h-14 font-black"
                          />
                        </div>
                        <div className="space-y-4">
                          <Label className="text-xs font-black uppercase tracking-widest">BIO / STATUS</Label>
                          <Input 
                            placeholder="Tell the world who you are..."
                            className="brutalist-border rounded-none h-14 font-black"
                          />
                        </div>
                        <Button className="w-full h-16 brutalist-border bg-primary text-black font-black uppercase hover:translate-x-1 hover:translate-y-1 transition-all">
                          SAVE PROFILE
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="brutalist-card bg-white">
                      <CardHeader className="border-b-4 border-black bg-accent-pink text-white">
                        <CardTitle className="text-3xl font-heading font-black uppercase">SOCIAL SYNC</CardTitle>
                      </CardHeader>
                      <CardContent className="p-10 space-y-8">
                        <div className="space-y-4">
                          <Label className="text-xs font-black uppercase tracking-widest">INSTAGRAM HANDLE</Label>
                          <div className="flex gap-4">
                            <Input 
                              placeholder="@username" 
                              className="brutalist-border rounded-none h-14 font-black"
                              defaultValue="trimtime_official"
                            />
                            <Button className="h-14 px-8 brutalist-border bg-black text-white font-black">SYNC</Button>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <Label className="text-xs font-black uppercase tracking-widest">FACEBOOK PAGE</Label>
                          <div className="flex gap-4">
                            <Input 
                              placeholder="page-url" 
                              className="brutalist-border rounded-none h-14 font-black"
                              defaultValue="trimtime.grooming"
                            />
                            <Button className="h-14 px-8 brutalist-border bg-black text-white font-black">SYNC</Button>
                          </div>
                        </div>
                        <div className="p-6 bg-muted brutalist-border border-dashed">
                          <p className="text-xs font-bold text-black/60 uppercase leading-relaxed">
                            Linking your social accounts allows customers to see your latest work directly in the Style Gallery.
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="brutalist-card bg-white">
                      <CardHeader className="border-b-4 border-black bg-primary text-black">
                        <CardTitle className="text-3xl font-heading font-black uppercase">APP PREFERENCES</CardTitle>
                      </CardHeader>
                      <CardContent className="p-10 space-y-10">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label className="text-sm font-black uppercase">DARK MODE</Label>
                            <p className="text-[10px] font-bold text-black/40 uppercase">SWITCH TO THE DARK SIDE</p>
                          </div>
                          <Switch className="brutalist-border" />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label className="text-sm font-black uppercase">PUSH NOTIFICATIONS</Label>
                            <p className="text-[10px] font-bold text-black/40 uppercase">GET ALERTS FOR MISSIONS</p>
                          </div>
                          <Switch defaultChecked className="brutalist-border" />
                        </div>

                        <div className="space-y-6">
                          <div className="flex justify-between">
                            <Label className="text-sm font-black uppercase">MAP ZOOM LEVEL</Label>
                            <span className="text-xs font-black">15x</span>
                          </div>
                          <Slider defaultValue={[15]} max={20} step={1} className="py-4" />
                        </div>

                        <div className="space-y-4">
                          <Label className="text-sm font-black uppercase">ACCESSIBILITY</Label>
                          <div className="grid grid-cols-1 gap-4">
                            <div className="flex items-center space-x-3">
                              <Checkbox id="high-contrast" className="brutalist-border h-6 w-6" />
                              <label htmlFor="high-contrast" className="text-xs font-bold uppercase cursor-pointer">HIGH CONTRAST MODE</label>
                            </div>
                            <div className="flex items-center space-x-3">
                              <Checkbox id="reduced-motion" className="brutalist-border h-6 w-6" />
                              <label htmlFor="reduced-motion" className="text-xs font-bold uppercase cursor-pointer">REDUCED MOTION</label>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="brutalist-card bg-white">
                      <CardHeader className="border-b-4 border-black bg-black text-white">
                        <CardTitle className="text-3xl font-heading font-black uppercase">SECURITY & DATA</CardTitle>
                      </CardHeader>
                      <CardContent className="p-10 space-y-8">
                        <div className="space-y-4">
                          <Label className="text-xs font-black uppercase tracking-widest">DEFAULT BOOKING TYPE</Label>
                          <Select defaultValue="studio">
                            <SelectTrigger className="h-14 brutalist-border rounded-none font-black uppercase">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="brutalist-border rounded-none">
                              <SelectItem value="studio" className="font-black uppercase">STUDIO SESSION</SelectItem>
                              <SelectItem value="home" className="font-black uppercase">HOME INVASION</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="h-1 bg-black/5 halftone"></div>

                        <div className="space-y-4">
                          <Button variant="outline" className="w-full h-16 brutalist-border border-accent-pink text-accent-pink font-black uppercase hover:bg-accent-pink hover:text-white transition-all">
                            EXPORT DATA LOGS
                          </Button>
                          <Button variant="destructive" className="w-full h-16 brutalist-border bg-red-600 text-white font-black uppercase hover:translate-x-1 hover:translate-y-1 transition-all">
                            TERMINATE ACCOUNT
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </section>
            </motion.div>
          )}

          {activeView === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.4 }}
            >
              {/* Hero Section - Neo Brutalist Style */}
              <section className="relative h-[85vh] md:h-[95vh] flex items-center overflow-hidden border-b-8 border-black neo-grid">
                <div className="absolute inset-0 z-0 flex">
                  <div className="w-1/2 h-full relative overflow-hidden border-r-4 border-black">
                    <img 
                      src="https://images.unsplash.com/photo-1593702295094-ada74bc4a149?q=80&w=1200&auto=format&fit=crop" 
                      className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                      alt="Barber at work"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-primary/10 halftone opacity-20"></div>
                  </div>
                  <div className="w-1/2 h-full relative overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1512690196252-741d2fd3f305?q=80&w=1200&auto=format&fit=crop" 
                      className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                      alt="Finished trim"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-accent-pink/10 halftone opacity-20"></div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
                </div>
                
                <div className="container mx-auto px-4 relative z-10">
                  <motion.div
                    initial={{ opacity: 0, x: -100 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
                    className="max-w-5xl"
                  >
                    <div className="inline-block bg-black text-white px-8 py-3 mb-10 brutalist-border">
                      <span className="block font-black tracking-[0.3em] uppercase text-sm">
                        EST. 2024 // THE ELITE STANDARD
                      </span>
                    </div>
                    <h1 className="text-7xl md:text-[14rem] font-heading font-black leading-[0.8] mb-12 brutalist-shadow-lg text-black tracking-tighter uppercase">
                      EVOLVE <br />
                      <span className="text-primary brutalist-shadow px-4 ml-[-10px]">YOUR LOOK.</span>
                    </h1>
                    <p className="text-2xl md:text-5xl text-black font-heading font-black mb-16 max-w-3xl leading-none border-l-[12px] border-black pl-10 uppercase italic tracking-tighter">
                      WE DON'T JUST CUT HAIR. <br />
                      WE CRAFT LEGENDS.
                    </p>
                    <div className="flex flex-wrap gap-10">
                      <Button size="lg" className="rounded-none h-24 px-20 text-3xl font-black brutalist-border group relative overflow-hidden bg-primary text-black hover:translate-x-2 hover:translate-y-2 hover:shadow-none transition-all" onClick={() => setActiveView('services')}>
                        <span className="relative z-10">BEGIN TRANSFORMATION</span>
                      </Button>
                    </div>
                  </motion.div>
                </div>

                {/* Vertical Text Accent */}
                <div className="absolute top-0 right-16 h-full flex items-center pointer-events-none opacity-10">
                  <span className="text-[25vh] font-heading font-black text-black rotate-90 whitespace-nowrap tracking-tighter uppercase">
                    PRECISION // POWER // STYLE
                  </span>
                </div>
              </section>

              {/* Interactive Booking Box */}
              <BookingBox onBook={handleBookService} />

              {/* Style Gallery - Modern Anime Aesthetics */}
              <StyleGallery />
            </motion.div>
          )}

          {activeView === 'services' && (
            <motion.div
              key="services"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {/* Services Section - Visual Grid */}
              <section id="services-section" className="py-12 md:py-32 neo-grid">
                <div className="container mx-auto px-4">
                  <div className="flex flex-col md:flex-row justify-between items-end mb-16 md:mb-24 gap-8">
                    <div className="max-w-2xl">
                      <h2 className="text-5xl md:text-8xl font-heading font-black mb-6 uppercase tracking-tighter">SERVICE CATALOG</h2>
                      <p className="text-xl text-black font-bold border-l-8 border-primary pl-6">Explore our full range of premium grooming services. Each session is tailored to your unique style.</p>
                    </div>
                    <Tabs defaultValue="all" className="w-full md:w-auto">
                      <TabsList className="bg-white brutalist-border w-full md:w-auto p-1 h-auto">
                        <TabsTrigger value="all" className="flex-1 md:flex-none h-12 font-black uppercase data-[state=active]:bg-black data-[state=active]:text-white rounded-none">All</TabsTrigger>
                        {CATEGORIES.map(cat => (
                          <TabsTrigger key={cat} value={cat} className="flex-1 md:flex-none h-12 font-black uppercase data-[state=active]:bg-black data-[state=active]:text-white rounded-none">{cat}</TabsTrigger>
                        ))}
                      </TabsList>
                    </Tabs>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                    {SERVICES.map((service, idx) => (
                      <motion.div
                        key={service.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        viewport={{ once: true }}
                      >
                        <ServiceCard service={service} onBook={handleBookService} />
                      </motion.div>
                    ))}
                  </div>
                </div>
              </section>
            </motion.div>
          )}

          {activeView === 'bookings' && (
            <motion.div
              key="bookings"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4 }}
            >
              {/* Bookings Section - Manga Style */}
              <section className="py-12 md:py-24 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 halftone -rotate-12 pointer-events-none"></div>
                <div className="container mx-auto px-4 relative z-10">
                  <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-6 mb-16">
                      <div className="h-16 w-16 bg-accent-pink flex items-center justify-center manga-border-pink -rotate-6">
                        <History className="h-8 w-8 text-white" />
                      </div>
                      <h2 className="text-5xl md:text-7xl font-serif font-black skew-x-[-10deg] uppercase tracking-tighter">YOUR MISSIONS</h2>
                    </div>

                    {!user ? (
                      <Card className="manga-card text-center p-12 md:p-20 bg-card/50 backdrop-blur">
                        <CardHeader>
                          <CardTitle className="text-4xl font-serif skew-x-[-5deg] mb-4">ACCESS DENIED !!!</CardTitle>
                          <CardDescription className="text-lg font-bold text-white uppercase tracking-widest">
                            PLEASE SIGN IN TO VIEW YOUR DEPLOYMENT HISTORY.
                          </CardDescription>
                        </CardHeader>
                        <CardFooter className="justify-center pt-8">
                          <Button size="lg" className="manga-border h-16 px-16 text-xl font-black" onClick={() => setIsAuthModalOpen(true)}>SIGN IN NOW</Button>
                        </CardFooter>
                      </Card>
                    ) : isBookingsLoading ? (
                      <div className="space-y-12">
                        {[1, 2, 3].map((i) => (
                          <BrutalistSkeleton key={i} className="h-64 w-full" />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-12">
                        {bookings.length === 0 ? (
                          <div className="text-center py-24 manga-card border-dashed bg-muted/5">
                            <CalendarIcon className="h-16 w-16 mx-auto mb-6 text-primary opacity-40 animate-bounce" />
                            <h3 className="text-3xl font-serif skew-x-[-5deg] mb-4 uppercase">NO MISSIONS LOGGED</h3>
                            <p className="text-muted-foreground font-bold uppercase tracking-widest mb-10">YOUR STYLE JOURNEY AWAITS DEPLOYMENT.</p>
                            <Button className="manga-border h-16 px-12 text-xl font-black" onClick={() => setActiveView('services')}>
                              BOOK A MISSION
                            </Button>
                          </div>
                        ) : (
                          bookings.map((booking) => (
                            <Card key={booking.id} className="manga-card overflow-hidden group">
                              <div className="flex flex-col md:flex-row">
                                <div className="p-8 md:p-10 flex-1 relative">
                                  <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                    <Scissors className="h-32 w-32 -rotate-12" />
                                  </div>
                                  <div className="flex justify-between items-start mb-8">
                                    <div>
                                      <div className="flex items-center gap-4 mb-4">
                                        <div className="bg-primary text-black px-3 py-1 skew-x-[-10deg] font-black text-[10px] uppercase tracking-widest">
                                          {booking.status}
                                        </div>
                                        <span className="text-[10px] text-accent-pink font-black uppercase tracking-[0.3em]">
                                          {booking.type === 'home' ? '// HOME INVASION' : '// STUDIO SESSION'}
                                        </span>
                                      </div>
                                      <CardTitle className="text-4xl md:text-5xl font-serif mb-4 skew-x-[-5deg] group-hover:text-primary transition-colors">
                                        {SERVICES.find(s => s.id === booking.serviceId)?.name}
                                      </CardTitle>
                                      <div className="flex flex-wrap gap-6 text-sm font-black uppercase tracking-widest">
                                        <div className="flex items-center gap-2 bg-white/5 px-3 py-2 border border-white/10">
                                          <CalendarIcon className="h-4 w-4 text-primary" />
                                          {format(parseISO(booking.date), 'MMM do, yyyy')}
                                        </div>
                                        <div className="flex items-center gap-2 bg-white/5 px-3 py-2 border border-white/10">
                                          <Clock className="h-4 w-4 text-primary" />
                                          {booking.time}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <span className="text-3xl md:text-4xl font-black text-primary drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                                        ${SERVICES.find(s => s.id === booking.serviceId)?.price}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  {booking.type === 'home' && (booking.status === 'confirmed' || booking.status === 'in-progress') && (
                                    <motion.div 
                                      initial={{ opacity: 0, scale: 0.95 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      className="mt-8 pt-8 border-t-4 border-primary/20"
                                    >
                                      <div className="flex items-center justify-between mb-6">
                                        <h4 className="text-2xl font-serif skew-x-[-5deg] flex items-center gap-3">
                                          <Navigation className="h-6 w-6 text-primary animate-pulse" /> 
                                          LIVE TRACKING SIGNAL
                                        </h4>
                                        {booking.status === 'in-progress' ? (
                                          <div className="bg-green-500 text-black px-3 py-1 skew-x-[-10deg] font-black text-[10px] uppercase animate-pulse">
                                            EN ROUTE !!!
                                          </div>
                                        ) : (
                                          <div className="bg-muted text-muted-foreground px-3 py-1 skew-x-[-10deg] font-black text-[10px] uppercase">
                                            AWAITING SIGNAL
                                          </div>
                                        )}
                                      </div>
                                      <div className="brutalist-border overflow-hidden">
                                        <TrackingMap barberId={booking.barberId} bookingId={booking.id} />
                                      </div>
                                    </motion.div>
                                  )}
                                </div>
                                                              <div className="bg-muted p-10 md:p-14 flex flex-row md:flex-col justify-center gap-6 border-t-4 md:border-t-0 md:border-l-4 border-black w-full md:w-80">
                                  {booking.status === 'pending' && (
                                    <Button variant="outline" className="flex-1 md:flex-none h-16 rounded-none border-4 border-black text-black font-black uppercase hover:bg-black hover:text-white transition-all" onClick={() => updateBookingStatus(booking.id, 'cancelled')}>
                                      ABORT
                                    </Button>
                                  )}
                                  {booking.status === 'completed' && (
                                    <Button className="flex-1 md:flex-none h-16 rounded-none font-black uppercase brutalist-border bg-black text-white">REVIEW</Button>
                                  )}
                                  <Button variant="ghost" className="flex-1 md:flex-none h-16 rounded-none text-xs font-black uppercase tracking-widest hover:bg-black hover:text-white brutalist-border">DATA LOGS</Button>
                                </div>
                              </div>
                            </Card>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </section>
            </motion.div>
          )}

          {activeView === 'staff' && profile?.role === 'barber' && (
            <motion.div
              key="staff"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4 }}
            >
              {/* Staff Dashboard - Neo Brutalist Terminal Style */}
              <section className="py-12 md:py-32 relative overflow-hidden neo-grid">
                <div className="container mx-auto px-4 relative z-10">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-20 gap-10">
                    <div className="relative">
                      <div className="absolute -top-10 -left-10 text-black/5 text-[12rem] font-heading font-black select-none pointer-events-none">01</div>
                      <h2 className="text-6xl md:text-9xl font-heading font-black mb-4 text-black uppercase tracking-tighter">STAFF TERMINAL</h2>
                      <p className="text-black font-black uppercase tracking-[0.4em] text-sm border-l-8 border-accent-pink pl-6">MONITORING ACTIVE MISSIONS...</p>
                    </div>
                    <div className="flex items-center gap-8 w-full md:w-auto bg-white p-8 brutalist-border brutalist-shadow">
                      <div className="flex flex-col items-end mr-8">
                        <span className="text-xs font-black uppercase tracking-widest text-black/40">GPS SIGNAL</span>
                        <span className={`text-2xl font-black ${isTrackingActive ? 'text-green-500 animate-pulse' : 'text-accent-pink'}`}>
                          {isTrackingActive ? 'ONLINE' : 'OFFLINE'}
                        </span>
                      </div>
                      <Button 
                        size="lg" 
                        variant={isTrackingActive ? "destructive" : "default"}
                        className={`flex-1 md:flex-none h-20 px-12 text-2xl font-black brutalist-border ${isTrackingActive ? 'bg-accent-pink text-white' : 'bg-primary text-black'}`}
                        onClick={() => setIsTrackingActive(!isTrackingActive)}
                      >
                        {isTrackingActive ? 'ABORT JOURNEY' : 'START MISSION'}
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <Card className="lg:col-span-2 brutalist-card bg-white overflow-hidden">
                      <CardHeader className="border-b-4 border-black bg-primary p-8">
                        <CardTitle className="text-4xl font-heading font-black flex items-center gap-6 uppercase">
                          <Clock className="h-10 w-10 text-black" /> ACTIVE QUEUE
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <ScrollArea className="h-[600px] md:h-[700px]">
                          {isStaffBookingsLoading ? (
                            <div className="p-8 space-y-8">
                              {[1, 2, 3, 4].map((i) => (
                                <BrutalistSkeleton key={i} className="h-32 w-full" />
                              ))}
                            </div>
                          ) : staffBookings.length === 0 ? (
                            <div className="p-40 text-center">
                              <div className="text-5xl font-heading font-black text-black/10 mb-6 uppercase">NO TARGETS FOUND</div>
                              <p className="text-sm font-black uppercase tracking-[0.5em] text-black/40">SCANNING FOR NEW MISSIONS...</p>
                            </div>
                          ) : (
                            <div className="divide-y-4 divide-black/5">
                              {staffBookings.map((booking) => (
                                <div key={booking.id} className="p-8 md:p-12 hover:bg-primary/5 transition-all group">
                                  <div className="flex flex-col md:flex-row justify-between gap-10">
                                    <div className="flex gap-8">
                                      <div className="h-20 w-20 bg-black flex items-center justify-center brutalist-border -rotate-6 group-hover:rotate-0 transition-transform">
                                        <User className="h-10 w-10 text-primary" />
                                      </div>
                                      <div>
                                        <h4 className="text-4xl font-heading font-black group-hover:text-primary transition-colors uppercase">{SERVICES.find(s => s.id === booking.serviceId)?.name}</h4>
                                        <p className="text-lg font-black text-black/60 mb-6 uppercase tracking-widest">{booking.date} // {booking.time}</p>
                                        <div className="flex flex-wrap gap-4">
                                          <div className="bg-black text-white px-4 py-1 font-black text-xs uppercase brutalist-border">
                                            {booking.type}
                                          </div>
                                          <div className="bg-primary text-black px-4 py-1 font-black text-xs uppercase brutalist-border">
                                            {booking.status}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                      {booking.status === 'pending' && (
                                        <Button className="h-16 px-10 font-black uppercase brutalist-border bg-black text-white hover:bg-primary hover:text-black transition-all" onClick={() => updateBookingStatus(booking.id, 'confirmed')}>CONFIRM</Button>
                                      )}
                                      {booking.status === 'confirmed' && booking.type === 'home' && (
                                        <Button className="h-16 px-10 font-black uppercase brutalist-border bg-green-500 text-black" onClick={() => {
                                          updateBookingStatus(booking.id, 'in-progress');
                                          setIsTrackingActive(true);
                                        }}>DEPLOY</Button>
                                      )}
                                      {booking.status === 'in-progress' && (
                                        <Button className="h-16 px-10 font-black uppercase brutalist-border bg-accent-pink text-white" onClick={() => updateBookingStatus(booking.id, 'completed')}>FINISH</Button>
                                      )}
                                      <Button variant="ghost" className="h-16 px-8 font-black uppercase text-xs brutalist-border hover:bg-black hover:text-white transition-all">LOGS</Button>
                                    </div>
                                  </div>
                                  {booking.type === 'home' && (
                                    <div className="mt-10 p-6 bg-black text-primary brutalist-border flex items-center gap-6">
                                      <MapPin className="h-6 w-6" />
                                      <span className="font-mono text-lg font-black uppercase tracking-widest truncate">{booking.location?.address}</span>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </ScrollArea>
                      </CardContent>
                    </Card>

                    <div className="space-y-12">
                      <Card className="brutalist-card bg-white">
                        <CardHeader className="border-b-4 border-black bg-accent-pink text-white">
                          <CardTitle className="text-3xl font-heading font-black uppercase">SOCIAL INTEGRATION</CardTitle>
                        </CardHeader>
                        <CardContent className="p-10 space-y-8">
                          <div className="space-y-4">
                            <Label className="text-xs font-black uppercase tracking-widest">INSTAGRAM HANDLE</Label>
                            <div className="flex gap-4">
                              <Input 
                                placeholder="@username" 
                                className="brutalist-border rounded-none h-14 font-black"
                                defaultValue={profile?.role === 'barber' ? 'trimtime_official' : ''}
                              />
                              <Button className="h-14 px-8 brutalist-border bg-black text-white font-black">LINK</Button>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <Label className="text-xs font-black uppercase tracking-widest">FACEBOOK PAGE</Label>
                            <div className="flex gap-4">
                              <Input 
                                placeholder="page-url" 
                                className="brutalist-border rounded-none h-14 font-black"
                                defaultValue={profile?.role === 'barber' ? 'trimtime.grooming' : ''}
                              />
                              <Button className="h-14 px-8 brutalist-border bg-black text-white font-black">LINK</Button>
                            </div>
                          </div>
                          <div className="h-1 bg-black/10 halftone"></div>
                          <p className="text-[10px] font-black uppercase text-black/40 italic">
                            * DATA IS PULLED FROM PUBLIC VIEWERS TO ENSURE REAL-TIME UPDATES.
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="brutalist-card bg-white">
                        <CardHeader className="border-b-4 border-black bg-black text-white">
                          <CardTitle className="text-3xl font-heading font-black uppercase">PERFORMANCE LOGS</CardTitle>
                        </CardHeader>
                        <CardContent className="p-10 space-y-12">
                          <div className="flex justify-between items-end">
                            <span className="text-sm font-black uppercase tracking-widest text-black/40">DAILY REVENUE</span>
                            <span className="text-6xl font-black text-black bg-primary px-3 brutalist-border">$420</span>
                          </div>
                          <div className="flex justify-between items-end">
                            <span className="text-sm font-black uppercase tracking-widest text-black/40">EFFICIENCY</span>
                            <span className="text-6xl font-black text-white bg-black px-3 brutalist-border">94%</span>
                          </div>
                          <div className="h-2 bg-black/10 halftone"></div>
                          <div className="pt-6">
                            <span className="text-sm font-black uppercase tracking-widest text-black/40 block mb-8">SQUAD RATING</span>
                            <div className="flex items-center gap-3 mb-6">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} className="h-10 w-10 text-primary fill-primary brutalist-shadow" />
                              ))}
                            </div>
                            <span className="text-xl font-black uppercase tracking-widest italic text-black">4.9/5.0 // ELITE CLASS</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {activeView === 'home' && (
        <footer className="bg-black text-white py-24 hidden md:block">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-20 mb-24">
              <div className="md:col-span-2">
                <div className="flex items-center gap-4 mb-10">
                  <div className="h-12 w-12 bg-primary flex items-center justify-center brutalist-border -rotate-3">
                    <Scissors className="h-6 w-6 text-black" />
                  </div>
                  <span className="text-5xl font-heading font-black tracking-tighter uppercase">TrimTime</span>
                </div>
                <p className="text-white/60 text-xl font-bold max-w-md mb-12 leading-tight">
                  The modern standard for grooming. We bring the luxury of a premium barbershop experience wherever you are.
                </p>
                <div className="flex gap-6">
                  {['IG', 'FB', 'TW'].map(social => (
                    <div key={social} className="h-14 w-14 brutalist-border bg-white text-black flex items-center justify-center font-black hover:bg-primary transition-colors cursor-pointer">
                      {social}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm uppercase font-black mb-10 text-primary">Studio</h4>
                <ul className="space-y-6 text-lg font-bold">
                  <li>123 Barber Street</li>
                  <li>New York, NY 10001</li>
                  <li>+1 (555) 000-0000</li>
                  <li>hello@trimtime.com</li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm uppercase font-black mb-10 text-primary">Hours</h4>
                <ul className="space-y-6 text-lg font-bold">
                  <li>Mon - Fri: 09:00 - 20:00</li>
                  <li>Sat: 10:00 - 18:00</li>
                  <li>Sun: 11:00 - 16:00</li>
                </ul>
              </div>
            </div>
            <div className="h-1 bg-white/10 mb-12" />
            <div className="flex flex-col md:flex-row justify-between items-center gap-8 text-sm font-black uppercase tracking-widest text-white/40">
              <span>© 2024 TrimTime. All rights reserved.</span>
              <div className="flex gap-12">
                <span className="hover:text-primary cursor-pointer">Privacy Policy</span>
                <span className="hover:text-primary cursor-pointer">Terms of Service</span>
              </div>
            </div>
          </div>
        </footer>
      )}


      {/* Auth Modal - Neo Brutalist Style */}
      <Dialog open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen}>
        <DialogContent className="sm:max-w-[450px] text-center rounded-none border-4 border-black bg-white p-0 overflow-hidden brutalist-shadow-lg">
          <div className="bg-primary p-12 border-b-4 border-black">
            <div className="h-24 w-24 bg-white flex items-center justify-center mx-auto mb-8 brutalist-border -rotate-6">
              <Scissors className="h-12 w-12 text-black" />
            </div>
            <DialogTitle className="text-6xl font-heading font-black uppercase tracking-tighter leading-none">JOIN THE SQUAD</DialogTitle>
            <DialogDescription className="text-sm font-black text-black uppercase tracking-widest mt-4">
              UNLEASH YOUR STYLE POTENTIAL
            </DialogDescription>
          </div>
          <div className="p-12 relative bg-white">
            <div className="absolute inset-0 halftone opacity-10 pointer-events-none"></div>
            <Button className="w-full h-20 text-2xl rounded-none font-black brutalist-border bg-black text-white hover:bg-primary hover:text-black transition-all" onClick={handleSignIn}>
              LOGIN WITH GOOGLE
            </Button>
            <p className="text-xs text-black/40 uppercase font-black mt-8 italic">
              BY JOINING, YOU AGREE TO OUR ELITE TERMS.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Booking Dialog */}
      <BookingDialog 
        service={selectedService}
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        onConfirm={confirmBooking}
      />
    </div>
    </APIProvider>
  );
}
