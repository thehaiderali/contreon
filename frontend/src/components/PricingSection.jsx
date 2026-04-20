// PricingSection.tsx
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Check, CreditCard, Zap, ArrowRight, Star, Shield, Clock, Wallet, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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

export default function PricingSection() {
  const headerRef = useRef(null);
  const leftRef = useRef(null);
  const rightRef = useRef(null);

  const headerInView = useInView(headerRef, { once: true, margin: "-100px" });
  const leftInView = useInView(leftRef, { once: true, margin: "-100px" });
  const rightInView = useInView(rightRef, { once: true, margin: "-100px" });

  return (
    <section className="relative w-full overflow-hidden bg-background px-4 py-20 md:py-28">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      
      <div className="container mx-auto max-w-7xl">
        {/* Section Header */}
        <motion.div 
          ref={headerRef}
          className="mx-auto max-w-2xl text-center"
          initial="hidden"
          animate={headerInView ? "visible" : "hidden"}
          variants={fadeUp}
        >
          <Badge variant="outline" className="mb-6 gap-1 border-border/50 px-3 py-1 text-sm">
            <CreditCard className="h-3.5 w-3.5" />
            Simple Pricing
          </Badge>
          <h2 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
            You earn. We earn.
            <br />
            <span className="text-muted-foreground">Fair. Transparent. 10%.</span>
          </h2>
          <p className="mx-auto max-w-md text-muted-foreground">
            No monthly fees. Just a small cut of what you make. Powered by Stripe.
          </p>
        </motion.div>

        {/* Left + Right Grid */}
        <div className="mt-16 grid gap-12 lg:grid-cols-2 lg:gap-16 items-start">
          
          {/* LEFT: Explanation */}
          <motion.div 
            ref={leftRef}
            className="space-y-6"
            initial="hidden"
            animate={leftInView ? "visible" : "hidden"}
            variants={slideInLeft}
          >
            <div className="space-y-3">
              <Badge variant="secondary" className="gap-1 w-fit">
                <Zap className="h-3.5 w-3.5" />
                How it works
              </Badge>
              <h3 className="text-2xl font-bold">
                10% on every transaction.
              </h3>
              <p className="text-muted-foreground">
                We take 10% when your members pay you. That's it. No setup cost, 
                no monthly subscription, no hidden fees.
              </p>
            </div>

            <Card className="border-primary/20 bg-primary/5 p-4 transition-all hover:border-primary/40 duration-300">
              <div className="flex gap-3">
                <div className="rounded-full bg-primary/10 p-2 h-fit">
                  <Coins className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Start earning immediately</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    No Stripe onboarding required to start. We hold your funds safely until you complete your payout setup.
                  </p>
                </div>
              </div>
            </Card>

            <div className="space-y-3">
              <p className="text-sm font-medium">How it works:</p>
              <div className="space-y-3">
                {[
                  { num: 1, title: "Sign up & start creating", desc: "No Stripe account needed. Just set up your page and publish content." },
                  { num: 2, title: "Get paid by members", desc: "Your earnings accumulate safely in your platform wallet." },
                  { num: 3, title: "Complete Stripe onboarding", desc: "Takes 5 minutes. Then withdraw your pending earnings anytime." }
                ].map((step) => (
                  <div key={step.num} className="flex gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border text-xs font-medium">
                      {step.num}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{step.title}</p>
                      <p className="text-xs text-muted-foreground">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <p className="text-sm font-medium">Why creators choose us:</p>
              <div className="space-y-1.5">
                {[
                  "No monthly fee — most platforms charge $29+/month",
                  "All features included — text, audio, video, analytics",
                  "Start earning before finishing paperwork"
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* RIGHT: Pricing Card Preview */}
          <motion.div 
            ref={rightRef}
            initial="hidden"
            animate={rightInView ? "visible" : "hidden"}
            variants={slideInRight}
          >
            <Card className="relative overflow-hidden border-primary/20 bg-card shadow-xl transition-all hover:shadow-2xl hover:scale-[1.02] duration-300">
              <div className="absolute -right-16 -top-16 h-32 w-32 rounded-full bg-primary/5 blur-2xl" />
              
              <div className="p-6 md:p-8">
                <div className="mb-4 flex items-center justify-between">
                  <Badge className="bg-primary text-primary-foreground gap-1">
                    <Star className="h-3 w-3" /> Most Popular
                  </Badge>
                  <span className="text-xs text-muted-foreground">Cancel anytime</span>
                </div>
                
                <div className="mb-4">
                  <h3 className="text-2xl font-bold">Creator Plan</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-5xl font-bold">10%</span>
                    <span className="text-muted-foreground">per transaction</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Stripe fees included. What you see is what you pay.
                  </p>
                </div>

                <div className="mb-6 rounded-lg bg-muted/20 p-4">
                  <p className="mb-2 text-sm font-medium">Example:</p>
                  <div className="flex justify-between text-sm">
                    <span>Member pays $10</span>
                    <span className="font-mono text-primary">You get $9</span>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    On Patreon: you'd get ~$8.20
                  </p>
                </div>

                <div className="mb-6 flex items-center gap-2 rounded-lg border border-border/50 bg-muted/10 px-3 py-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">
                    Start earning before Stripe setup. We hold funds until you're ready to withdraw.
                  </p>
                </div>

                <Button className="w-full gap-2 transition-all hover:gap-3 duration-300">
                  Start earning now <ArrowRight className="h-4 w-4" />
                </Button>
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  Free to sign up • No Stripe account needed to start
                </p>
              </div>
            </Card>

            <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Shield className="h-3 w-3" /> Funds held securely
              </span>
              <span className="flex items-center gap-1">
                <Wallet className="h-3 w-3" /> Payout when ready
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}