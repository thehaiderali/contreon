// // FeaturesSection.tsx
// import { motion, useInView } from 'motion/react';
// import { useRef } from 'react';
// import { Play, Headphones, FileText, Lock, Unlock, Sparkles, Upload, ArrowRight } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Card } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// import { Progress } from '@/components/ui/progress';

// const fadeUp = {
//   hidden: { opacity: 0, y: 30 },
//   visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
// };

// const slideInLeft = {
//   hidden: { opacity: 0, x: -40 },
//   visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } }
// };

// const slideInRight = {
//   hidden: { opacity: 0, x: 40 },
//   visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } }
// };

// export default function FeaturesSection() {
//   const headerRef = useRef(null);
//   const feature1Ref = useRef(null);
//   const feature2Ref = useRef(null);
//   const feature3Ref = useRef(null);
//   const ctaRef = useRef(null);

//   const headerInView = useInView(headerRef, { once: true, margin: "-100px" });
//   const feature1InView = useInView(feature1Ref, { once: true, margin: "-100px" });
//   const feature2InView = useInView(feature2Ref, { once: true, margin: "-100px" });
//   const feature3InView = useInView(feature3Ref, { once: true, margin: "-100px" });
//   const ctaInView = useInView(ctaRef, { once: true, margin: "-100px" });

//   return (
//     <section className="relative w-full overflow-hidden bg-background px-4 py-12 md:py-20 lg:py-28">
//       <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      
//       <div className="container mx-auto max-w-7xl">
//         {/* Header */}
//         <motion.div 
//           ref={headerRef}
//           className="mx-auto max-w-3xl text-center"
//           initial="hidden"
//           animate={headerInView ? "visible" : "hidden"}
//           variants={fadeUp}
//         >
//           <Badge variant="outline" className="mb-6 gap-1 border-border/50 px-3 py-1 text-sm font-medium">
//             <Sparkles className="h-3.5 w-3.5" />
//             All-in-One Creator Platform
//           </Badge>
//           <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
//             Create{' '}
//             <span className="relative inline-block">
//               <span className="relative z-10 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
//                 Rich
//               </span>
//             </span>{' '}
//             Content That Connects
//           </h1>
//           <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground">
//             Text, audio, video — all in one place. Engage your audience with
//             Notion-style editing, podcast uploads, and flexible member-only content.
//           </p>
//           <div className="flex flex-wrap items-center justify-center gap-4">
//             <Button size="lg" className="px-8">
//               Start Creating
//             </Button>
//             <Button size="lg" variant="outline" className="px-8">
//               View Demo
//             </Button>
//           </div>
//         </motion.div>

//         {/* Feature 1 */}
//         <motion.div 
//           ref={feature1Ref}
//           className="mt-24 scroll-mt-20"
//           initial="hidden"
//           animate={feature1InView ? "visible" : "hidden"}
//           variants={fadeUp}
//         >
//           <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">
//             <motion.div className="space-y-4" variants={slideInLeft}>
//               <Badge variant="secondary" className="gap-1 w-fit">
//                 <FileText className="h-3.5 w-3.5" />
//                 Rich Text Editor
//               </Badge>
//               <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
//                 Write like never before.
//                 <br />
//                 <span className="text-muted-foreground">Notion-style editing.</span>
//               </h2>
//               <p className="text-muted-foreground">
//                 Our powerful rich text editor gives you the flexibility of Notion
//                 right inside your creator dashboard.
//               </p>
//               <ul className="space-y-2">
//                 <li className="flex items-center gap-2 text-sm">
//                   <div className="h-1.5 w-1.5 rounded-full bg-primary" />
//                   <span>Slash commands for instant block insertion</span>
//                 </li>
//                 <li className="flex items-center gap-2 text-sm">
//                   <div className="h-1.5 w-1.5 rounded-full bg-primary" />
//                   <span>Embed images, videos, tweets, and code blocks</span>
//                 </li>
//                 <li className="flex items-center gap-2 text-sm">
//                   <div className="h-1.5 w-1.5 rounded-full bg-primary" />
//                   <span>Drag-and-drop to rearrange content blocks</span>
//                 </li>
//               </ul>
//             </motion.div>

//             <motion.div variants={slideInRight}>
//               <Card className="overflow-hidden border-border/50 bg-card/50 shadow-xl backdrop-blur-sm transition-all hover:shadow-2xl hover:scale-[1.02] duration-300">
//                 <div className="border-b border-border/50 bg-muted/30 px-4 py-3">
//                   <div className="flex items-center gap-2">
//                     <div className="flex gap-1.5">
//                       <div className="h-3 w-3 rounded-full bg-red-500/70" />
//                       <div className="h-3 w-3 rounded-full bg-yellow-500/70" />
//                       <div className="h-3 w-3 rounded-full bg-green-500/70" />
//                     </div>
//                     <span className="ml-2 text-xs font-medium text-muted-foreground">
//                       Rich Text Editor — Notion Style
//                     </span>
//                   </div>
//                 </div>
//                 <div className="p-6">
//                   <div className=" mb-4 overflow-hidden rounded-lg bg-muted/20">
//                     <div className=" w-full bg-gradient-to-br from-muted/30 to-muted/10 flex items-center justify-center border border-dashed border-border/50 rounded-lg">
//                       <div className="text-center">
//                         <FileText className="mx-auto h-10 w-10 text-muted-foreground/50" />
//                         {/* <p className="mt-2 text-sm text-muted-foreground">Screenshot: Rich Text Editor</p> */}
//                       <video src="https://www.blocknotejs.org/video/blocknote-explainer.mp4"   playsInline muted  loop autoPlay ></video>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="space-y-3">
//                     <div className="flex items-center gap-2">
//                       <div className="h-8 w-8 rounded-full bg-muted" />
//                       <div>
//                         <p className="text-sm font-medium">Creator Name</p>
//                         <p className="text-xs text-muted-foreground">Just now</p>
//                       </div>
//                     </div>
//                     <div className="prose prose-sm dark:prose-invert max-w-none">
//                       <h3 className="text-xl font-semibold">The future of creator economy</h3>
//                       <p className="text-muted-foreground">
//                         With our platform, you can write compelling posts, upload high-quality audio,
//                         and share stunning videos — all in one seamless workflow.
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </Card>
//             </motion.div>
//           </div>
//         </motion.div>

//         {/* Feature 2 */}
//         <motion.div 
//           ref={feature2Ref}
//           className="mt-32 scroll-mt-20"
//           initial="hidden"
//           animate={feature2InView ? "visible" : "hidden"}
//           variants={fadeUp}
//         >
//           <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">
//             <motion.div className="order-2 lg:order-1 space-y-4" variants={slideInLeft}>
//               <Badge variant="secondary" className="gap-1 w-fit">
//                 <Headphones className="h-3.5 w-3.5" />
//                 Audio Posts
//               </Badge>
//               <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
//                 Your voice, transcribed.
//                 <br />
//                 <span className="text-muted-foreground">Podcast-style uploads.</span>
//               </h2>
//               <p className="text-muted-foreground">
//                 Upload your audio episodes — no recording needed. We automatically
//                 generate transcripts and sync text with playback.
//               </p>
//               <ul className="space-y-2">
//                 <li className="flex items-center gap-2 text-sm">
//                   <div className="h-1.5 w-1.5 rounded-full bg-primary" />
//                   <span>Upload MP3, WAV, or M4A files</span>
//                 </li>
//                 <li className="flex items-center gap-2 text-sm">
//                   <div className="h-1.5 w-1.5 rounded-full bg-primary" />
//                   <span>Auto-generated transcripts with speaker detection</span>
//                 </li>
//                 <li className="flex items-center gap-2 text-sm">
//                   <div className="h-1.5 w-1.5 rounded-full bg-primary" />
//                   <span>Click any transcript line to jump in the audio</span>
//                 </li>
//               </ul>
//             </motion.div>

//             <motion.div className="order-1 lg:order-2" variants={slideInRight}>
//               <Card className="overflow-hidden border-border/50 bg-card/50 shadow-xl transition-all hover:shadow-2xl hover:scale-[1.02] duration-300">
//                 <div className="border-b border-border/50 bg-muted/30 px-4 py-3">
//                   <div className="flex items-center gap-2">
//                     <div className="flex gap-1.5">
//                       <div className="h-3 w-3 rounded-full bg-red-500/70" />
//                       <div className="h-3 w-3 rounded-full bg-yellow-500/70" />
//                       <div className="h-3 w-3 rounded-full bg-green-500/70" />
//                     </div>
//                     <span className="ml-2 text-xs font-medium text-muted-foreground">
//                       Audio Player with Live Transcript
//                     </span>
//                   </div>
//                 </div>
//                 <div className="p-6">
//                   <div className="relative mb-4 overflow-hidden rounded-lg bg-muted/20">
//                     <div className="aspect-video w-full bg-gradient-to-br from-muted/30 to-muted/10 flex items-center justify-center border border-dashed border-border/50 rounded-lg">
//                       <div className="text-center">
//                         <Upload className="mx-auto h-10 w-10 text-muted-foreground/50" />
//                         <p className="mt-2 text-sm text-muted-foreground">Screenshot: Audio Upload & Transcript</p>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="mb-4 flex items-center justify-between">
//                     <div className="flex items-center gap-3">
//                       <Avatar className="h-10 w-10">
//                         <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop" />
//                         <AvatarFallback>CR</AvatarFallback>
//                       </Avatar>
//                       <div>
//                         <p className="font-medium">Deep Dive Podcast</p>
//                         <p className="text-xs text-muted-foreground">Episode 42 • 24 min</p>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="mb-4 rounded-lg bg-muted/20 p-4">
//                     <div className="mb-3 flex items-center justify-between">
//                       <div className="flex items-center gap-3">
//                         <Button size="icon" variant="outline" className="h-10 w-10 rounded-full">
//                           <Play className="h-4 w-4" />
//                         </Button>
//                         <div>
//                           <p className="text-sm font-medium">The Creative Process</p>
//                           <p className="text-xs text-muted-foreground">How ideas become reality</p>
//                         </div>
//                       </div>
//                       <span className="text-sm text-muted-foreground">12:34 / 24:18</span>
//                     </div>
//                     <Progress value={52} className="h-1.5" />
//                   </div>
//                   <div className="space-y-2">
//                     <div className="flex items-center gap-2">
//                       <Badge variant="secondary" className="text-xs">Live Transcript</Badge>
//                       <span className="text-xs text-muted-foreground">Click any line to jump</span>
//                     </div>
//                     <div className="max-h-36 overflow-y-auto rounded-lg border border-border/50 bg-muted/10 p-3">
//                       <p className="text-sm">
//                         <span className="rounded bg-primary/20 px-1 font-medium text-primary">
//                           So the key insight here
//                         </span>{' '}
//                         is that creators need a unified platform for audio content.
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </Card>
//             </motion.div>
//           </div>
//         </motion.div>

//         {/* Feature 3 */}
//         <motion.div 
//           ref={feature3Ref}
//           className="mt-32 scroll-mt-20"
//           initial="hidden"
//           animate={feature3InView ? "visible" : "hidden"}
//           variants={fadeUp}
//         >
//           <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">
//             <motion.div className="space-y-4" variants={slideInLeft}>
//               <Badge variant="secondary" className="gap-1 w-fit">
//                 <Play className="h-3.5 w-3.5" />
//                 Video Library
//               </Badge>
//               <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
//                 Control who sees what.
//                 <br />
//                 <span className="text-muted-foreground">Public or members-only.</span>
//               </h2>
//               <p className="text-muted-foreground">
//                 Upload videos and set visibility per video. Free teasers for everyone,
//                 exclusive tutorials for paid members.
//               </p>
//               <ul className="space-y-2">
//                 <li className="flex items-center gap-2 text-sm">
//                   <div className="h-1.5 w-1.5 rounded-full bg-primary" />
//                   <span>Upload MP4, MOV, or web-ready formats</span>
//                 </li>
//                 <li className="flex items-center gap-2 text-sm">
//                   <div className="h-1.5 w-1.5 rounded-full bg-primary" />
//                   <span>Toggle between Public / Members Only per video</span>
//                 </li>
//                 <li className="flex items-center gap-2 text-sm">
//                   <div className="h-1.5 w-1.5 rounded-full bg-primary" />
//                   <span>Custom thumbnails and video chapters</span>
//                 </li>
//               </ul>
//             </motion.div>

//             <motion.div variants={slideInRight}>
//               <Card className="overflow-hidden border-border/50 bg-card/50 shadow-xl transition-all hover:shadow-2xl hover:scale-[1.02] duration-300">
//                 <div className="border-b border-border/50 bg-muted/30 px-4 py-3">
//                   <div className="flex items-center gap-2">
//                     <div className="flex gap-1.5">
//                       <div className="h-3 w-3 rounded-full bg-red-500/70" />
//                       <div className="h-3 w-3 rounded-full bg-yellow-500/70" />
//                       <div className="h-3 w-3 rounded-full bg-green-500/70" />
//                     </div>
//                     <span className="ml-2 text-xs font-medium text-muted-foreground">
//                       Video Library — Public & Private Access
//                     </span>
//                   </div>
//                 </div>
//                 <div className="p-6">
//                   <div className="relative mb-4 overflow-hidden rounded-lg bg-muted/20">
//                     <div className="aspect-video w-full bg-gradient-to-br from-muted/30 to-muted/10 flex items-center justify-center border border-dashed border-border/50 rounded-lg">
//                       <div className="text-center">
//                         <div className="flex items-center justify-center gap-2">
//                           <Unlock className="h-5 w-5 text-muted-foreground/50" />
//                           <Lock className="h-5 w-5 text-muted-foreground/50" />
//                         </div>
//                         <p className="mt-2 text-sm text-muted-foreground">Screenshot: Video Management</p>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="grid gap-3 sm:grid-cols-2">
//                     <div className="rounded-lg border border-border/50 bg-muted/10 p-3">
//                       <div className="aspect-video bg-muted/30 rounded-md flex items-center justify-center mb-2">
//                         <Play className="h-6 w-6 text-muted-foreground/50" />
//                       </div>
//                       <div className="flex items-center justify-between">
//                         <p className="text-sm font-medium">Introduction (Free)</p>
//                         <Badge variant="secondary" className="gap-1 text-xs">
//                           <Unlock className="h-3 w-3" /> Public
//                         </Badge>
//                       </div>
//                     </div>
//                     <div className="rounded-lg border border-border/50 bg-muted/10 p-3">
//                       <div className="aspect-video bg-muted/30 rounded-md flex items-center justify-center mb-2">
//                         <Lock className="h-6 w-6 text-muted-foreground/50" />
//                       </div>
//                       <div className="flex items-center justify-between">
//                         <p className="text-sm font-medium">Advanced Techniques</p>
//                         <Badge variant="default" className="gap-1 bg-primary text-primary-foreground text-xs">
//                           <Lock className="h-3 w-3" /> Members Only
//                         </Badge>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </Card>
//             </motion.div>
//           </div>
//         </motion.div>

//         {/* CTA */}
//         <motion.div 
//           ref={ctaRef}
//           className="mt-32 text-center"
//           initial="hidden"
//           animate={ctaInView ? "visible" : "hidden"}
//           variants={fadeUp}
//         >
//           <div className="rounded-2xl border border-border/50 bg-muted/10 px-6 py-12 sm:px-12 transition-all hover:border-border duration-300">
//             <h3 className="text-2xl font-bold sm:text-3xl">Ready to start creating?</h3>
//             <p className="mx-auto mt-3 max-w-md text-muted-foreground">
//               Join creators who are already using our platform to share text, audio, and video.
//             </p>
//             <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
//               <Button size="lg" className="px-8">
//                 Get Started Free
//               </Button>
//               <Button size="lg" variant="outline" className="px-8">
//                 See Pricing
//               </Button>
//             </div>
//           </div>
//         </motion.div>
//       </div>
//     </section>
//   );
// }

// FeaturesSection.tsx
import { motion, useInView } from 'motion/react';
import { useRef } from 'react';
import { Play, Headphones, FileText, Lock, Unlock, Sparkles, Upload, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const slideInLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const slideInRight = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

export default function FeaturesSection() {
  const headerRef = useRef(null);
  const feature1Ref = useRef(null);
  const feature2Ref = useRef(null);
  const feature3Ref = useRef(null);
  const ctaRef = useRef(null);

  const headerInView = useInView(headerRef, { once: true, margin: "-100px" });
  const feature1InView = useInView(feature1Ref, { once: true, margin: "-100px" });
  const feature2InView = useInView(feature2Ref, { once: true, margin: "-100px" });
  const feature3InView = useInView(feature3Ref, { once: true, margin: "-100px" });
  const ctaInView = useInView(ctaRef, { once: true, margin: "-100px" });

  return (
    <section className="relative w-full overflow-hidden bg-background px-4 py-12 md:py-20 lg:py-28">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <motion.div 
          ref={headerRef}
          className="mx-auto max-w-3xl text-center"
          initial="hidden"
          animate={headerInView ? "visible" : "hidden"}
          variants={fadeUp}
        >
          <Badge variant="outline" className="mb-6 gap-1 border-border/50 px-3 py-1 text-sm font-medium">
            <Sparkles className="h-3.5 w-3.5" />
            All-in-One Creator Platform
          </Badge>
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Create{' '}
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Rich
              </span>
            </span>{' '}
            Content That Connects
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground">
            Text, audio, video — all in one place. Engage your audience with
            Notion-style editing, podcast uploads, and flexible member-only content.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button size="lg" className="px-8">
              Start Creating
            </Button>
            <Button size="lg" variant="outline" className="px-8">
              View Demo
            </Button>
          </div>
        </motion.div>

        {/* Feature 1 */}
        <motion.div 
          ref={feature1Ref}
          className="mt-24 scroll-mt-20"
          initial="hidden"
          animate={feature1InView ? "visible" : "hidden"}
          variants={fadeUp}
        >
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">
            <motion.div className="space-y-4" variants={slideInLeft}>
              <Badge variant="secondary" className="gap-1 w-fit">
                <FileText className="h-3.5 w-3.5" />
                Rich Text Editor
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Write like never before.
                <br />
                <span className="text-muted-foreground">Notion-style editing.</span>
              </h2>
              <p className="text-muted-foreground">
                Our powerful rich text editor gives you the flexibility of Notion
                right inside your creator dashboard.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>Slash commands for instant block insertion</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>Embed images, videos, tweets, and code blocks</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>Drag-and-drop to rearrange content blocks</span>
                </li>
              </ul>
            </motion.div>

            <motion.div variants={slideInRight}>
              <Card className="overflow-hidden border-border/50 bg-card/50 shadow-xl backdrop-blur-sm transition-all hover:shadow-2xl hover:scale-[1.02] duration-300">
                <div className="border-b border-border/50 bg-muted/30 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="h-3 w-3 rounded-full bg-red-500/70" />
                      <div className="h-3 w-3 rounded-full bg-yellow-500/70" />
                      <div className="h-3 w-3 rounded-full bg-green-500/70" />
                    </div>
                    <span className="ml-2 text-xs font-medium text-muted-foreground">
                      Rich Text Editor — Notion Style
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="mb-4 overflow-hidden rounded-lg bg-muted/20">
                    <div className="w-full bg-gradient-to-br from-muted/30 to-muted/10 flex items-center justify-center border border-dashed border-border/50 rounded-lg aspect-video">
                      <img
                        src="https://k4uue95m41.ufs.sh/f/9BtxSY0VkYIizcrVfKUXkoKQPr70HIx4LAO26V5dpgyJjNYw"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-muted" />
                      <div>
                        <p className="text-sm font-medium">Creator Name</p>
                        <p className="text-xs text-muted-foreground">Just now</p>
                      </div>
                    </div>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <h3 className="text-xl font-semibold">The future of creator economy</h3>
                      <p className="text-muted-foreground">
                        With our platform, you can write compelling posts, upload high-quality audio,
                        and share stunning videos — all in one seamless workflow.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </motion.div>

        {/* Feature 2 */}
        <motion.div 
          ref={feature2Ref}
          className="mt-32 scroll-mt-20"
          initial="hidden"
          animate={feature2InView ? "visible" : "hidden"}
          variants={fadeUp}
        >
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">
            <motion.div className="order-2 lg:order-1 space-y-4" variants={slideInLeft}>
              <Badge variant="secondary" className="gap-1 w-fit">
                <Headphones className="h-3.5 w-3.5" />
                Audio Posts
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Your voice, transcribed.
                <br />
                <span className="text-muted-foreground">Podcast-style uploads.</span>
              </h2>
              <p className="text-muted-foreground">
                Upload your audio episodes — no recording needed. We automatically
                generate transcripts and sync text with playback.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>Upload MP3, WAV, or M4A files</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>Auto-generated transcripts with speaker detection</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>Click any transcript line to jump in the audio</span>
                </li>
              </ul>
            </motion.div>

            <motion.div className="order-1 lg:order-2" variants={slideInRight}>
              <Card className="overflow-hidden border-border/50 bg-card/50 shadow-xl transition-all hover:shadow-2xl hover:scale-[1.02] duration-300">
                <div className="border-b border-border/50 bg-muted/30 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="h-3 w-3 rounded-full bg-red-500/70" />
                      <div className="h-3 w-3 rounded-full bg-yellow-500/70" />
                      <div className="h-3 w-3 rounded-full bg-green-500/70" />
                    </div>
                    <span className="ml-2 text-xs font-medium text-muted-foreground">
                      Audio Player with Live Transcript
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="relative mb-4 overflow-hidden rounded-lg bg-muted/20">
                    <div className="aspect-video w-full bg-gradient-to-br from-muted/30 to-muted/10 flex items-center justify-center border border-dashed border-border/50 rounded-lg">
                      <div className="text-center">
                        <Upload className="mx-auto h-10 w-10 text-muted-foreground/50" />
                        <p className="mt-2 text-sm text-muted-foreground">Screenshot: Audio Upload & Transcript</p>
                      </div>
                    </div>
                  </div>
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop" />
                        <AvatarFallback>CR</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">Deep Dive Podcast</p>
                        <p className="text-xs text-muted-foreground">Episode 42 • 24 min</p>
                      </div>
                    </div>
                  </div>
                  <div className="mb-4 rounded-lg bg-muted/20 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Button size="icon" variant="outline" className="h-10 w-10 rounded-full">
                          <Play className="h-4 w-4" />
                        </Button>
                        <div>
                          <p className="text-sm font-medium">The Creative Process</p>
                          <p className="text-xs text-muted-foreground">How ideas become reality</p>
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">12:34 / 24:18</span>
                    </div>
                    <Progress value={52} className="h-1.5" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">Live Transcript</Badge>
                      <span className="text-xs text-muted-foreground">Click any line to jump</span>
                    </div>
                    <div className="max-h-36 overflow-y-auto rounded-lg border border-border/50 bg-muted/10 p-3">
                      <p className="text-sm">
                        <span className="rounded bg-primary/20 px-1 font-medium text-primary">
                          So the key insight here
                        </span>{' '}
                        is that creators need a unified platform for audio content.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </motion.div>

        {/* Feature 3 */}
        <motion.div 
          ref={feature3Ref}
          className="mt-32 scroll-mt-20"
          initial="hidden"
          animate={feature3InView ? "visible" : "hidden"}
          variants={fadeUp}
        >
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">
            <motion.div className="space-y-4" variants={slideInLeft}>
              <Badge variant="secondary" className="gap-1 w-fit">
                <Play className="h-3.5 w-3.5" />
                Video Library
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Control who sees what.
                <br />
                <span className="text-muted-foreground">Public or members-only.</span>
              </h2>
              <p className="text-muted-foreground">
                Upload videos and set visibility per video. Free teasers for everyone,
                exclusive tutorials for paid members.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>Upload MP4, MOV, or web-ready formats</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>Toggle between Public / Members Only per video</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>Custom thumbnails and video chapters</span>
                </li>
              </ul>
            </motion.div>

            <motion.div variants={slideInRight}>
              <Card className="overflow-hidden border-border/50 bg-card/50 shadow-xl transition-all hover:shadow-2xl hover:scale-[1.02] duration-300">
                <div className="border-b border-border/50 bg-muted/30 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="h-3 w-3 rounded-full bg-red-500/70" />
                      <div className="h-3 w-3 rounded-full bg-yellow-500/70" />
                      <div className="h-3 w-3 rounded-full bg-green-500/70" />
                    </div>
                    <span className="ml-2 text-xs font-medium text-muted-foreground">
                      Video Library — Public & Private Access
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="relative mb-4 overflow-hidden rounded-lg bg-muted/20">
                    <div className="aspect-video w-full bg-gradient-to-br from-muted/30 to-muted/10 flex items-center justify-center border border-dashed border-border/50 rounded-lg">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Unlock className="h-5 w-5 text-muted-foreground/50" />
                          <Lock className="h-5 w-5 text-muted-foreground/50" />
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">Screenshot: Video Management</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border border-border/50 bg-muted/10 p-3">
                      <div className="aspect-video bg-muted/30 rounded-md flex items-center justify-center mb-2">
                        <Play className="h-6 w-6 text-muted-foreground/50" />
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">Introduction (Free)</p>
                        <Badge variant="secondary" className="gap-1 text-xs">
                          <Unlock className="h-3 w-3" /> Public
                        </Badge>
                      </div>
                    </div>
                    <div className="rounded-lg border border-border/50 bg-muted/10 p-3">
                      <div className="aspect-video bg-muted/30 rounded-md flex items-center justify-center mb-2">
                        <Lock className="h-6 w-6 text-muted-foreground/50" />
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">Advanced Techniques</p>
                        <Badge variant="default" className="gap-1 bg-primary text-primary-foreground text-xs">
                          <Lock className="h-3 w-3" /> Members Only
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div 
          ref={ctaRef}
          className="mt-32 text-center"
          initial="hidden"
          animate={ctaInView ? "visible" : "hidden"}
          variants={fadeUp}
        >
          <div className="rounded-2xl border border-border/50 bg-muted/10 px-6 py-12 sm:px-12 transition-all hover:border-border duration-300">
            <h3 className="text-2xl font-bold sm:text-3xl">Ready to start creating?</h3>
            <p className="mx-auto mt-3 max-w-md text-muted-foreground">
              Join creators who are already using our platform to share text, audio, and video.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
              <Button size="lg" className="px-8">
                Get Started Free
              </Button>
              <Button size="lg" variant="outline" className="px-8">
                See Pricing
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}