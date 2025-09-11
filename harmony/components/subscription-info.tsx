"use client";

import { useAuth } from "@clerk/clerk-react";
import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import { useRouter } from "next/navigation";
import { useSidebar } from "@/components/sidebar";
import { RiVipCrownLine, RiStarLine, RiGraduationCapLine, RiTeamLine, RiCodeLine } from "@remixicon/react";

export function SubscriptionInfo() {
  const { has, isLoaded } = useAuth();
  const { state } = useSidebar();
  const router = useRouter();

  if (!isLoaded) {
    return (
      <div className="px-3 py-2">
        <div className="bg-sidebar-accent/50 rounded-lg p-3 border border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-sidebar-foreground/20 animate-pulse rounded"></div>
            {state !== "collapsed" && (
              <div className="w-16 h-4 bg-sidebar-foreground/20 animate-pulse rounded"></div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Check for different plans based on the Clerk dashboard configuration
  const hasProPlan = has({ plan: 'pro' });
  const hasEducationPlan = has({ plan: 'education_plan' });
  const hasApiPlan = has({ plan: 'api_plan' });

  const planInfo = {
    free: {
      name: 'Free Harmony',
      icon: RiTeamLine,
      color: 'text-white border',
      description: ''
    },
    pro: {
      name: 'Pro Harmony',
      icon: RiVipCrownLine,
      color: 'text-white border',
      description: ''
    },
    education: {
      name: 'Education Plan',
      icon: RiGraduationCapLine,
      color: 'text-white border',
      description: ''
    },
    api: {
      name: 'API Plan',
      icon: RiCodeLine,
      color: 'text-white border',
      description: ''
    }
  };

  // Determine current plan based on Clerk's plan check
  let currentPlan = planInfo.free;
  let planKey = 'free';

  if (hasApiPlan) {
    currentPlan = planInfo.api;
    planKey = 'api';
  } else if (hasProPlan) {
    currentPlan = planInfo.pro;
    planKey = 'pro';
  } else if (hasEducationPlan) {
    currentPlan = planInfo.education;
    planKey = 'education';
  }

  const Icon = currentPlan.icon;

  // If collapsed, show minimal view with plan text
  if (state === "collapsed") {
    const planText = planKey === 'education' ? 'Edu' : planKey.charAt(0).toUpperCase() + planKey.slice(1);
    return (
      <div className="px-3 py-2">
        <div className="bg-sidebar-accent/50 rounded-lg p-2 border border-sidebar-border flex items-center justify-center min-h-[40px]" title={currentPlan.name}>
          <span className="text-[10px] font-bold text-sidebar-foreground/70 uppercase tracking-wider leading-none text-center">
            {planText}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 py-2">
      <div className="bg-sidebar-accent/50 rounded-lg p-3 border border-sidebar-border">
        <div className="flex items-center gap-2 mb-1">
          <Icon size={16} className="text-sidebar-foreground/70" />
          <span className="text-xs font-medium text-sidebar-foreground/70 uppercase tracking-wide">
            Current Plan
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <Badge 
              variant="outline" 
              className={`${currentPlan.color} font-medium`}
            >
              {currentPlan.name}
            </Badge>
            <p className="text-xs text-sidebar-foreground/60 mt-1">
              {currentPlan.description}
            </p>
          </div>
          
          {planKey === 'free' && (
            <Button
              size="sm"
              variant="ghost"
              className="text-xs h-7 px-2"
              onClick={() => router.push('/prices')}
            >
              Upgrade
            </Button>
          )}
        </div>

        {planKey !== 'free' && (
          <div className="mt-1 pt-2 border-t border-sidebar-border/50">
            <p className="text-xs text-sidebar-foreground/60">
              Active subscription
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
